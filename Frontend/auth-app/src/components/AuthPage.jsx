// src/components/AuthPage.js
import React, { useState } from "react";
import { LoginPage } from "./LoginPage";
import { SignupPage }from "./SignupPage";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export const AuthPage = () => {

  let isLoginAuth = useSelector((state) => state.auth.isAuthenticated);
  const [isLogin, setIsLogin] = useState(isLoginAuth);

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Outer Container */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        {/* Render Login or Signup Page Dynamically */}
        {!isLogin ? <LoginPage /> : <SignupPage />}

        {/* Toggle Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="text-blue-500 hover:underline font-medium text-sm focus:outline-none mt-[-10px]"
          >
            {!isLogin ? "Need an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>

        {/* Forgot Password Link */}
        {/* <div className="text-center">
          <Link
            to="/reset-password"
            className="text-blue-500 hover:underline font-medium text-sm focus:outline-none"
          >
            Forgot Password?
          </Link>
        </div> */}
      </div>
    </div>
  );
};

