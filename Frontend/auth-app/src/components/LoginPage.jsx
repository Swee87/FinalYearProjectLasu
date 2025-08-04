// src/components/LoginPage.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Login, verifyGoogleToken } from "../services/authApi";
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

export const LoginPage = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState, reset } = useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

   const location = useLocation();

  const routeUserType = location.state?.userType;
  const storedUserType = sessionStorage.getItem("userType");
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => Login(email, password),
    mutationKey: ["login"],
    onSuccess: ({ data }) => {
      if (!data || !data.user) {
        toast.error("Invalid response from server.");
        return;
      }

      toast.success("Login was successful");
      queryClient.setQueryData(["user"], data);
      reset();
      dispatch(setCredentials({ token: data.token, user: data.user.name }));
      console.log(data.user.name)
      navigate('/user-Dashboard');
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error(error?.message || "Invalid login credentials");
    }
  });

  const { mutate } = loginMutation;
  const isLogin = loginMutation.status === "pending"; // 

  const { errors } = formState;

const handleLoginSuccess = () => {
  //  Get userType from sessionStorage
  const userType = sessionStorage.getItem("userType") || "member";

  // 👇 Redirect based on userType
  const redirectTo = userType === "oneOffCustomer" ? "/customer-dashboard" : "/user-Dashboard";
  console.log("Redirecting to:", redirectTo);

  sessionStorage.removeItem("userType");
  navigate(redirectTo);
};


  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const { token, user } = await verifyGoogleToken(credential);
      dispatch(setCredentials({ token, user }));
      queryClient.setQueryData(["user"], user);
      // navigate('/user-Dashboard');
      handleLoginSuccess();
      reset();
      toast.success("Google login successful");
    } catch (error) {
      toast.error(error?.message || "Google login failed");
    }
  };

  if (isLogin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex flex-col items-center justify-center px-4">
  {/* Cancel Button */}
  <button
    onClick={() => window.location.reload()} // or pass a cancel handler
    className="absolute top-4 right-4 text-white hover:text-red-500 text-xl font-bold transition"
    aria-label="Cancel"
    title="Cancel Login"
  >
    &times;
  </button>

  {/* Spinner */}
  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-500 mb-4"></div>

  {/* Animated Auth Text */}
  <div className="text-white font-medium text-lg flex items-center space-x-1">
    <span>Authenticating securely</span>
    <span className="animate-bounce [animation-delay:0ms]">.</span>
    <span className="animate-bounce [animation-delay:150ms]">.</span>
    <span className="animate-bounce [animation-delay:300ms]">.</span>
  </div>
</div>


    );
  }
  return (
    <form
      className="space-y-6 max-w-md mx-auto p-1"
      onSubmit={handleSubmit((data) => {
        const { email, password } = data;
        mutate({ email, password });
      })}
      onReset={reset}
    >
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-0 mt-0.5">Log In</h2>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={isLogin}
      >
        {isLogin ? "Logging in..." : "Log In"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => toast.error("Google login failed. Please try again.")}
        useOneTap
      />

      <div className="text-center">
        <Link to="/reset-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Forgot your password?
        </Link>
      </div>
    </form>
  );
};


