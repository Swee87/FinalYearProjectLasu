// src/components/ResetPasswordPage.js
import { createPortal } from "react-dom";
import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form";
import { useDispatch ,useSelector} from "react-redux";
import { AuthPage } from "./AuthPage";
import toast from "react-hot-toast";
import { OtpVerification } from "../services/authApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const VerifyOtp = ({ onClose }) => {
  const isLoginAuth = useSelector((state) => state.auth.isAuthenticated);
    const { register, handleSubmit, formState, reset } = useForm();
    const [showVerifyOtp, setShowVerifyOtp] = useState(isLoginAuth);
    const queryClient = useQueryClient();
    const dispatch = useDispatch(); // Get the dispatch function
    const navigate = useNavigate();
    
    const { mutate, isLoading: isVerifying} = useMutation({
        mutationFn: ({ email, otp}) => OtpVerification(email, otp),
        mutationKey: ["verify-otp"],
        // data passed here is the data returned from the API
        // so we can use it to set the user data in the queryClient
        onSuccess: ({data}) => {
          if (!data || !data.user) {
            console.error("Invalid data received from API:", data);
            toast.error("Failed to process verification response");
            return;
          }

          toast.success("verification was successful");
          queryClient.setQueryData(["user"], data);// Dispatch the action
          // setShowVerifyOtp(true); // Show the VerifyOtp component
          reset();
          navigate("/login"); // Redirect to the login page after successful verification
          // document.body.removeChild(document.querySelector("div")); // Remove the overlay
          onClose(); // Close the modal after successful verification
         //Elijahog 
        },
        onError: (error) => {
          console.error("Full error object:", error);
          toast.error(error?.message|| "Email or OTP is invalid");
        },
      });
    
      const { errors } = formState;
  // Function to handle overlay and modal cleanup
  useEffect(() => {
    // Create the overlay element
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black
    overlay.style.zIndex = "998"; // Ensure it stays below the modal

    // Append the overlay to the body
    document.body.appendChild(overlay);

    // Cleanup function to remove the overlay when the component unmounts
    return () => {
      document.body.removeChild(overlay);
    };
  }, []);
  // if (showVerifyOtp) {
  //   return <AuthPage />;
  // }
  return createPortal(
   
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: "999", // Ensure the modal is above the overlay
      }}
    >
      <form className="space-y-6 w-96 p-6 bg-white rounded-lg shadow-md" onSubmit={handleSubmit(async (data) => {
      const { email, otp } = data;
      console.log("Email:", email, "Password:", otp);
       mutate({ email, otp });
    })}>
        <h2 className="text-3xl font-bold text-center text-gray-900">Verify OTP</h2>
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
          <label className="block text-sm font-medium text-gray-700">OTP</label>
          <input
        type="number"
        placeholder="Enter your OTP"
        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        {...register('otp', {
         required: 'OTP is required',
            minLength: { value: 6, message: 'OTP must be 6 digits' },
        maxLength: { value: 6, message: 'OTP must be 6 digits' },
        })}
    />
{errors.otp && <p className="text-red-500">{errors.otp.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isVerifying}
        >
          Verify OTP
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Close
        </button>
      </form>
    </div>,
    document.body

    
  );
};

