import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Bounce } from "react-awesome-reveal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyCoopMember } from "../services/verifyCoop";

export const VerifyMemberShip = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (formData) => verifyCoopMember(formData),
    onSuccess: () => {
      toast.success("Verification submitted successfully!");
      reset();
    },
    onError: (error) => {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit verification");
    }
  });

  const onSubmit = (formData) => {
    //  Check if file is selected
    if (!selectedFile) {
        setFileError("Pay slip is required"); // Set manual error
        toast.error("Please upload a valid document");
        return;
      }

    const formDataToVerify = new FormData();
    formDataToVerify.append("phoneNumber", formData.phoneNumber);
    formDataToVerify.append("staffType", formData.staffType);
    formDataToVerify.append("bankName", formData.bankName);
    formDataToVerify.append("accountNumber", formData.accountNumber);
    formDataToVerify.append("payMentProof", selectedFile);

    // ✅ Log what we're sending
    console.log("Form Data Keys:", [...formDataToVerify.keys()]);
    console.log("Uploading file:", selectedFile.name);

    // ✅ Send to backend
    mutate(formDataToVerify);
  };

  return (
    <div className="container mx-auto my-6">
      <Bounce cascade>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg"
        >
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              📞 Phone Number
            </label>
            <input
              id="phoneNumber"
              type="text"
              placeholder="e.g. 08012345678"
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^(\+234|0)[7-9][01]\d{8}$/,
                  message: "Enter a valid Nigerian phone number"
                }
              })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Staff Type */}
          <div>
            <label htmlFor="staffType" className="block text-sm font-medium text-gray-700">
              👔 Staff Type
            </label>
            <select
              id="staffType"
              {...register("staffType", { required: "Staff type is required" })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select your role</option>
              <option value="faculty">Faculty</option>
              <option value="non-faculty">Non-Faculty</option>
              <option value="contract">Contract Staff</option>
              <option value="admin">Admin</option>
            </select>
            {errors.staffType && (
              <p className="mt-1 text-sm text-red-600">{errors.staffType.message}</p>
            )}
          </div>

          {/* Bank Name */}
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
              💰 Bank Name
            </label>
            <input
              id="bankName"
              type="text"
              placeholder="e.g. GTBank, First Bank"
              {...register("bankName", {
                required: "Bank name is required",
                minLength: {
                  value: 3,
                  message: "Minimum 3 characters"
                }
              })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.bankName && (
              <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
              🔢 Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              placeholder="e.g. 0123456789"
              {...register("accountNumber", {
                required: "Account number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Must be exactly 10 digits"
                }
              })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.accountNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>
            )}
          </div>

          {/* Upload Pay Slip */}
          <div>
            <label htmlFor="payMentProof" className="block text-sm font-medium text-gray-700">
              📄 Upload Pay Slip / ID
            </label>
            <input
              id="payMentProof"
              type="file"
              accept="image/*, .pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                setSelectedFile(file);
                setFileError(null); // Clear error when file is selected
              }}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
            />
            {fileError && (
              <p className="mt-1 text-sm text-red-600">{fileError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            disabled={isPending}
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isPending ? "Submitting..." : "Submit Verification"}
          </button>
        </form>
      </Bounce>
    </div>
  );
};