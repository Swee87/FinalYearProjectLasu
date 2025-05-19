import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useRefreshToken } from '../hooks/useRefreshToken';

export const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
    useRefreshToken(); // Auto-refresh token if needed
  
    // Debugging (remove in prod)
    if (process.env.NODE_ENV === 'development') {
      console.log("[ProtectedRoute] Auth state:", {
        isAuthenticated,
        isInitialized,
        path: location.pathname
      });
    }
  
    // Wait until auth state is initialized
    if (!isInitialized) {
      return (
        <div className="full-page-loading">
          <p>Verifying session...</p>
        </div>
      );
    }
  
    //  Redirect if not authenticated
    if (!isAuthenticated) {
      console.warn("User not authenticated - redirecting to login");
      return (
        <Navigate 
          to="/login" 
          state={{ 
            from: location.pathname !== '/login' ? location : '/home',
            reason: 'unauthenticated'
          }} 
          replace 
        />
      );
    }
  
    //  good — render protected content
    return children;
  };

// export const ProtectedRoute = ({ children }) => {
//     const location = useLocation();
//     const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
//     useRefreshToken(); // Call the hook to refresh token if needed

//     // Debugging logs (remove in production)
//     if (process.env.NODE_ENV === 'development') {
//         console.log("[ProtectedRoute] Auth state:", {
//             isAuthenticated,
//             isInitialized,
//             currentPath: location.pathname,
//             redirectedFrom: location.state?.from
//         });
//     }

//     // if (!isInitialized) {
//     //     return (
//     //         <div className="full-page-loading">
//     //             <div className="spinner"></div>
//     //             <p>Verifying your session...</p>
//     //         </div>
//     //     );
//     // }

//     if (!isAuthenticated && location.pathname !== '/login') {
//         // Important: Use replace to prevent back button issues
//         return (
//             <Navigate 
//                 to="/login" 
//                 state={{ 
//                     from: location.pathname !== '/login' ? location : '/home',
//                     reason: 'unauthenticated'
//                 }} 
//                 replace 
//             />
//         );
//     }

//     return children;
// };