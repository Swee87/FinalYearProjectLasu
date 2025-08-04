import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCartItems, 
  selectCartTotal, 
  removeFromCart, 
  updateQuantity, 
  clearCart 
} from '../features/cartSlice.js';

export const CustomerDashboard = () => {
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleQuantityChange = (id, newQuantity) => {
    // Ensure quantity doesn't go below 1
    const quantity = Math.max(1, newQuantity);
    
    dispatch(updateQuantity({ 
      id, 
      quantity 
    }));
  };

  const handlePayment = (e) => {
    e.preventDefault();
    // Basic validation
    const errors = {};
    if (!paymentInfo.cardNumber.match(/^\d{16}$/)) 
      errors.cardNumber = 'Invalid card number (16 digits required)';
    if (!paymentInfo.expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) 
      errors.expiry = 'Invalid expiry (MM/YY format)';
    if (!paymentInfo.cvv.match(/^\d{3,4}$/)) 
      errors.cvv = 'Invalid CVV (3-4 digits)';
    if (!paymentInfo.name.trim()) 
      errors.name = 'Name is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    
    // Simulate payment processing
    setTimeout(() => {
      dispatch(clearCart());
      setPaymentSuccess(true);
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Calculate taxes and total (assuming 10% tax)
  const tax = cartTotal * 0.1;
  const orderTotal = cartTotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">FreshCart</h1>
            <p className="text-gray-600">Online Grocery Delivery</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-500">Delivering to</p>
            <p className="font-medium text-gray-800">Manchester City</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Your Cart ({cartItems.length})</h2>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-gray-500">Add some items to your cart to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cartItems.map(item => (
                  <div key={item._id} className="p-6 flex">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 text-sm capitalize">{item.category}</p>
                      {item.soldOut || item.stock <= 0 ? (
                        <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                          Out of stock
                        </span>
                      ) : (
                        <div className="mt-2 flex items-center">
                          <button 
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                              item.quantity <= 1 
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            -
                          </button>
                          <span className="mx-3 min-w-[20px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                              item.quantity >= item.stock 
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            +
                          </button>
                          {item.stock < 5 && item.quantity < item.stock && (
                            <span className="ml-3 text-xs text-orange-600">
                              Only {item.stock} left!
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">£{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-gray-500 text-sm">£{item.price.toFixed(2)} each</p>
                      <button 
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="mt-4 text-red-500 hover:text-red-700 text-sm flex items-center justify-end w-full"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">£{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">£{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">£{orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {!paymentSuccess ? (
              <form onSubmit={handlePayment} className="space-y-4">
                <h3 className="font-medium text-gray-800">Payment Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentInfo.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.cardNumber}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      value={paymentInfo.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.expiry ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.expiry && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentInfo.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cvv}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    value={paymentInfo.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={cartItems.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    cartItems.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Pay £{orderTotal.toFixed(2)}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Your order will be delivered soon.</p>
                <button
                  onClick={() => setPaymentSuccess(false)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Make another purchase
                </button>
              </div>
            )}
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Delivery Information</h3>
            <p className="text-blue-700">
              Your groceries will be delivered to <strong>Manchester City</strong> within 2 hours.
              You can track your order in real-time after payment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
