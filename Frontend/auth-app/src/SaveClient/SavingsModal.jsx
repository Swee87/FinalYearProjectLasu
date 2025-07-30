import React, { useState } from "react";
import { FaX } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function SavingsModal({ onClose }) {
  const [selectMethod, setSelectMethod] = useState("");
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (selectMethod) {
      navigate(selectMethod); // Takes you to the selected route
    } else {
      alert("Please select a method first.");
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const amountToSave = watch("amountToSave");

  return (
    <div
      className="modal-container flex fixed top-0 left-0 backdrop-blur-md bg-gray-200 bg-opacity-5 w-screen h-screen justify-center items-center transition-opacity duration-500"
      onClick={(e) => {
        if (
          e.target.className ===
          "modal-container flex fixed top-0 left-0 bg-purple-400 bg-opacity-5 w-screen h-screen justify-center items-center transition-opacity duration-500"
        ) {
          onClose();
        }
      }}
    >
      <div className="mt-8 bg-white rounded-xl w-[100%] lg:w-[50%] px-6 py-2 shadow-lg text-blue-600 shadow-blue-600">
        <div className="flex justify-between p-2 font-bold text-2xl mb-4">
          <p>Save Money</p>
          <button className="cursor-pointer" onClick={() => onClose()}>
            {" "}
            <FaX />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-center justify-center">
            <div className="p-2 mb-4 mt-2">
              <label htmlFor="amountToSave">Enter Amount</label>
              <input
                {...register("amountToSave")}
                type="number"
                placeholder="Amount to save"
                id="amountToSave"
                className="block rounded-md w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400"
              />
            </div>
            <div>
              <p className="text-blue-600 text-xl font-bold bg-gray-50 shadow-lg p-2 h-12 w-full rounded-lg mt-2">
                N {amountToSave}.00
              </p>
            </div>
          </div>
          <div className="mb-4 p-2">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              {...register("paymentMethod")}
              id="paymentMethod"
              value={selectMethod}
              onChange={(e) => setSelectMethod(e.target.value)}
              className="block rounded-md w-full bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400"
            >
              <option value="">Select Payment Method</option>
              <option value="/payStackPayment">Card</option>
              <option value="">Salary</option>
            </select>
          </div>
        </form>
        <div className="text-center">
          <button
            type="submit"
            onClick={handleNavigate}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800
                text-white font-semibold rounded-2xl shadow-lg transform transition-all duration-300 
                hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            Save Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default SavingsModal;
