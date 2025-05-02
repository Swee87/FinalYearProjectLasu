// src/components/LoginPage.js
import React from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UpdateUserPassword } from "../services/authApi";


export const UpdatePassword = () => {
    const [searchParams] = useSearchParams();
    const { register, handleSubmit, formState } = useForm();
    const queryClient = useQueryClient();
    
    // Get tokenId from URL and token from email (should be passed to the form)
    const tokenId = searchParams.get("tokenId");
    const [token, setToken] = React.useState("");

    if (!tokenId) {
        console.error("No tokenId found in the URL");
        return <p>Invalid or missing password reset link. Please try again.</p>;
    }

    const { mutate, isLoading } = useMutation({
        mutationFn: ({ tokenId, token, password }) => 
            UpdateUserPassword({ tokenId, token, password }),
        mutationKey: ["update-password"],
        onSuccess: (data) => {
            if (!data || data.status !== "success") {
                console.error("Invalid response from API:", data);
                toast.error("Failed to update password");
                return;
            }
            toast.success("Password updated successfully!");
            queryClient.invalidateQueries(["user"]);
        },
        onError: (error) => {
            console.error("Update error:", error);
            toast.error(error?.message || "Failed to update password");
        },
    });

    const { errors } = formState;

    return (
        <form
            className="space-y-6 max-w-md mx-auto p-1"
            onSubmit={handleSubmit((data) => {
                if (!token) {
                    toast.error("Please enter the security token from your email");
                    return;
                }
                mutate({ tokenId, token, password: data.password });
            })}
        >
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-0 mt-0.5">
                Update Password
            </h2>

            {/* Security Token Field (from email) */}
            <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                    Security Token (from email)
                </label>
                <input
                    type="text"
                    id="token"
                    placeholder="Enter the token from your email"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                />
            </div>

            {/* New Password Field */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New Password
                </label>
                <input
                    type="password"
                    id="password"
                    placeholder="Enter your new password"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                            message: 'Must include uppercase, lowercase, and number'
                        }
                    })}
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
            </div>

            <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
            >
                {isLoading ? "Updating..." : "Update Password"}
            </button>
        </form>
    );
};

// export const UpdatePassword = () => {
//  const [searchParams]= useSearchParams();
//   const { register, handleSubmit, formState, reset } = useForm();
//   const queryClient = useQueryClient();
//   const token = searchParams.get("token");
//   if (!token) {
//     console.error("No token found in the URL");
//     return <p>Invalid or missing token. Please try again.</p>;
// }
//   const { mutate, isLoading: isLogin } = useMutation({
    
//     mutationFn: ({ token,password }) => UpdateUserPassword( token, password),
    
//     mutationKey: ["update-password"],
//     // data passed here is the data returned from the API
//     // so we can use it to set the user data in the queryClient
//     onSuccess: ({status}) => {
//       if (!status || status !== "success") {
//         console.error("Invalid status received from API:", status);
       
//         toast.error("Failed to update password response");
//         return;
//       }

//       toast.success("Update Was successful");
//       queryClient.setQueryData(["user"], status);
//       reset(); // Dispatch the action
//     },
//     onError: (error) => {
//       console.error("Full error object:", error);
//       toast.error(error?.message|| "Invalid Update credentials");
//     },
//   });

//   const { errors } = formState;
//   return (
//     <form
//     className="space-y-6 max-w-md mx-auto p-1"
//     onSubmit={handleSubmit(async (data) => {
//       const {  password } = data;
//       console.log( "Token:", token, "Password:", password);
//       mutate({ token, password });
//     })}
//     onReset={reset}
//     //
//   >
//     {/* Header */}
//     <h2 className="text-3xl font-bold text-center text-gray-900 mb-0 mt-0.5">Update Password</h2>
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
//       {isLogin ? "Updating..." : "Update Password"}
//     </button>
//   </form>
//   )
// };

