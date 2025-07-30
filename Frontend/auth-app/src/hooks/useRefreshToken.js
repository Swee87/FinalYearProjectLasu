import { useEffect } from 'react';
import { refreshToken } from '../services/authApi';
import { adminRefreshToken} from '../services/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';
import { fetchCurrentUser } from '../services/authApi'; 

export const useRefreshToken = () => {
  const dispatch = useDispatch();

 useEffect(() => {
  const refreshInterval = setInterval(async () => {
    try {
      console.log("Attempting token refresh");

      await adminRefreshToken().catch((err) => {
        console.error("adminRefreshToken error:", err);
      });
      await refreshToken().catch((err) => {
        console.error("refreshToken error:", err);
      });


      const { user } = await fetchCurrentUser();
      dispatch(setCredentials({ user }));
    } catch (error) {
      console.log("Session expired - redirecting to login", error);
      clearInterval(refreshInterval);
    }
  }, 50000);

  return () => clearInterval(refreshInterval);
}, [dispatch]);

};