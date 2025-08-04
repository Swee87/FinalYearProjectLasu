// src/App.js



import React,{ useEffect }  from "react";

import { useDispatch, useSelector } from "react-redux";
import { startInitialization } from "./redux/authSlice";
import { FullPageLoadingSpinner } from "./components/FullPageLoadingSpinner";
import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthPage } from "./components/AuthPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { UpdatePassword } from "./components/UpdatePassword";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { LoginPage } from "./components/LoginPage";
import { Loan } from "./Dashboard/Loan";
import { LandingPage } from "./ui/landingPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthInitializer } from "./components/AuthInitializer";
import { VerifyStaff } from "./CoopMemberAuth/VerifyStaff";
import { AdminRegister } from "./Admin/adminRegister";
import { AdminAuthPage } from "./Admin/AdminAuth";
import { LoanForm } from "./LoanClient/LoanForm";
import { LoanHistory } from "./LoanClient/LoanHistory";

import { LoanDashboard } from "./LoanClient/LoanDashboard";
import { LoanDetails } from "./Dashboard/LoanDetails";
import { ClientDashboard } from "./ClientDashboard/clientdash";
import { VerifyMemberShip } from "./ClientDashboard/verifyMembership";
import { MembershipApproval } from "./Admin/approveMember";
// <<<<<<< HEAD
// import { SaveDashboard } from "./SaveClient/SaveDashboard";
// import PayStack from "./SaveClient/PayStack";
// import LoanReportPage from "./LoanClient/Report";
import {ProductsPage} from "./Procurement/ProductPage";
import CartPage from "./Procurement/CartPage";
import { CartProvider } from "./Procurement/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {SecondaryNavbar} from "./Procurement/Navbar";
import { Nav } from "./ui/Nav";
import CheckoutPage from "./Procurement/CheckOut";

import { Dashboard } from "./Dashboard/AdminHome";
import { PayStack } from "./SaveClient/PayStack";
import { SaveDashboard } from "./SaveClient/SaveDashboard";
import { ClientGeneralDashboard } from "./ClientDashboard/clientHome";
import { PaystackCallback } from "./SaveClient/PaystackCallback";
import { LoanOfficerLogin } from "./Staff/LoanOfficer/loanOfficerLogin";
import { LoanOfficerDashboard } from "./Staff/LoanOfficer/LoanOfficerDashboard";
import { CustomerDashboard } from "./Procurement/customers/customerDashBoard";

// >>>>>>> 7edeea3 (WIP: saving my changes before pulling)

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
          <AuthInitializer />
          {/* Render the AuthInitializer inside the Router */}
          <Routes>
            <Route path="/register" element={<AuthPage />} />
            <Route path="/" element={<LandingPage />} />
{/* <<<<<<< HEAD
            <Route
              path="/user-Dashboard"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loanSummary"
              element={
                <ProtectedRoute>
                  <Loan />
                </ProtectedRoute>
              }
            /> */}

            <Route path="admin-home" element={<Dashboard />} />
            {/* <Route path="/user-Dashboard" element={
              <ProtectedRoute>
                  <ClientDashboard/>
                </ProtectedRoute>
            }/> */}
            {/* <Route path="/loanSummary" element={<ProtectedRoute><Loan /></ProtectedRoute>} /> */}
{/* >>>>>>> 7edeea3 (WIP: saving my changes before pulling) */}
            <Route path="/admin" element={<AdminAuthPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/update-password" element={<UpdatePassword />} />
{/* <<<<<<< HEAD
            <Route path="/verifyMembership" element={<VerifyMemberShip />} />
            <Route
              path="/loanform"
              element={
                <ProtectedRoute>
                  <LoanForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loanhistory"
              element={
                <ProtectedRoute>
                  <LoanHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loanDashboard"
              element={
                <ProtectedRoute>
                  <LoanDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loanDetail"
              element={
                <ProtectedRoute>
                  <LoanDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/membershipApproval"
              element={
                <ProtectedRoute>
                  <MembershipApproval />
                </ProtectedRoute>
              }
            /> */}

            <Route path="/verifyMembership" element={<VerifyMemberShip/>} />
            <Route path='/user-Dashboard' element={<ClientGeneralDashboard/>}/>
            <Route path="/loanform" element={<ProtectedRoute>
              <LoanForm />
            </ProtectedRoute>} />
          <Route path="/loanhistory" element={<ProtectedRoute><LoanHistory /></ProtectedRoute>} />
          <Route path="/loanDashboard" element={<ProtectedRoute><LoanDashboard /></ProtectedRoute>} />
            <Route path="/loanDetails" element={<ProtectedRoute><LoanDetails/></ProtectedRoute>} />
            {/* <Route path="/membershipApproval" element={<ProtectedRoute><MembershipApproval/></ProtectedRoute>} /> */}
{/* >>>>>>> 7edeea3 (WIP: saving my changes before pulling) */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/savingDashboard"
              element={
                <ProtectedRoute>
                  <SaveDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payStackPayment"
              element={
                <ProtectedRoute>
                  <PayStack />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/loanReport"
              element={
                <ProtectedRoute>
                  <LoanReportPage />
                </ProtectedRoute>
              }
            /> */}
                <Route
              path="/loanOfficerLogin"
              element={
                
                  <LoanOfficerLogin />
                
              }
            />
            <Route
              path="/loanOfficerDashboard"
              element={
                <ProtectedRoute>
                  <LoanOfficerDashboard />
                </ProtectedRoute>
              }
            />

               <Route
              path="/payStackPayment"
              element={
                <ProtectedRoute>
                  <PayStack />
                </ProtectedRoute>
              }
            />
            <Route path="/paystack-callback" element={<PaystackCallback />} />
            {/* <Route
              path="/savingDashboard"
              element={
                <ProtectedRoute>
                  <SaveDashboard />
                </ProtectedRoute>
              }
            /> */}

             <Route
                path="/productPage"
                element={
                  <ProtectedRoute>
                    <ProductsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cartPage"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkoutPage"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
            <Route
              path="/customer-dashboard"
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

          </Routes>
           <ToastContainer />
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
              duration: 30000,
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
