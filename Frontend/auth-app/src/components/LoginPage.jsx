// src/components/LoginPage.js
import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Login } from "../services/authApi";
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { useNavigate } from 'react-router-dom';
import { verifyGoogleToken } from "../services/authApi"; // Import the function to verify Google token
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState, reset } = useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Use useNavigate to programmatically navigate

  // Email/Password Login Mutation
  const { mutate, isLoading: isLogin } = useMutation({
    mutationFn: ({ email, password }) => Login(email, password), // Call the Login function from authApi
    mutationKey: ["login"],
    onSuccess: ({data}) => {
      if (!data || !data.token || !data.user) {
        console.error("Invalid data received from API:", data);
        toast.error("Failed to process login response");
        return;
      }

      toast.success("Login  Was successful");
      queryClient.setQueryData(["user"], data);
      reset();
      dispatch(setCredentials({  user: data.user ,   // Store both token and user in Redux
      })); // Dispatch the action
    // Dispatch the action
    // dispatch(setCredentials({ token: data.token, user: data.user })); // Dispatch the action
      navigate('/home'); // Navigate to home page after successful login
    },
    onError: (error) => {
      console.error("Full error object:", error);
      toast.error(error?.message|| "Invalid Login credentials");
    },
  });

  const { errors } = formState;

  // Handle Google Login Success
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const { token, user } = await verifyGoogleToken(credential);
      
      // Store both token and user in Redux
      dispatch(setCredentials({ token, user }));
      
      // Update react-query cache
      queryClient.setQueryData(["user"], user);
      
      navigate('/home');
      toast.success('Google login successful');
    } catch (error) {
      toast.error(error.message || 'Google login failed');
    }
  };

  return (
      <form
          className="space-y-6 max-w-md mx-auto p-1"
          onSubmit={handleSubmit(async (data) => {
              const { email, password } = data;
              mutate({ email, password });
          })}
          onReset={reset}
      >
          {/* Header */}
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-0 mt-0.5">Log In</h2>

          {/* Email Field */}
          <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
              </label>
              <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  {...register('email', { required: 'Email is required' })}
              />
              {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
          </div>

          {/* Password Field */}
          <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
              </label>
              <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
          </div>

          {/* Login Button */}
          <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLogin}
          >
              {isLogin ? 'Logging in...' : 'Log In'}
          </button>

          {/* Divider */}
          <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
          </div>

          {/* Google Sign-In Button */}
          <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => {
                  toast.error('Google login failed. Please try again.');
              }}
              useOneTap
          />

          {/* Forgot Password Link */}
          <div className="text-center">
              <Link
                  to="/reset-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                  Forgot your password?
              </Link>
          </div>
      </form>
  );
};

// export const LoginPage = ( ) => {
//   const dispatch = useDispatch(); // Get the dispatch function
//   const { register, handleSubmit, formState, reset } = useForm();
//   const queryClient = useQueryClient();

//   // const { mutate, isLoading: isLogin } = useMutation({
//   //   mutationFn: isGoogleLogin
//   //     ? () => LoginWithGoogle() // Call the Google OAuth login function
//   //     : ({ email, password }) => Login(email, password), // Call the email/password login function
//   //   onSuccess: ({ data }) => {
//   //     if (!data || !data.token || !data.user) {
//   //       console.error('Invalid data received from API:', data);
//   //       toast.error('Failed to process login response');
//   //       return;
//   //     }

//   //     toast.success('Login was successful');
//   //     queryClient.setQueryData(['user'], data); // Update user data in the cache
//   //     dispatch(setCredentials({ token: data.token, user: data.user })); // Dispatch Redux action
//   //   },
//   //   onError: (error) => {
//   //     console.error('Full error object:', error);
//   //     toast.error(error?.message || 'Invalid login credentials');
//   //   },
//   // });

  // const { mutate, isLoading: isLogin } = useMutation({
  //   mutationFn: ({ email, password }) => Login(email, password), // Call the Login function from authApi
  //   mutationKey: ["login"],
  //   onSuccess: ({data}) => {
  //     if (!data || !data.token || !data.user) {
  //       console.error("Invalid data received from API:", data);
  //       toast.error("Failed to process login response");
  //       return;
  //     }

  //     toast.success("Login  Was successful");
  //     queryClient.setQueryData(["user"], data);
  //     reset();
  //     dispatch(setCredentials({ token: data.token, user: data.user })); // Dispatch the action
  //   },
  //   onError: (error) => {
  //     console.error("Full error object:", error);
  //     toast.error(error?.message|| "Invalid Login credentials");
  //   },
  // });

//   const { errors } = formState;
//   return (
//     <form
//     className="space-y-6 max-w-md mx-auto p-1"
//     onSubmit={handleSubmit(async (data) => {
//       const { email, password } = data;
//       console.log("Email:", email, "Password:", password);
//       mutate({ email, password });
//     })}
//     onReset={reset}
//   >
//     {/* Header */}
//     <h2 className="text-3xl font-bold text-center text-gray-900 mb-0 mt-0.5">Log In</h2>
  
//     {/* Email Field */}
//     <div>
//       <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//         Email
//       </label>
//       <input
//         type="email"
//         id="email"
//         placeholder="Enter your email"
//         className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//         {...register('email', { required: 'Email is required' })}
//       />
//       {errors.email && (
//         <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
//       )}
//     </div>
  
//     {/* Password Field */}
//     <div>
//       <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//         Password
//       </label>
//       <input
//         type="password"
//         id="password"
//         placeholder="Enter your password"
//         className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//         {...register('password', { required: 'Password is required' })}
//       />
//       {errors.password && (
//         <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
//       )}
//     </div>
  
//     {/* Login Button */}
//     <button
//       type="submit"
//       className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//       disabled={isLogin}
//     >
//       {isLogin ? "Logging in..." : "Log In"}
//     </button>
  
//     {/* Divider */}
//     <div className="relative">
//       <div className="absolute inset-0 flex items-center" aria-hidden="true">
//         <div className="w-full border-t border-gray-300"></div>
//       </div>
//       <div className="relative flex justify-center text-sm">
//         <span className="px-2 bg-white text-gray-500">Or continue with</span>
//       </div>
//     </div>
  
//     {/* Google Sign-In Button */}
//     <button
//       type="button"
//       className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
     
//     >
//       <svg
//         className="w-5 h-5 mr-2"
//         aria-hidden="true"
//         fill="currentColor"
//         viewBox="0 0 20 20"
//       >
//         <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
//       </svg>
//       Sign In with Google
//     </button>
  
//     {/* Forgot Password Link */}
//     <div className="text-center">
//       <Link
//         to="/reset-password"
//         className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
//       >
//         Forgot your password?
//       </Link>
//     </div>
//   </form>
//   )
// };

