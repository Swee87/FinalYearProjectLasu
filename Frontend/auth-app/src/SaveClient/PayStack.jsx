import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

function PayStack() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");

  const { register, handleSubmit } = useForm();

  const initializePayment = async (formData) => {
    const { email, fullName, phoneNumber, amount } = formData;

    if (!fullName || !email || !phoneNumber || !amount) {
      alert("Please enter full Name, email, phone Number, and amount.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/PayStackInitialize/initialize-payment",
        { fullName, email, phoneNumber, amount }
      );

      const data = response.data;
      console.log("Response from backend:", data);

      // ✅ Check if Paystack returned the authorization URL
      if (data?.status && data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
        console.log(
          "Redirecting to Paystack URL:",
          data.data.authorization_url
        );
      } else {
        alert("Payment initialization failed.");
        console.error("Paystack response:", data);
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      alert("Error initializing payment.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-blue-600 my-4 p-4 text-center">
        Welcome, Please Proceed With Your Payment
      </h2>
      {/* Paystack payment form */}
      <form
        onSubmit={handleSubmit(initializePayment)}
        className="w-[70%] mx-auto bg-white shadow-lg p-4"
      >
        {/* User Full Name */}
        <div className="p-2 text-blue-600">
          <label htmlFor="fullName">Full Name:</label>
          <input
            {...register("fullName", { required: "This is required" })}
            placeholder="Enter Your Full Name"
            type="text"
            id="fullName"
            onChange={(e) => setFullName(e.target.value)}
            className="block rounded-md w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-blue-400"
          />
        </div>
        {/* Email */}
        <div className="p-2 text-blue-600">
          <label htmlFor="email">Email:</label>
          <input
            {...register("email", { required: "This is required" })}
            placeholder="Enter Your Email"
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            className="block rounded-md w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-blue-400"
          />
        </div>
        {/* Phone Number */}
        <div className="p-2 text-blue-600">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            {...register("phoneNumber", { required: "This is required" })}
            placeholder="Enter Your Phone Number"
            id="phoneNumber"
            type="tel"
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="block rounded-md w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-blue-400"
          />
        </div>
        {/* Amount */}
        <div className="p-2 text-blue-600">
          <label htmlFor="amount">Amount:</label>
          <input
            {...register("amount", { required: "This is required" })}
            placeholder="Enter amount in Naira"
            id="amount"
            type="number"
            onChange={(e) => setAmount(e.target.value)}
            className="block rounded-md w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-blue-400"
          />
        </div>
        {/* Payment Button  */}
        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800
                text-white font-semibold rounded-2xl shadow-lg transform transition-all duration-300 
                hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer mx-auto flex"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
}

export default PayStack;
