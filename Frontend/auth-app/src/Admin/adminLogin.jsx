import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LoginAdmin } from "../services/authApi";
import { useNavigate } from "react-router-dom";

export function AdminLogin({ onSwitchToRegister }) {
  const { register, handleSubmit, formState, reset } = useForm();
  const navigate = useNavigate()
  const [showVerifyOtp, setShowVerifyOtp] = React.useState(false);

  const { mutate, isLoading: isSigning } = useMutation({
    mutationFn: ({ email, password }) => LoginAdmin(email, password),
    onSuccess: ({data}) => {
      if (!data || !data.user) {
        toast.error("Invalid credentials");
        return;
      }
      toast.success("Login successful");
    //   window.location.href = "/home";
    navigate("/loanSummary")
      reset();
    },
    onError: (error) => {
      toast.error(error?.message || "Login failed");
    },
  });

  const { errors } = formState;

  return (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>

      <form
        className="space-y-5"
        onSubmit={handleSubmit(async (data) => {
          const { email, password } = data;
          mutate({ email, password });
        })}
        onReset={reset}
      >
        {/* Email Input */}
        <div className="space-y-1">
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="login-email"
            {...register("email", { required: "Email is required" })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="login-password"
            {...register("password", { required: "Password is required" })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.password
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSigning}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
            isSigning
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          {isSigning ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V4a10 10 0 1010 10h-2a8 8 0 01-8-8z"
                ></path>
              </svg>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Switch to Register Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Register
          </button>
        </p>
      </form>
    </>
  );
}