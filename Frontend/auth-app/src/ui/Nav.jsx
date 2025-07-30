import React from 'react'

import { motion } from "framer-motion";

export const Nav = () => {
  return (
    <nav className="fixed w-full bg-gradient-to-r from-gray-800 to-gray-900 shadow-xl p-4 top-0 left-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Animated Logo with Continuous Rotation */}
        <motion.div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="w-8 h-8 rounded-full border-2 border-transparent"
            style={{
              background: `
                linear-gradient(${Math.random() * 360}deg, 
                rgba(99, 102, 241, 0.8) 0%, 
                rgba(129, 140, 248, 0.6) 50%, 
                transparent 100%)
              `,
              boxShadow: "0 0 10px rgba(165, 180, 252, 0.3)"
            }}
          />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 text-2xl font-extrabold tracking-tighter">
           Gbewa Cooperative
          </span>
        </motion.div>

        {/* Beautiful Navigation Links */}
        <ul className="flex items-center space-x-8">
          <li>
            <motion.a
              href="/home"
              whileHover={{
                scale: 1.05,
                color: "#ffffff",
                textShadow: "0 0 8px rgba(255,255,255,0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              className="relative text-gray-300 font-medium text-lg px-4 py-2 transition-all duration-300 group"
            >
              Home
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </li>
          <li>
            <motion.a
              href="/about"
              whileHover={{
                scale: 1.05,
                color: "#ffffff",
                textShadow: "0 0 8px rgba(255,255,255,0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              className="relative text-gray-300 font-medium text-lg px-4 py-2 transition-all duration-300 group"
            >
              About
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-blue-500"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </li>
          <li>
            <motion.a
              href="register"
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              className="text-white font-bold text-lg px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 bg-size-200 hover:bg-pos-0 transition-all duration-500 bg-pos-100"
              style={{
                backgroundSize: "200% 100%"
              }}
            >
              Become a Member
            </motion.a>
          </li>
        </ul>
      </div>
    </nav>
  );
};