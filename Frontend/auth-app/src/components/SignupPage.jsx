// src/components/SignupPage.js
import React ,{useState} from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Register } from "../services/authApi";
import { VerifyOtp } from "./VerifyOtp";

export const SignupPage = () => {
  const { register, handleSubmit, formState, reset } = useForm();
    const queryClient = useQueryClient();
    const [showVerifyOtp, setShowVerifyOtp] = useState(false);
    const { mutate, isLoading: isSigning } = useMutation({
      mutationFn: ({ email, password }) => Register(email, password),
      mutationKey: ["Register"],
      // data passed here is the data returned from the API
      // so we can use it to set the user data in the queryClient
      onSuccess: ({data}) => {
        if (!data ||  !data.user) {
          console.error("Invalid data received from API:", data);
          console.log("Data:", data);
          toast.error("Failed to process register response");
          return;
        }
        toast.success("Registration was successful");
        queryClient.setQueryData(["user"], data);
        setShowVerifyOtp(true); // Show the VerifyOtp component
        
        reset();
      },
      onError: (error) => {
        console.error("Full error object:", error);
        toast.error(error?.message|| "Invalid Login credentials");
      },
    });
  
    const { errors } = formState;
  return (
    <>
    <form className="space-y-6"  onSubmit={handleSubmit(async (data) => {
      const { email, password } = data;
      console.log("Email:", email, "Password:", password);
       mutate({ email, password });
    })}
    onReset={reset}>
      <h2 className="text-3xl font-bold text-center text-gray-900">Sign Up</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          {...register('password', { required: 'Password is required' })}
          
        />
         {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Sign Up
      </button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      <button
        type="button"
        className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg
          className="w-5 h-5 mr-2"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"></path>
        </svg>
        Sign Up with Google
      </button>
    
    </form>
    {showVerifyOtp && <VerifyOtp  onClose={()=>setShowVerifyOtp(false)}/>}
  </>
  )
};

