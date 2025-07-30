import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { loginStaff } from "../../services/AdminRoutes/StaffAuth"; // Adjust the import path as necessary
import { useDispatch } from "react-redux";
//import { setCredentials } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";

export function LoanOfficerLogin() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => loginStaff({ email, password }), 
    onSuccess: ({ user }) => {
      //dispatch(setCredentials({ token: null, user }));
      queryClient.setQueryData(["user"], user);
      toast.success("Login successful");
      reset();
      navigate("/loanOfficerDashboard");
    },
    onError: (error) => {
      toast.error(error?.message || "Login failed");
    },
  });

  const onSubmit = (formData) => {
    const { email, password } = formData;
    loginMutation.mutate({ email, password }); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900">Loan Officer Login</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
            })}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-700 text-white py-3 rounded-xl font-semibold hover:bg-indigo-800 transition"
          disabled={loginMutation.isLoading}
        >
          {loginMutation.isLoading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center">
          <Link to="/reset-password" className="text-sm text-indigo-600 hover:underline">
            Forgot your password? <span className="font-semibold">Reset it</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
