// import { PaystackPaymentApi } from  '../services/Paystackapi'; 
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { PaystackPaymentApi } from "../services/Paystackapi"; 
import {Nav} from '../ui/Nav'

export function PayStack() {
  const { register, handleSubmit, reset ,  formState: { errors }} = useForm();

  const { mutate, isLoading } = useMutation({
    mutationFn: PaystackPaymentApi,
    onSuccess: (authorizationUrl) => {
      window.location.href = authorizationUrl; 
    },
    onError: (error) => {
      alert(error.message || "Failed to initialize payment");
    },
  });

  const onSubmit = (data) => {
    const amount = parseInt(data.amount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert("Amount must be a positive number");
      return;
    }

    mutate({ email: data.email, amount });
    reset(); // optional: reset form after submission
  };

  return (
    <>
    <Nav/>
    <div className="max-w-md mx-auto bg-white shadow-lg p-6 rounded-xl mt-10">
      <h2 className="text-xl font-semibold text-indigo-700 text-center mb-6">
        Proceed With Payment
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block mb-1 text-indigo-700 font-medium">
            Email:
          </label>
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            id="email"
            placeholder="e.g. user@example.com"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-red-600">{errors.email?.message}</p>
        </div>

        {/* Amount Field */}
     <div>
  <label htmlFor="amount" className="block mb-1 text-indigo-700 font-medium">
    Amount (NGN):
  </label>
  <input
    {...register("amount", {
      required: "Amount is required",
      min: {
        value: 1,
        message: "Amount must be greater than 0",
      },
      valueAsNumber: true,
    })}
    type="number"
    id="amount"
    min="1"
    placeholder="e.g. 5000"
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
    <p className="text-red-600">{errors.amount?.message}</p>
</div>


        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-white bg-indigo-700 hover:bg-indigo-800 font-semibold rounded-md transition duration-300"
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
    </>
  );
}








