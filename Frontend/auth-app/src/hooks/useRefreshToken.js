import { useEffect } from 'react';
import { refreshToken } from '../services/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';

export const useRefreshToken = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        // Refresh 10 seconds before expiration (at 50 seconds)
        await refreshToken();
        // Optionally update Redux state if needed
        const { user } = await fetchCurrentUser();
        dispatch(setCredentials({ user }));
      } catch (error) {
        console.log('Session expired - redirecting to login');
        clearInterval(refreshInterval);
      }
    }, 50000); // Run every 50 seconds

    return () => clearInterval(refreshInterval);
  }, [dispatch]);
};