import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FaChevronLeft } from "react-icons/fa6";
import { Bounce } from "react-awesome-reveal";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import loanRequestImage from "../assets/images/Loan_request.jpeg";
import { getLoan } from "../services/LoanApi";

const formatNGN = (value) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export function LoanForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loanAmountDisplay, setLoanAmountDisplay] = useState("");
  const [monthlySavingsDisplay, setMonthlySavingsDisplay] = useState("");

  const TestData = { Savings: 200000 };
  const minMonthlySavings = TestData?.Savings ? TestData.Savings / 2 : 0;
  const minimumLoanableAmount = TestData?.Savings ? TestData.Savings + 5000 : 0;
  const maximumLoanableAmount = TestData?.Savings ? TestData.Savings * 2 : 0;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loanAmount: maximumLoanableAmount,
      repayment: "6",
      monthlySavings: minMonthlySavings,
    },
  });

  useEffect(() => {
    setLoanAmountDisplay(formatNGN(maximumLoanableAmount));
    setMonthlySavingsDisplay(formatNGN(minMonthlySavings));
  }, [maximumLoanableAmount, minMonthlySavings]);

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

  const repaymentPeriod = useWatch({ control, name: "repayment" });
  const loanAmountValue = useWatch({ control, name: "loanAmount" });

  const repaymentAmount =
    loanAmountValue > 0
      ? loanAmountValue / parseInt(repaymentPeriod || "6", 10)
      : 0;

  const formattedRepaymentAmount = formatNGN(repaymentAmount);

  const handleLoanAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, "");
    setLoanAmountDisplay(rawValue);
  };

  const handleLoanAmountBlur = () => {
    const numValue = parseFloat(loanAmountDisplay.replace(/[^0-9.]/g, "")) || 0;
    const clampedValue = Math.min(
      Math.max(numValue, minimumLoanableAmount),
      maximumLoanableAmount
    );
    setLoanAmountDisplay(formatNGN(clampedValue));
    setValue("loanAmount", clampedValue, { shouldValidate: true });
  };

  const handleMonthlySavingsChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, "");
    setMonthlySavingsDisplay(rawValue);
  };

  const handleMonthlySavingsBlur = () => {
    const numValue = parseFloat(monthlySavingsDisplay.replace(/[^0-9.]/g, "")) || 0;
    const clampedValue = Math.max(numValue, minMonthlySavings);
    setMonthlySavingsDisplay(formatNGN(clampedValue));
    setValue("monthlySavings", clampedValue, { shouldValidate: true });
  };

  const onSubmitHandler = (formData) => {
    if (!selectedFile) {
      toast.error("Please select a payment slip");
      return;
    }

    const formattedData = {
      ...formData,
      loanAmount: formatNGN(formData.loanAmount),
      repaymentAmount: formatNGN(repaymentAmount),
    };

    const formDataToSend = new FormData();
    Object.entries(formattedData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    formDataToSend.append("paySlip", selectedFile);

    mutate(formDataToSend);
  };

  return (
    <div className="container mx-auto my-6">
      <div className="flex justify-between mb-4">
        <p className="text-3xl font-bold">Request Loan</p>
        <Link to="/" className="flex gap-3 items-center text-2xl">
          <FaChevronLeft /> Back
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
              <span className="text-2xl font-bold text-black bg-gray-100 p-2 rounded-2xl shadow-2xl shadow-gray-200">
                {formatNGN(TestData.Savings)}
              </span>
            </p>

            {/* Loan Amount Input */}
            <div className="p-2">
              <label htmlFor="loanAmountDisplay">
                <span className="text-red-700 p-2">*</span>Loan Amount
              </label>
              <input
                id="loanAmountDisplay"
                type="text"
                value={loanAmountDisplay}
                onChange={handleLoanAmountChange}
                onBlur={handleLoanAmountBlur}
                placeholder="Enter Your Loan Amount"
                className="block rounded-md w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400"
              />
              <input
                type="hidden"
                {...register("loanAmount", {
                  required: "This is required",
                  min: {
                    value: minimumLoanableAmount,
                    message: `Minimum: ${formatNGN(minimumLoanableAmount)}`,
                  },
                  max: {
                    value: maximumLoanableAmount,
                    message: `Maximum: ${formatNGN(maximumLoanableAmount)}`,
                  },
                })}
              />
              <p className="text-red-600">{errors.loanAmount?.message}</p>
            </div>

            {/* Repayment Duration */}
            <div className="p-2">
              <label htmlFor="repayment">
                <span className="text-red-700 p-2">*</span>Repayment Duration
              </label>
              <select
                {...register("repayment", {
                  required: "Please select repayment period",
                })}
                id="repayment"
                className="mt-2 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 outline-gray-300"
              >
                {[3, 4, 5, 6, 7, 8].map((month) => (
                  <option key={month} value={month}>
                    {month} Month(s)
                  </option>
                ))}
              </select>
              <p className="text-red-600">{errors.repayment?.message}</p>
            </div>

            {/* Repayment Amount */}
            <div className="p-2">
              <label htmlFor="repaymentAmount">
                <span className="text-red-700 p-2">*</span>Repayment Amount Monthly
              </label>
              <input
                id="repaymentAmount"
                type="text"
                value={formattedRepaymentAmount}
                readOnly
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300"
              />
              <input
                type="hidden"
                {...register("repaymentAmount")}
                value={repaymentAmount}
              />
            </div>

            {/* Monthly Savings */}
            <div className="p-2">
              <label htmlFor="monthlySavingsDisplay">
                <span className="text-red-700 p-1">*</span>Monthly Savings Amount
              </label>
              <input
                id="monthlySavingsDisplay"
                type="text"
                value={monthlySavingsDisplay}
                onChange={handleMonthlySavingsChange}
                onBlur={handleMonthlySavingsBlur}
                placeholder="Enter Your Monthly Savings Amount"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300"
              />
              <input
                type="hidden"
                {...register("monthlySavings", {
                  required: "This is required",
                  min: {
                    value: minMonthlySavings,
                    message: `Minimum: ${formatNGN(minMonthlySavings)}`,
                  },
                })}
              />
              <p className="text-red-600 mt-1 h-5">
                {errors.monthlySavings?.message || "\u00A0"}
              </p>
            </div>

            {/* Purpose of Loan */}
            <div className="p-2">
              <label htmlFor="about">
                <span className="text-red-700 p-2">*</span>Purpose of Loan
              </label>
              <textarea
                {...register("about", { required: "This is required" })}
                id="about"
                rows={3}
                placeholder="Give a name or a brief purpose for loan request"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300"
              />
              <p className="text-red-600">{errors.about?.message}</p>
            </div>

            {/* Upload Pay Slip */}
            <div className="p-2">
              <label htmlFor="paySlip">
                <span className="text-red-700 p-2">*</span>Upload Pay Slip
              </label>
              <input
                type="file"
                id="paySlip"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mt-1 block w-full text-sm text-slate-500"
              />
            </div>

            {/* Submit */}
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
