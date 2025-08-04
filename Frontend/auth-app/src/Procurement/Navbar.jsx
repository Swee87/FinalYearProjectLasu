import React, { useState, useEffect } from "react";
import { Link, useMatch } from "react-router-dom";
import { FaBoxOpen, FaShoppingCart, FaCreditCard, FaGripLines, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectCartItems } from "./features/cartSlice";

export const SecondaryNavbar = () => {
  const cartItems = useSelector(selectCartItems);
  const [isExpanded, setIsExpanded] = useState(true);
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 140, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Match routes
  const isProductPage = useMatch("/productPage");
  const isCartPage = useMatch("/cartPage");
  const isCheckoutPage = useMatch("/checkoutPage");

  // Define colors for each icon
  const productColor = isProductPage
    ? "text-blue-500 drop-shadow" 
    : "text-blue-400 hover:text-blue-300";

  const cartColor = isCartPage
    ? "text-purple-500 drop-shadow" 
    : "text-purple-400 hover:text-purple-300";

  const checkoutColor = isCheckoutPage
    ? "text-green-500 drop-shadow" 
    : "text-green-400 hover:text-green-300";

  // Load position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('secondaryNavPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
    
    const savedExpanded = localStorage.getItem('secondaryNavExpanded');
    if (savedExpanded !== null) {
      setIsExpanded(JSON.parse(savedExpanded));
    }
  }, []);

  // Save position and expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('secondaryNavPosition', JSON.stringify(position));
    localStorage.setItem('secondaryNavExpanded', JSON.stringify(isExpanded));
  }, [position, isExpanded]);

  // Handle drag start
  const startDrag = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle dragging
  const handleDrag = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Boundary checks
    const boundedX = Math.max(0, Math.min(window.innerWidth - 280, newX));
    const boundedY = Math.max(0, Math.min(window.innerHeight - 60, newY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  // Handle drag end
  const endDrag = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const startTouchDrag = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchDrag = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    // Boundary checks
    const boundedX = Math.max(0, Math.min(window.innerWidth - 280, newX));
    const boundedY = Math.max(0, Math.min(window.innerHeight - 60, newY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 280),
        y: Math.min(prev.y, window.innerHeight - 60)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="fixed z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseMove={handleDrag}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchMove={handleTouchDrag}
      onTouchEnd={endDrag}
    >
      {isExpanded ? (
        <motion.div
          className="flex items-center bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl
                     shadow-xl border border-gray-200 min-w-[280px] justify-around
                     transition-all duration-300 relative"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
          {/* Drag handle */}
          <div 
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 
                      cursor-grab p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
            onMouseDown={startDrag}
            onTouchStart={startTouchDrag}
          >
            <FaGripLines size={16} />
          </div>
          
          {/* Collapse button */}
          <button 
            onClick={() => setIsExpanded(false)}
            className="absolute -right-3 -top-3 bg-gray-200 rounded-full p-1 
                      hover:bg-gray-300 transition-colors shadow-sm"
            aria-label="Collapse menu"
          >
            <FaTimes size={14} className="text-gray-600" />
          </button>

          {/* Products */}
          <Link to="/productPage" aria-label="Products">
            <motion.div
              className={`relative mx-3 transition-colors duration-200 ${productColor}`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBoxOpen size={20} />
              {isProductPage && (
                <motion.span
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </motion.div>
          </Link>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Cart */}
          <Link to="/cartPage" aria-label="Cart">
            <motion.div
              className={`relative mx-3 transition-colors duration-200 ${cartColor}`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaShoppingCart size={20} />
              {cartItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartItems.reduce((count, item) => count + item.quantity, 0)}
                </motion.span>
              )}
              {isCartPage && (
                <motion.span
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </motion.div>
          </Link>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Checkout */}
          <Link to="/checkoutPage" aria-label="Checkout">
            <motion.div
              className={`relative mx-3 transition-colors duration-200 ${checkoutColor}`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCreditCard size={20} />
              {isCheckoutPage && (
                <motion.span
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </motion.div>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-gray-200 
                     transition-all duration-300 relative group"
          onClick={() => setIsExpanded(true)}
          whileHover={{ scale: 1.05 }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {/* Drag handle */}
          <div 
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 
                      cursor-grab p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm"
            onMouseDown={startDrag}
            onTouchStart={startTouchDrag}
          >
            <FaGripLines size={16} />
          </div>
          
          {/* Expand button indicator */}
          <div className="flex justify-center">
            <FaBoxOpen className="text-blue-400 mx-1 group-hover:text-blue-500" />
            <FaShoppingCart className="text-purple-400 mx-1 group-hover:text-purple-500" />
            <FaCreditCard className="text-green-400 mx-1 group-hover:text-green-500" />
          </div>
          
          {/* Cart badge */}
          {cartItems.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {cartItems.reduce((count, item) => count + item.quantity, 0)}
            </motion.span>
          )}
          
          {/* Expand hint */}
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            initial={{ y: -5 }}
          >
            Click to expand
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};



