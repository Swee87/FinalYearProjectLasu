import React from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const onSubmit = (data) => {
    console.log("Order Submitted", { ...data, cartItems });
    clearCart();
    navigate("/");
    alert("Order placed successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">🧾 Checkout</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Full Name *</label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="w-full border rounded p-2"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">Name is required</span>
          )}
        </div>

        <div>
          <label className="block font-medium">Phone Number *</label>
          <input
            type="tel"
            {...register("phone", { required: true })}
            className="w-full border rounded p-2"
          />
          {errors.phone && (
            <span className="text-red-500 text-sm">Phone is required</span>
          )}
        </div>

        <div>
          <label className="block font-medium">Delivery Address *</label>
          <textarea
            {...register("address", { required: true })}
            className="w-full border rounded p-2"
            rows={3}
          ></textarea>
          {errors.address && (
            <span className="text-red-500 text-sm">Address is required</span>
          )}
        </div>

        <div>
          <label className="block font-medium">
            Additional Notes (Optional)
          </label>
          <textarea
            {...register("note")}
            className="w-full border rounded p-2"
            rows={2}
          ></textarea>
        </div>

        <div className="mt-6 bg-gray-100 p-4 rounded shadow-sm">
          <p className="text-lg font-semibold">
            Total: ₦{total.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            You have {cartItems.length} item(s) in your cart.
          </p>
        </div>

        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
