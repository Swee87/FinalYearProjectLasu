import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser, Logout } from "../services/authApi";
import { setCredentials, clearCredentials } from "../redux/authSlice";

export const AuthInitializer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRehydrated = useSelector((state) => state._persist?.rehydrated);

  useEffect(() => {
    let expirationTimer;
    let checkInterval;
    let refreshInterval;

    const forceLogout = async () => {
      try {
        await Logout();
      } finally {
        // Clear all auth-related storage
        dispatch(clearCredentials());
        localStorage.removeItem('persist:auth');
        sessionStorage.clear();
        
        // Redirect if not already on login
        if (!window.location.pathname.startsWith('/login')) {
          navigate('/login', { 
            replace: true,
            state: { 
              from: 'session_expired',
              timestamp: Date.now()
            } 
          });
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const response = await fetchCurrentUser();
        
        if (!response?.user) {
          await forceLogout();
          return;
        }

        dispatch(setCredentials({ user: response.user }));

        // Calculate remaining time until expiration (1 minute)
        const issuedAt = response.user.token?.iat * 1000 || Date.now();
        const elapsed = Date.now() - issuedAt;
        const remainingTime = Math.max(0, 60000 - elapsed);
        
        // Set logout timer
        expirationTimer = setTimeout(forceLogout, remainingTime);

        // Set up token refresh (10 seconds before expiration)
        if (remainingTime > 10000) {
          refreshInterval = setTimeout(async () => {
            try {
              await refreshToken();
              // Re-initialize auth with new token
              initializeAuth();
            } catch (error) {
              await forceLogout();
            }
          }, remainingTime - 10000);
        }

        // Health check every 15 seconds
        checkInterval = setInterval(async () => {
          try {
            await fetchCurrentUser();
          } catch (error) {
            clearInterval(checkInterval);
            await forceLogout();
          }
        }, 15000);

      } catch (error) {
        if (error.message.includes('expired')) {
          // Attempt one refresh if token just expired
          try {
            await refreshToken();
            initializeAuth(); // Reinitialize with new token
          } catch {
            await forceLogout();
          }
        } else {
          await forceLogout();
        }
      }
    };

    if (isRehydrated) {
      initializeAuth();

      // Re-check auth when tab becomes visible
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          initializeAuth();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearTimeout(expirationTimer);
        clearTimeout(refreshInterval);
        clearInterval(checkInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [dispatch, navigate, isRehydrated]);

  return null;
};