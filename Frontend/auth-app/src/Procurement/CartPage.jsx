import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  selectCartItems, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  selectCartTotal
} from "./features/cartSlice";
import { Icon } from "./Icon";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const shipping = 5.99;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);

  const handleCheckout = () => navigate("/checkoutPage");

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 mt-12">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm p-12 max-w-md mx-auto">
            <p className="text-gray-600 text-xl mb-6">Your cart is empty</p>
            <Link 
              to="/productPage" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-gray-500 text-sm font-medium border-b">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>
                
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-b"
                  >
                    <div className="md:col-span-5 flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <h2 className="font-semibold text-gray-800">{item.name}</h2>
                        <p className="text-blue-600 text-sm mt-1">
                          ${item.price.toFixed(2)} / {item.unit}
                        </p>
                      </div>
                    </div>
                    
                    <div className="md:col-span-3 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => dispatch(updateQuantity({ 
                            id: item._id, 
                            quantity: Math.max(item.quantity - 1, 1) 
                          }))}
                          disabled={item.quantity <= 1}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ 
                            id: item._id, 
                            quantity: item.quantity + 1 
                          }))}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 text-right text-gray-700">
                      ${item.price.toFixed(2)}
                    </div>
                    
                    <div className="md:col-span-2 flex justify-between items-center">
                      <div className="font-semibold text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors ml-2"
                        onClick={() => dispatch(removeFromCart(item._id))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-96">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  Proceed to Checkout
                </button>
                
                <Link
                  to="/productPage"
                  className="block mt-4 text-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Icon/>
    </div>
  );
};

export default CartPage;











// import React from "react";
// import { useCart } from "./CartContext";
// import { Link, useNavigate } from "react-router-dom";

// const CartPage = () => {
//   const navigate = useNavigate();
//   const { cartItems, setCartItems, clearCart, removeFromCart, updateQuantity } =
//     useCart();
//   const subtotal = cartItems.reduce(
//     (acc, item) => acc + Number(item.price) * item.quantity,
//     0
//   );
//   const shipping = 5.99;
//   const tax = +(subtotal * 0.08).toFixed(2);
//   const total = +(subtotal + shipping + tax).toFixed(2);

//   const handleCheckout = () => {
//     navigate("/checkoutPage");
//   };

//   return (
//     <div className="p-4 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6 text-center">🛒 Your Cart</h1>

//       {cartItems.length === 0 ? (
//         <p className="text-center text-gray-600">Your cart is empty.</p>
//       ) : (
//         <div className="flex flex-col md:flex-row gap-6">
//           <div className="flex-1 space-y-4">
//             {cartItems.map((item, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-center border rounded-lg p-4 shadow-sm gap-4"
//               >
//                 <img
//                   src={item.image}
//                   alt={item.name}
//                   className="w-24 h-24 object-cover rounded"
//                 />
//                 <div className="flex-1">
//                   <h2 className="text-lg font-semibold">{item.name}</h2>
//                   <p className="text-gray-600">
//                     ₦{Number(item.price).toFixed(2)}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-3 mb-2">
//                   <button
//                     onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                     disabled={item.quantity <= 1}
//                     className="px-2 py-1 border rounded"
//                   >
//                     -
//                   </button>
//                   <span>{item.quantity}</span>
//                   <button
//                     onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                     className="px-2 py-1 border rounded"
//                   >
//                     +
//                   </button>
//                 </div>
//                 <div className="font-semibold mb-2">
//                   <p className="text-gray-600">
//                     ₦{Number(item.price).toFixed(2)}
//                   </p>
//                 </div>
//                 <button
//                   className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-100 transition"
//                   onClick={() => removeFromCart(item.id)}
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//           </div>

//           {/* Order Summary */}
//           <div className="w-full md:w-1/3 bg-white shadow rounded-lg p-6">
//             <h4 className="text-lg font-bold mb-4">Order Summary</h4>
//             {/* Total: ₦{total.toLocaleString()} */}
//             <div className="flex justify-between mb-2">
//               <span>
//                 Subtotal (
//                 {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
//               </span>
//               <span>${subtotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between mb-2">
//               <span>Shipping</span>
//               <span>${shipping.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between mb-2">
//               <span>Tax (8%)</span>
//               <span>${tax.toFixed(2)}</span>
//             </div>
//             <div className="border-t mt-4 pt-2 flex justify-between font-bold">
//               <span>Total</span>
//               <span>${total}</span>
//             </div>
//             <button
//               onClick={handleCheckout}
//               className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
//             >
//               Proceed to Checkout
//             </button>
//             <Link
//               to="/productPage"
//               className="block mt-4 text-center text-blue-500 hover:underline"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CartPage;
