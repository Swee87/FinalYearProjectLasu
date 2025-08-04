import React from "react";
import { FaX } from "react-icons/fa6";
import { Link } from "react-router-dom";

export function LoanModal({ onClose }) {
  return (
    <div
      id="modal"
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
      <div className="mt-8 bg-blue-400 rounded-xl w-[100%] lg:w-[50%] px-6 py-2 shadow-lg text-white shadow-blue-600">
        <div className="block lg:flex justify-between m-4">
          <p className="text-2xl font-bold">Loan Request Form </p>
          <button className="cursor-pointer" onClick={() => onClose()}>
            {" "}
            <FaX />
          </button>
        </div>
        <div>
          <p className="p-2">
            A loan form fee would be charged at the end of the request!
          </p>
          <p className="p-2">Below is the account details to pay to</p>
        </div>
        <table className="table-auto m-2">
          <tbody>
            <tr>
              <td>Account number:</td>
              <td className="font-bold">0270936432</td>
            </tr>
            <tr>
              <td>Account Name:</td>
              <td className="font-bold">Quadri Latifat Oluwatosin</td>
            </tr>
            <tr>
              <td>Bank Name:</td>
              <td className="font-bold">Wema Bank</td>
            </tr>
          </tbody>
        </table>
        <Link to="/loanform">
          <button className="bg-white text-blue-800 font-semibold p-4 rounded-xl shadow shadow-white cursor-pointer">
            Proceed to Request for loan
          </button>
        </Link>
      </div>
    </div>
  );
}
