// src/components/ResetPasswordPage.js
import React from "react";
import { useForm } from "react-hook-form";  
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ForgottenPassword } from "../services/authApi";

export const ResetPasswordPage = () => {
   const { register, handleSubmit, formState, reset } = useForm();
   const { errors } = formState;
    const queryClient = useQueryClient();
     const { mutate, isLoading } = useMutation({
        mutationFn: ({ email }) => ForgottenPassword(email),
        mutationKey: ["ForgottenPassword"],
        // data passed here is the data returned from the API
        // so we can use it to set the user data in the queryClient
        onSuccess: ({status}) => {
          if (!status || status !== "success") {
            console.error("Invalid status received from API:", status);
            
            toast.error("Failed to process reset link response");
            return;
          }
    
          toast.success("Reset link sent successfully");
          queryClient.setQueryData(["user"], status);
          reset();
        },
        onError: (error) => {
          console.error("Full error object:", error);
          toast.error(error?.message|| "Email is invalid or already registered");
        },
      });
    
    
  return (
    <form className="space-y-6 mx-auto mt-10 w-96 p-6 bg-white rounded-lg shadow-md"
      onSubmit={handleSubmit(async (data) => {
      const { email } = data;
      console.log("Email:", email);
      mutate({ email });
    })}
    onReset={reset}
    >
      <h2 className="text-3xl font-bold text-center text-gray-900">Reset Password</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="mt-1 block w-84 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && (
        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
      )}
      </div>
      <button
        type="submit"
        className="w-84 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Reset Password
      </button>
    </form>
  );
};

