
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
// middleware/authMiddleware.js

// middleware/authMiddleware.js
module.exports = (requiredRole = null) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookies = req.cookies;
    console.log("Cookies:", cookies);
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log("Token from Authorization header");
    } else if (cookies?.authtoken || cookies?.admintoken) {
      token = cookies.authtoken || cookies.admintoken;
      console.log(`Token from ${cookies.authtoken ? 'authtoken' : 'admintoken'} cookie`);
    }

    if (!token) {
      console.error("No token found in headers or cookies");
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Use decoded.id 
      const user = await User.findById(decoded.id); 
      if (!user) {
        console.error("User not found for ID:", decoded.id); 
        return res.status(401).json({ message: "Unauthorized - User not found" });
      }

      if (user.role !== decoded.role) {
        console.error(`Role mismatch: User role ${user.role}, Token role ${decoded.role}`);
        return res.status(401).json({ message: "Unauthorized - Invalid token role" });
      }

      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
        googleId: user.googleId,
        isVerified: user.isVerified,
      };

      if (user.role === "user") {
        const CoopMember = require("../models/CoopMembers");
        const coopMember = await CoopMember.findOne({ userId: user._id });

        req.user = {
          ...req.user,
          ...(coopMember ? coopMember.toObject() : {})
        };
      }

      if (requiredRole && req.user.role !== requiredRole) {
        console.error(`Role requirement failed: Required ${requiredRole}, Got ${req.user.role}`);
        return res.status(403).json({
          message: `Forbidden - ${requiredRole} access required`
        });
      }

      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      const response = error.name === "TokenExpiredError"
        ? { message: "Session expired - Please log in again" }
        : { message: "Unauthorized - Invalid token" };
      res.status(401).json(response);
    }
  };
};