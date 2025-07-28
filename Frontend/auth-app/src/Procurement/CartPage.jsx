import React from "react";
import { useCart } from "./CartContext";
import { Link, useNavigate } from "react-router-dom";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, setCartItems, clearCart, removeFromCart, updateQuantity } =
    useCart();
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );
  const shipping = 5.99;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const handleCheckout = () => {
    navigate("/checkoutPage");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {cartItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center border rounded-lg p-4 shadow-sm gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">
                    ₦{Number(item.price).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
                <div className="font-semibold mb-2">
                  <p className="text-gray-600">
                    ₦{Number(item.price).toFixed(2)}
                  </p>
                </div>
                <button
                  className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-100 transition"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-1/3 bg-white shadow rounded-lg p-6">
            <h4 className="text-lg font-bold mb-4">Order Summary</h4>
            {/* Total: ₦{total.toLocaleString()} */}
            <div className="flex justify-between mb-2">
              <span>
                Subtotal (
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t mt-4 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${total}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/productPage"
              className="block mt-4 text-center text-blue-500 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
