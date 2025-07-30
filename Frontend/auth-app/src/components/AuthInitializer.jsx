

import { useEffect } from 'react';
import { refreshToken, adminRefreshToken } from '../services/authApi';
import {setCredentials} from '../redux/authSlice.js'
import { useDispatch } from "react-redux";

// Helper function to decode JWT without verification
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error.message);
    return null;
  }
};

// Helper function to get accessToken from cookies
const getAccessToken = () => {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  return cookies.accessToken || cookies.adminAccessToken || null;
};

export const AuthInitializer = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const runRefresh = async () => {
      try {
        // Check if accessToken is valid
        const accessToken = getAccessToken();
        let shouldRefresh = true;

        if (accessToken) {
          const decoded = decodeJwt(accessToken);
          if (decoded && decoded.exp) {
            const expiresAt = decoded.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const buffer = 2 * 60 * 1000; // 2-minute buffer before expiry
            if (expiresAt > now + buffer) {
              shouldRefresh = false; // Token is still valid
              console.log('Access token still valid, expires at:', new Date(expiresAt));
            }
          }
        }

        if (!shouldRefresh) {
          // Try to get role without refreshing
          try {
            const roleResponse = await fetch('http://localhost:5000/auth1/checkRole', {
              method: 'GET',
              credentials: 'include',
            });

            console.log('Role response:', roleResponse);

            if (roleResponse.ok) {
              const data = await roleResponse.json();
              console.log('Role data:', data);
              const { role } = data;
              console.log('Role:', role);
              return; // Role retrieved, no refresh needed
            }
          } catch (error) {
            console.warn('Role check error:', error.message);
          }
        }

        // If we reach here, either no valid accessToken or role check failed
        console.log('Attempting token refresh');
        try {
          const roleResponse = await fetch('http://localhost:5000/auth1/checkRole', {
            method: 'GET',
            credentials: 'include',
          });

          if (roleResponse.ok) {
            const data = await roleResponse.json();
            console.log('Role data:', data);
            const { role } = data;
            console.log('Role:', role);
            if (role === 'admin') {
              await adminRefreshToken();
            } else {
             const data =  await refreshToken();
             console.log('refreshData',data)
              dispatch(setCredentials({ user: data?.data?.user.name}))
            }
          } else if (roleResponse.status === 401 || roleResponse.status === 403) {
            console.log('Role check failed with 401/403, attempting regular refresh');
            await refreshToken(); // Default to regular refresh
          } else {
            console.warn('Role check failed:', roleResponse.statusText);
          }
        } catch (error) {
          console.warn('Role check error, attempting regular refresh:', error.message);
          await refreshToken();
        }
      } catch (error) {
        console.error('Automatic token refresh failed:', error.message);
      }
    };

    runRefresh(); // Run once on mount
    const interval = setInterval(runRefresh, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return null;
};
