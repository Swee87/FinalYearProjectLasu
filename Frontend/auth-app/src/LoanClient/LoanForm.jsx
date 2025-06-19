import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaChevronLeft } from "react-icons/fa6";
import { Bounce } from "react-awesome-reveal";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import loanRequestImage from "../assets/images/Loan_request.jpeg";

import { getLoan } from "../services/LoanApi";

export function LoanForm() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Track selected file
  const [selectedFile, setSelectedFile] = useState(null);

  // Mutation setup
  const { mutate, isPending } = useMutation({
    mutationFn: (formData) => getLoan(formData),
    onSuccess: () => {
      toast.success("Loan submitted successfully!");
      reset();
    },
    onError: (error) => {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit loan");
    },
  });

  const TestData = { Savings: 200000 };
  const minMonthlySavings = TestData?.Savings ? TestData.Savings / 2 : 0;

  // Handle form submission
  const onSubmitHandler = (formData) => {
    if (!selectedFile) {
      toast.error("Please select a payment slip");
      return;
    }

    const formDataToSend = new FormData();

    formDataToSend.append("loanAmount", formData.loanAmount);
    formDataToSend.append("monthlySavings", formData.monthlySavings);
    formDataToSend.append("repayment", formData.repayment);
    formDataToSend.append("about", formData.about);
    formDataToSend.append("paySlip", selectedFile); // ← Append actual file

    mutate(formDataToSend);
  };

  return (
    <div className="container mx-auto my-6">
      <div className="flex justify-between mb-4">
        <p className="text-3xl font-bold">Request Loan</p>
        <Link to="/" className="flex gap-3 items-center text-2xl">
          {" "}
          <FaChevronLeft /> Back{" "}
        </Link>
      </div>

      <Bounce cascade>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={loanRequestImage}
              alt="Loan Request"
              className="w-full rounded-lg shadow-xl"
            />
          </div>

          <Toaster />

          <form
            onSubmit={handleSubmit(onSubmitHandler)}
            className="lg:col-start-2"
          >
            <p className="flex gap-2 p-4 text-xl font-semibold items-center">
              Available Balance:
              <span
                id="balance"
                className="text-2xl font-bold text-black bg-gray-100 p-2 rounded-2xl shadow-2xl shadow-gray-200"
              >
                ₦{TestData.Savings.toLocaleString()}
              </span>
            </p>

            {/* Loan Amount */}
            <div className="p-2">
              <label htmlFor="loanAmount">
                <span className="text-red-700 p-2">*</span>Loan Amount
              </label>
              <input
                {...register("loanAmount", { required: "This is required" })}
                id="loanAmount"
                type="number"
                placeholder="Enter Your Loan Amount"
                className="block rounded-md w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400"
              />
              <p className="text-red-600">{errors.loanAmount?.message}</p>
            </div>

            {/* Repayment Duration */}
            <div className="p-2">
              <label
                htmlFor="repayment"
                className="block text-sm/6 font-medium text-gray-900"
              >
                <span className="text-red-700 p-2">*</span>
                Repayment Duration
              </label>
              <div className="mt-2 grid grid-cols-1">
                <select
                  {...register("repayment", { required: true })}
                  id="repayment"
                  defaultValue="6"
                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                >
                  <option value="6">6 Month(s)</option>
                  <option value="1">1 Month(s)</option>
                  <option value="2">2 Month(s)</option>
                  <option value="5">5 Month(s)</option>
                  <option value="7">7 Month(s)</option>
                  <option value="12">12 Month(s)</option>
                </select>
                <p className="text-red-600">{errors.repayment?.message}</p>
              </div>
            </div>
            {/* Monthly Savings */}
            <div className="p-2">
              <label htmlFor="monthlySavings">
                <span className="text-red-700 p-1">*</span>Monthly Savings
                Amount
              </label>
              <input
                {...register("monthlySavings", {
                  required: "This is required",
                  min: {
                    value: minMonthlySavings,
                    message: `The minimum amount is ₦${minMonthlySavings.toLocaleString()}`,
                  },
                })}
                id="monthlySavings"
                type="number"
                min={minMonthlySavings}
                placeholder="Enter Your Monthly Savings Amount"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400"
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= minMonthlySavings) {
                    register("monthlySavings").onChange(e);
                  }
                }}
              />
              <p className="text-red-600 mt-1 h-5">
                {errors.monthlySavings?.message || "\u00A0"}
              </p>
            </div>

            {/* Purpose of Loan */}
            <div className="p-2">
              <label
                htmlFor="about"
                className="block text-sm/6 font-medium text-gray-900"
              >
                <span className="text-red-700 p-2">*</span>
                Purpose of Loan
              </label>
              <div className="mt-2">
                <textarea
                  {...register("about", { required: "This is required" })}
                  id="about"
                  rows={3}
                  placeholder="Give a name or a brief purpose for loan request"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <p className="text-red-600">{errors.about?.message}</p>
              </div>
            </div>

            {/* Upload Pay Slip */}
            <div className="p-2">
              <label
                htmlFor="paySlip"
                className="block text-sm/6 font-medium text-gray-900"
              >
                <span className="text-red-700 p-2">*</span>
                Upload Pay Slip
              </label>
              <input
                type="file"
                id="paySlip"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-slate-500"
              />
              <p className="text-red-600">{errors.paySlip?.message}</p>
            </div>

            {/* Submit Button */}
            <button
              disabled={isPending}
              type="submit"
              className="bg-blue-600 font-semibold text-xl text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer disabled:bg-blue-400"
            >
              {isPending ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </Bounce>
    </div>
  );
}
