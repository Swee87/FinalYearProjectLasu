import React from 'react';
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from 'react-router-dom';
import { VerifyLasuStaff } from "../services/CoopAuthApi";
import { Spinner } from "../components/spinner";
export const VerifyStaff =()=>{
     const { register, handleSubmit, formState, reset } = useForm();
      const queryClient = useQueryClient();
       const navigate = useNavigate(); 

    const { mutate, isLoading: isVerifying } = useMutation({
        mutationFn: ({ profileNumber }) => VerifyLasuStaff(profileNumber),
        mutationKey: ["verify-otp"],
        onSuccess: ( profile  ) => {
            if (!profile.fullName || !profile. staffType) {
                console.error("Invalid data received from API:", profile);
                toast.error("Failed to process verification response");
                return;
            }
            toast.success(`You profile is verified successfully as ${profile.fullName}`);
            queryClient.setQueryData(["profile"], profile);
            reset();
            //navigate("/login"); // Redirect to the login page after successful verification
        },
        onError: (error) => {
            console.error("Full error object:", error);
            toast.error(error?.message || "Profile Number is invalid");
        },})     
        if (isVerifying) {
            return <Spinner />; // Show spinner while verifying
        }
        const { errors } = formState;
    return (
        <form
  className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-xl shadow-md"
  onSubmit={handleSubmit(async (profile) => {
    const { profileNumber } = profile;
    mutate({ profileNumber });
  })}
  onReset={reset}
>
  <div>
    <label
      htmlFor="profileNumber"
      className="block text-sm font-medium text-gray-800 mb-1"
    >
      Profile Number
    </label>
    <input
      type="text"
      id="profileNumber"
      placeholder="Enter your profile number"
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm"
      {...register('profileNumber', { required: 'Profile Number' })}
    />
    {errors.password && (
      <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
    )}
  </div>

  <button
    type="submit"
    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
    disabled={isVerifying}
    style={{
      backgroundColor: isVerifying ? '#ccc' : '#4f46e5',
      cursor: isVerifying ? 'not-allowed' : 'pointer',
    }}
  >
    {isVerifying ? (
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Verifying ...
      </>
    ) : (
      'Verify'
    )}
  </button>
</form>
            
    );
}