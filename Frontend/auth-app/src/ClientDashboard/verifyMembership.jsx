import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Bounce } from "react-awesome-reveal";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { verifyCoopMember } from "../services/verifyingCoopApi";
import { getBankDetails, verifyBankAccount } from "../services/getBankdetails";
import { useDebounce } from "../hooks/useDebounce";
import { getVerifiedMembers } from "../services/AdminRoutes/ApproveMember";

export const VerifyMemberShip = () => {
  const { register, handleSubmit, setValue, trigger, clearErrors, reset, watch, formState: { errors } } = useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [bankDetails, setBankDetails] = useState([]);
  const [bank_code, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return localStorage.getItem('formSubmitted') === 'true';
  });
  const debouncedAccountNumber = useDebounce(accountNumber, 500);
  const isValidAccountNumber = /^\d{10}$/.test(debouncedAccountNumber);
  const queryClient = useQueryClient();
  const accountNameValue = watch("accountName");

  useEffect(() => {
    console.log("Current accountName:", accountNameValue);
  }, [accountNameValue]);

  const { data: verifiedMembers, isLoading: isMembersLoading } = useQuery({
    queryKey: ["verifiedMembers"],
    queryFn: getVerifiedMembers,
  });

  console.log("Verified Members:", verifiedMembers || []);
  const isMemberVerified = verifiedMembers?.isVerified ?? false;

  console.log("Is Member Verified:", isMemberVerified);

  const { data: bankList, isLoading, error } = useQuery({
    queryKey: ["bankList"],
    queryFn: getBankDetails,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (bankList && Array.isArray(bankList)) {
      setBankDetails(bankList);
    }
  }, [bankList]);

  const { data: bankVerification, isLoading: isVerifying, error: verificationError } = useQuery({
    queryKey: ["bankVerification", debouncedAccountNumber, bank_code],
    queryFn: () => verifyBankAccount(debouncedAccountNumber, bank_code),
    enabled: isValidAccountNumber && !!bank_code,
  });

  useEffect(() => {
    if (bankVerification?.name) {
      setValue("accountName", bankVerification.name, {
        shouldDirty: true,
        shouldValidate: true
      });
      clearErrors("accountName");
    } else if (verificationError) {
      setValue("accountName", "", {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  }, [bankVerification, verificationError, setValue, clearErrors]);

  const handleBankChange = (e) => {
    const selectedBankName = e.target.value;
    const selectedBank = bankDetails.find(bank => bank.name === selectedBankName);
    if (selectedBank) {
      setBankCode(selectedBank.code);
    } else {
      setBankCode("");
      setValue("accountName", "");
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (formData) => verifyCoopMember(formData),
    onSuccess: () => {
      toast.success("Verification submitted successfully!");
      reset();
      setSelectedFile(null);
      setAccountNumber("");
      setBankCode("");
      setIsSubmitted(true);
      localStorage.setItem('formSubmitted', 'true');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit verification");
    }
  });

  const onSubmit = (formData) => {
    console.log("Form data on submit:", formData);
    if (!selectedFile) {
      setFileError("Pay slip is required");
      toast.error("Please upload a valid document");
      return;
    }

    if (!formData.accountName || formData.accountName.trim() === "") {
      toast.error("Please wait for account verification to complete");
      return;
    }

    const formDataToVerify = new FormData();
    formDataToVerify.append("phoneNumber", formData.phoneNumber);
    formDataToVerify.append("staffType", formData.staffType);
    formDataToVerify.append("bankName", formData.bankName);
    formDataToVerify.append("accountNumber", formData.accountNumber);
    formDataToVerify.append("accountName", formData.accountName);
    formDataToVerify.append("payMentProof", selectedFile);
    formDataToVerify.append("monthlySavings", formData.monthlySavings);
    formDataToVerify.append("SavingsType", formData.SavingsType);

    mutate(formDataToVerify);
  };

  return (
    <>
      {(isMemberVerified || isSubmitted) ? (
        <div className="container mx-auto my-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Membership Already Submitted</h2>
          <p className="text-gray-600">You have already submitted your membership details for verification. If you need to update your information, please contact support.</p>
        </div>
      ) : (
        <div className="container mx-auto my-6 relative">
          {isPending && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg font-medium text-gray-800">Submitting...</span>
              </div>
            </div>
          )}
          <Bounce cascade>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg"
            >
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

              <div>
                <label htmlFor="monthlySavings" className="block text-sm font-medium text-gray-700">
                  monthlySavings
                </label>
                <input
                  id="monthlySavings"
                  type="number"
                  placeholder="e.g. 5000"
                  {...register("monthlySavings", {
                    required: "monthlySavings is required",
                    pattern: {
                      message: "Enter a valid NUMBER"
                    }
                  })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.monthlySavings && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthlySavings.message}</p>
                )}
              </div>

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

              <div>
                <label htmlFor="SavingsType" className="block text-sm font-medium text-gray-700">
                  💰 Savings Type
                </label>
                <select
                  id="SavingsType"
                  {...register("SavingsType", { required: "Savings type is required" })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select your savings type</option>
                  <option value="salary">Salary Deduction</option>
                  <option value="card">Card Payment</option>
                </select>
                {errors.SavingsType && (
                  <p className="mt-1 text-sm text-red-600">{errors.SavingsType.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                  💰 Bank Name
                </label>
                <select
                  id="bankName"
                  {...register("bankName", {
                    required: "Bank name is required"
                  })}
                  onChange={handleBankChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select your bank</option>
                  {bankDetails.map((bank) => (
                    <option key={bank.id} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>
                )}
              </div>

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
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    if (e.target.value.length !== 10) {
                      setValue("accountName", "");
                    }
                  }}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                  🏦 Account Name
                </label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[2.5rem]">
                  {isVerifying ? (
                    <span className="text-gray-500">Verifying account...</span>
                  ) : verificationError ? (
                    <span className="text-red-500">
                      {verificationError.message || "Verification failed"}
                    </span>
                  ) : bankVerification?.name ? (
                    <span className="font-medium">{bankVerification.name}</span>
                  ) : (
                    <span className="text-gray-400">
                      Account name will appear here after verification
                    </span>
                  )}
                </div>
                <input
                  type="hidden"
                  {...register("accountName", {
                    required: "Account name is required"
                  })}
                />
                {errors.accountName && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="payMentProof" className="block text-sm font-medium text-gray-700">
                  📄 Upload Payment Proof / ID
                </label>
                <input
                  id="payMentProof"
                  type="file"
                  accept="image/*, .pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setSelectedFile(file);
                    setFileError(null);
                  }}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
                />
                {fileError && (
                  <p className="mt-1 text-sm text-red-600">{fileError}</p>
                )}
              </div>

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
      )}
    </>
  );
};















// import React, { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import { Bounce } from "react-awesome-reveal";
// import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
// import { verifyCoopMember } from "../services/verifyingCoopApi";
// import { getBankDetails, verifyBankAccount } from "../services/getBankdetails";
// import { useDebounce } from "../hooks/useDebounce";
// import { getVerifiedMembers } from "../services/AdminRoutes/ApproveMember";

// export const VerifyMemberShip = () => {
//   const { register, handleSubmit, setValue, trigger, clearErrors, reset, watch, formState: { errors } } = useForm();
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [fileError, setFileError] = useState(null);
//   const [bankDetails, setBankDetails] = useState([]);
//   const [bank_code, setBankCode] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const debouncedAccountNumber = useDebounce(accountNumber, 500);
//   const isValidAccountNumber = /^\d{10}$/.test(debouncedAccountNumber);

//   const queryClient = useQueryClient();

//   // Watch accountName from the same form instance
//   const accountNameValue = watch("accountName");

//   useEffect(() => {
//     console.log("Current accountName:", accountNameValue);
//   }, [accountNameValue]);

// const { data: verifiedMembers, isLoading: isMembersLoading } = useQuery({
//     queryKey: ["verifiedMembers"],
//     queryFn: getVerifiedMembers,
//     // enabled: !!queryClient.getQueryData("verifiedMembers"),
//   });
//   console.log("Verified Members:", verifiedMembers|| []);
//   const isMemberVerified = verifiedMembers?.isVerified === false
//   console.log("Is Member Verified:", isMemberVerified);

//   // Fetch bank details
//   const { data: bankList, isLoading, error } = useQuery({
//     queryKey: ["bankList"],
//     queryFn: getBankDetails,
//     refetchOnWindowFocus: false,
//     retry: 1,
//   });

//   // Update bankDetails state
//   useEffect(() => {
//     if (bankList && Array.isArray(bankList)) {
//       setBankDetails(bankList);
//     }
//   }, [bankList]);

//   // Verify bank account
//   const { data: bankVerification, isLoading: isVerifying, error: verificationError } = useQuery({
//     queryKey: ["bankVerification", debouncedAccountNumber, bank_code],
//     queryFn: () => verifyBankAccount(debouncedAccountNumber, bank_code),
//     enabled: isValidAccountNumber && !!bank_code,
//   });

//   // Handle bank verification result
//   useEffect(() => {
//     if (bankVerification?.name) {
//       setValue("accountName", bankVerification.name, { 
//         shouldDirty: true, 
//         shouldValidate: true 
//       });
//       clearErrors("accountName");
//     } else if (verificationError) {
//       setValue("accountName", "", { 
//         shouldDirty: true, 
//         shouldValidate: true 
//       });
//       // Don't clear errors here - let validation handle it
//     }
//   }, [bankVerification, verificationError, setValue, clearErrors]);

//   // Set bank code when bank is selected
//   const handleBankChange = (e) => {
//     const selectedBankName = e.target.value;
//     const selectedBank = bankDetails.find(bank => bank.name === selectedBankName);
//     if (selectedBank) {
//       setBankCode(selectedBank.code);
//     } else {
//       setBankCode("");
//       setValue("accountName", "");
//     }
//   };

//   const { mutate, isPending } = useMutation({
//     mutationFn: (formData) => verifyCoopMember(formData),
//     onSuccess: () => {
//       toast.success("Verification submitted successfully!");
//       reset();
//       setSelectedFile(null);
//       setAccountNumber("");
//       setBankCode("");
//     },
//     onError: (error) => {
//       toast.error(error.message || "Failed to submit verification");
//     }
//   });

//   const onSubmit = (formData) => {
//     console.log("Form data on submit:", formData); // Debug log
    
//     if (!selectedFile) {
//       setFileError("Pay slip is required");
//       toast.error("Please upload a valid document");
//       return;
//     }

//     // Check if account name is present
//     if (!formData.accountName || formData.accountName.trim() === "") {
//       toast.error("Please wait for account verification to complete");
//       return;
//     }

//     const formDataToVerify = new FormData();
//     formDataToVerify.append("phoneNumber", formData.phoneNumber);
//     formDataToVerify.append("staffType", formData.staffType);
//     formDataToVerify.append("bankName", formData.bankName);
//     formDataToVerify.append("accountNumber", formData.accountNumber);
//     formDataToVerify.append("accountName", formData.accountName);
//     formDataToVerify.append("payMentProof", selectedFile);
//     formDataToVerify.append("monthlySavings", formData.monthlySavings);
//     formDataToVerify.append("SavingsType", formData.SavingsType);

//     mutate(formDataToVerify);
//   };

//   return (
//     !isMemberVerified ? (
//     <div className="container mx-auto my-6">
//       <Bounce cascade>
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="space-y-6 max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg"
//         >
//           {/* Phone Number */}
//           <div>
//             <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
//               📞 Phone Number
//             </label>
//             <input
//               id="phoneNumber"
//               type="text"
//               placeholder="e.g. 08012345678"
//               {...register("phoneNumber", {
//                 required: "Phone number is required",
//                 pattern: {
//                   value: /^(\+234|0)[7-9][01]\d{8}$/,
//                   message: "Enter a valid Nigerian phone number"
//                 }
//               })}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//             {errors.phoneNumber && (
//               <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
//             )}
//           </div>
//                <div>
//             <label htmlFor="monthlySavings" className="block text-sm font-medium text-gray-700">
//               monthlySavings
//             </label>
//             <input
//               id="monthlySavings"
//               type="number"
//               placeholder="e.g. 5000"
//               {...register("monthlySavings", {
//                 required: "monthlySavings is required",
//                 pattern: {
//                   message: "Enter a valid NUMBER"
//                 }
//               })}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//             {errors.monthlySavings && (
//               <p className="mt-1 text-sm text-red-600">{errors.monthlySavings.message}</p>
//             )}
//           </div>
//           {/* Staff Type */}
//           <div>
//             <label htmlFor="staffType" className="block text-sm font-medium text-gray-700">
//               👔 Staff Type
//             </label>
//             <select
//               id="staffType"
//               {...register("staffType", { required: "Staff type is required" })}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="">Select your role</option>
//               <option value="faculty">Faculty</option>
//               <option value="non-faculty">Non-Faculty</option>
//               <option value="contract">Contract Staff</option>
//               <option value="admin">Admin</option>
//             </select>
//             {errors.staffType && (
//               <p className="mt-1 text-sm text-red-600">{errors.staffType.message}</p>
//             )}
//           </div>
//             {/* SAVINGS TYPE EITHER BY SALARY OR BY CARD PAYMENT */}

//             <div>
//             <label htmlFor="SavingsType" className="block text-sm font-medium text-gray-700">
//               💰 Savings Type
//             </label>
//             <select
//               id="SavingsType"
//               {...register("SavingsType", { required: "Savings type is required" })}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="">Select your savings type</option>
//               <option value="salary">Salary Deduction</option>
//               <option value="card">Card Payment</option>
//             </select>
//             {errors.SavingsType && (
//               <p className="mt-1 text-sm text-red-600">{errors.SavingsType.message}</p>
//             )}
//           </div>
//           {/* Bank Name */}
//           <div>
//             <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
//               💰 Bank Name
//             </label>
//             <select
//               id="bankName"
//               {...register("bankName", { 
//                 required: "Bank name is required"
//               })}
//               onChange={handleBankChange}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             >
//               <option value="">Select your bank</option>
//               {bankDetails.map((bank) => (
//                 <option key={bank.id} value={bank.name}>
//                   {bank.name}
//                 </option>
//               ))}
//             </select>
//             {errors.bankName && (
//               <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>
//             )}
//           </div>

//           {/* Account Number */}
//           <div>
//             <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
//               🔢 Account Number
//             </label>
//             <input
//               id="accountNumber"
//               type="text"
//               placeholder="e.g. 0123456789"
//               {...register("accountNumber", {
//                 required: "Account number is required",
//                 pattern: {
//                   value: /^\d{10}$/,
//                   message: "Must be exactly 10 digits"
//                 }
//               })}
//               onChange={(e) => {
//                 setAccountNumber(e.target.value);
//                 // Clear account name when account number changes
//                 if (e.target.value.length !== 10) {
//                   setValue("accountName", "");
//                 }
//               }}
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//             {errors.accountNumber && (
//               <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>
//             )}
//           </div>

//           {/* ACCOUNT NAME */}
//           <div>
//             <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
//               🏦 Account Name
//             </label>
//             <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50 min-h-[2.5rem]">
//               {isVerifying ? (
//                 <span className="text-gray-500">Verifying account...</span>
//               ) : verificationError ? (
//                 <span className="text-red-500">
//                   {verificationError.message || "Verification failed"}
//                 </span>
//               ) : bankVerification?.name ? (
//                 <span className="font-medium">{bankVerification.name}</span>
//               ) : (
//                 <span className="text-gray-400">
//                   Account name will appear here after verification
//                 </span>
//               )}
//             </div>

//             {/* Hidden input for account name */}
//             <input 
//               type="hidden"
//               {...register("accountName", {
//                 required: "Account name is required"
//               })}
//             />

//             {errors.accountName && (
//               <p className="mt-1 text-sm text-red-600">{errors.accountName.message}</p>
//             )}
//           </div>

//           {/* Upload Pay Slip */}
//           <div>
//             <label htmlFor="payMentProof" className="block text-sm font-medium text-gray-700">
//               📄 Upload Payment Proof / ID
//             </label>
//             <input
//               id="payMentProof"
//               type="file"
//               accept="image/*, .pdf"
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 setSelectedFile(file);
//                 setFileError(null);
//               }}
//               className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
//             />
//             {fileError && (
//               <p className="mt-1 text-sm text-red-600">{fileError}</p>
//             )}
//           </div>

//           {/* Submit Button */}
//           <button
//             disabled={isPending}
//             type="submit"
//             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             {isPending ? "Submitting..." : "Submit Verification"}
//           </button>
//         </form>
//       </Bounce>
//     </div>) : <div className="container mx-auto my-6 text-center">
//       <h2 className="text-2xl font-bold text-gray-800 mb- 4">Membership Already Verified</h2>
//       <p className="text-gray-600">You have already submitted your membership details for verification. If you need to update your information, please contact support.</p>
//     </div>
//   );
// };