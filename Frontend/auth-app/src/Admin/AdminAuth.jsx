import React, { useState } from "react";
import { AdminLogin } from "./adminLogin";
import { AdminRegister } from "./adminRegister";
import { ReactTyped } from "react-typed";

export  function AdminAuthPage() {
  const [currentForm, setCurrentForm] = useState("login"); // 'login' or 'register'

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side - Image & Branding */}
      <div 
        className="relative bg-cover bg-center w-full md:w-1/2"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-blue-900/40"></div>
        <div className="relative h-full flex flex-col justify-center items-center text-white p-8">
          <h1 className="text-4xl font-bold mb-4">Gbewa Coop Admin portal</h1>
          <p className="text-lg opacity-90 text-center">
          {currentForm === "login" ? (
                <ReactTyped
                strings={["Welcome back! Sign in to your admin account."]}
                typeSpeed={40}
                backSpeed={50}
                loop
                >
                 <span className="text-lg opacity-90 text-center block"></span>
                </ReactTyped>
            ) : (
                <ReactTyped
                strings={["Create your admin account to get started."]}
                typeSpeed={40}
                backSpeed={50}
                loop
         >
             <span className="text-lg opacity-90 text-center block"></span>
  </ReactTyped>
)}
          </p>
        </div>
      </div>
      
      {/* Right Side - Auth Forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6 flex justify-center space-x-4">
            <button
              onClick={() => setCurrentForm("login")}
              className={`px-4 py-2 font-medium transition-colors duration-300 ${
                currentForm === "login"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentForm("register")}
              className={`px-4 py-2 font-medium transition-colors duration-300 ${
                currentForm === "register"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Register
            </button>
          </div>

          {/* Conditional Form Rendering */}
          {currentForm === "login" ? <AdminLogin /> : <AdminRegister />}
        </div>
      </div>
    </div>
  );
}