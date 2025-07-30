
// src/pages/AdminRegister.jsx
import React ,{useState}from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { VerifyOtp } from "../components/VerifyOtp";
import { RegisterAdmin } from "../services/authApi";

export function AdminRegister({ onSwitchToLogin }) {
  const { register, handleSubmit, formState, reset } = useForm();
  const queryClient = useQueryClient();
  const [showVerifyOtp, setShowVerifyOtp] = React.useState(false);
  const [isLoading, setLoading] = useState(false)

  const { mutate, isLoading: isSigning } = useMutation({
    mutationFn: ({ email, password ,FirstName, LastName}) => RegisterAdmin(email, password,FirstName, LastName),
    onSuccess: ({ data }) => {
      if (!data || !data.user) {
        toast.error("Failed to process register response");
        return;
      }
      toast.success("Registration was successful");
      queryClient.setQueryData(["admin"], data);
      setShowVerifyOtp(true);
      reset();
    },
    onError: (error) => {
      toast.error(error?.message || "Registration failed");
    },
  });

  const { errors } = formState;

5

  return (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Registration</h2>

      <form
        className="space-y-5"
        onSubmit={handleSubmit(async (data) => {
          const { email, password ,FirstName, LastName} = data;
          mutate({ email, password ,FirstName, LastName});
        })}
        onReset={reset}
      >
        {/* FirstName and LastName Input */}
        <div>
        <label className="block text-sm font-medium text-gray-700">First Name</label>
        <input
          type="text"
          placeholder="Enter your first name"
          className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo"
          {...register('FirstName', { required: 'First name is required' })}
        />
        {errors.FirstName && <p className="text-red-500">{errors.FirstName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          placeholder="Enter your last name"
          className="mt-1 block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo"
          {...register('LastName', { required: 'Last name is required' })}
        />
        {errors.LastName && <p className="text-red-500">{errors.LastName.message}</p>}
      </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
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
              Registering...
            </>
          ) : (
            "Register"
          )}
        </button>

        {/* Switch to Login Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign In
          </button>
        </p>
      </form>

      {/* OTP Verification Modal */}
      {showVerifyOtp && (
        <div className="mt-6 animate-fadeIn">
          <VerifyOtp onClose={() => setShowVerifyOtp(false)} />
        </div>
      )}
    </>
  );
}
