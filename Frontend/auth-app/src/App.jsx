// src/App.js


import React,{ useEffect }  from "react";
import { useDispatch, useSelector } from "react-redux";
import { startInitialization } from "./redux/authSlice";
import { FullPageLoadingSpinner } from "./components/FullPageLoadingSpinner";
import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import{ AuthPage } from "./components/AuthPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { UpdatePassword } from "./components/UpdatePassword";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./components/LoginPage";
import { LandingPage } from "./ui/landingPage";
import {ProtectedRoute} from "./components/ProtectedRoute";
import { AuthInitializer } from "./components/AuthInitializer";
import { VerifyStaff } from "./CoopMemberAuth/VerifyStaff";


const Queryclient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 60 * 1000,
      staleTime: 0,
    },
  },
});
function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startInitialization()); // Trigger initialization
  }, [dispatch]);
  return (
    <GoogleOAuthProvider clientId="262725245052-njgbo7jf55h5de908ed409ifubv8knes.apps.googleusercontent.com">
      <QueryClientProvider client={Queryclient}>
        <Router>
          {/* Render the AuthInitializer inside the Router */}
          <AuthInitializer />
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/verify-lasu-staff" element={<VerifyStaff />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 5000,
              style: {
                backgroundColor: "#4caf50",
                color: "#ffffff",
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            },
            error: {
              duration: 1000,
              style: {
                backgroundColor: "#f44336",
                color: "#ffffff",
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            },
            loading: {
              style: {
                backgroundColor: "#2196f3",
                color: "#ffffff",
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              },
            },
          }}
        />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

// function App() {
//   return (
//     <QueryClientProvider client={Queryclient}>
//     <Router>
//       <Routes>
//         <Route path="/" element={<AuthPage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/reset-password" element={<ResetPasswordPage />} />
//         <Route path="/update-password" element={<UpdatePassword />} />  
//        <Route path= '/home' element={<LandingPage />} />
//       </Routes>
//     </Router>
//     <Toaster
//   position="top-center"
//   gutter={12}
//   containerStyle={{ margin: "8px" }}
//   toastOptions={{
//     success: {
//       duration: 1000,
//       style: {
//         backgroundColor: "#4caf50", // Green background for success
//         color: "#ffffff",          // White text for better contrast
//         fontSize: "16px",
//         maxWidth: "500px",
//         padding: "16px 24px",
//         borderRadius: "8px",       // Rounded corners for a modern look
//         boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
//       },
//     },
//     error: {
//       duration: 1000,
//       style: {
//         backgroundColor: "#f44336", // Red background for errors
//         color: "#ffffff",          // White text for better contrast
//         fontSize: "16px",
//         maxWidth: "500px",
//         padding: "16px 24px",
//         borderRadius: "8px",       // Rounded corners for a modern look
//         boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
//       },
//     },
//     loading: {
//       style: {
//         backgroundColor: "#2196f3", // Blue background for loading
//         color: "#ffffff",          // White text for better contrast
//         fontSize: "16px",
//         maxWidth: "500px",
//         padding: "16px 24px",
//         borderRadius: "8px",       // Rounded corners for a modern look
//         boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
//       },
//     },
//   }}
// />
//     </QueryClientProvider>
//   );
// }

export default App;