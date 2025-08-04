import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { clearCart } from "./features/cartSlice";
import { selectCartTotal, selectCartItems } from "./features/cartSlice";
import { Icon } from "./Icon";
const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Order Submitted", { ...data, cartItems });
    // sessionStorage.setItem("userType", "oneOffCustomer");
    // navigate("/login");
  //  navigate("/login", { state: { userType: "oneOffCustomer" } });
    // dispatch(clearCart());
    // alert("Order placed successfully!");
  };

  const handleCheckoutLogin = () => {
  sessionStorage.setItem("userType", "oneOffCustomer");
  console.log("userType just set:", sessionStorage.getItem("userType")); //  Check here
  navigate("/login");
};



  // const handleCheckoutLogin = () => {
  //   sessionStorage.setItem("userType", "oneOffCustomer"); // Save to session
  //   navigate("/login");
  // };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:py-12">
      {/* Max width container */}
      <div className="max-w-2xl mx-auto w-full">
        
        {/* Checkout Card: Removed premature overflow-hidden */}
        <div className="bg-white rounded-xl shadow-lg">
          
          {/*  Header: Guaranteed visible */}
          <div className="bg-blue-600 w-full rounded-t-xl">
            <h2 className="text-lg sm:text-2xl font-bold text-white text-center py-4 px-4 sm:py-6 sm:px-6 leading-tight break-words">
              Checkout
            </h2>
          </div>

          {/* Form with padding – now safe from clipping */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="John Doe"
              />
              {errors.name && (
                <span className="text-red-500 text-sm">Name is required</span>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                {...register("phone", { required: true })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <span className="text-red-500 text-sm">Phone is required</span>
              )}
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Delivery Address *</label>
              <textarea
                {...register("address", { required: true })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                rows={3}
                placeholder="123 Main St, City, Country"
              ></textarea>
              {errors.address && (
                <span className="text-red-500 text-sm">Address is required</span>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                {...register("note")}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                rows={2}
                placeholder="Special instructions, delivery preferences..."
              ></textarea>
            </div>

            {/* Order Summary & Submit */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-blue-800 text-base">
                    Total: ${total.toFixed(2)}
                  </p>
                  <p className="text-sm text-blue-600">
                    {cartItems.length} item(s) in your cart
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCheckoutLogin}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Place Order
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Only apply overflow-hidden to the card, not header */}
      </div>

      {/* Icon */}
      <div className="mt-8 px-4 flex justify-center">
        <Icon />
      </div>
    </div>
  );
};

export default CheckoutPage;