import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";

const Navbar = () => {
  const { cartItems } = useCart();

  return (
    <div className="bg-blue-500">
      <nav className=" text-white p-4 flex justify-between w-[75%] mx-auto">
        <Link to="/productPage" className="">
          Product Page
        </Link>
        <Link to="/cartPage">Cart ({cartItems.length})</Link>
        <Link to="/checkoutPage">Checkout</Link>
      </nav>
    </div>
  );
};

export default Navbar;
