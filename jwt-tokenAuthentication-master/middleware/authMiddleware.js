const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
require("dotenv").config();

module.exports = (requiredRole = null) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookies = req.cookies;

    let token = null;
    let tokenSource = null;
    let isAdminToken = false;

    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.COOKIE_ENCRYPTION_KEY, 'hex');

    function decrypt(encrypted) {
      try {
        const [ivHex, encryptedText] = encrypted.split(':');
        if (!ivHex || !encryptedText) throw new Error('Invalid encrypted data format');
        const iv = Buffer.from(ivHex, 'hex');
        if (iv.length !== 16) throw new Error('Invalid IV length');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Failed to decrypt token');
      }
    }

    // Extract token
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      tokenSource = "Authorization header";
    } else if (cookies?.adminAccessToken) {
      try {
        token = decrypt(cookies.adminAccessToken);
        tokenSource = "adminAccessToken cookie";
        isAdminToken = true;
      } catch (error) {
        return res.status(401).json({ message: "Unauthorized - Invalid token format" });
      }
    } else if (cookies?.accessToken) {
      try {
        token = decrypt(cookies.accessToken);
        tokenSource = "accessToken cookie";
      } catch (error) {
        return res.status(401).json({ message: "Unauthorized - Invalid token format" });
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
// console.log("Decoded token:", decoded);
console.log("Expires at:", new Date(decoded.exp * 1000));
console.log('Decoded token:', decoded);
console.log('Token expiry:', new Date(decoded.exp * 1000));
console.log('Now:', new Date());

      const user = await User.findById(decoded.userId || decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
      }

      if (user.role !== decoded.role) {
        return res.status(401).json({ message: "Unauthorized - Invalid token role" });
      }

      if (isAdminToken && !decoded.isAdminSession) {
        return res.status(401).json({ message: "Unauthorized - Invalid admin token" });
      }

      req.user = {
        _id: user._id,
        email: user.email,
        name: user.name || `${user.FirstName} ${user.LastName}`.trim(),
        picture: user.picture,
        role: user.role,
        googleId: user.googleId,
        isVerified: user.isVerified,
        isAdminSession: decoded.isAdminSession || false
      };

      console.log(req.user.role)

      if (user.role === "user") {
        const CoopMember = require("../models/CoopMembers");
        const coopMember = await CoopMember.findOne({ userId: user._id });
        req.user.coopMember = coopMember ? coopMember.toObject() : null;
      }

      // Enhanced role validation: supports single role or multiple roles
      if (
        requiredRole &&
        (
          (Array.isArray(requiredRole) && !requiredRole.includes(req.user.role)) ||
          (!Array.isArray(requiredRole) && req.user.role !== requiredRole)
        )
      ) {
        return res.status(403).json({ message: `Forbidden - ${requiredRole} access required` });
      }

      // Ensure admin token is used for admin-only routes
      if (requiredRole === "admin" && !req.user.isAdminSession) {
        return res.status(403).json({ message: "Forbidden - Admin session required" });
      }

      next();
    } catch (error) {
      let response = { message: "Unauthorized - Invalid token" };
      let statusCode = 401;

      if (error.name === "TokenExpiredError") {
        response.message = "Session expired - Please log in again";
        if (isAdminToken) {
          response = {
            message: "Admin session expired",
            action: "Use /adminRefreshToken to renew"
          };
        }
      }

      res.status(statusCode).json(response);
    }
  };
};









// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const crypto = require("crypto");
// require("dotenv").config();

// module.exports = (requiredRole = null) => {
//   return async (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     const cookies = req.cookies;
//     console.log("Cookies:", cookies);

//     let token = null;
//     let tokenSource = null;
//     let isAdminToken = false;

//     // Decryption function (must match authRoutes.js)
//     const algorithm = 'aes-256-cbc';
//     const key = Buffer.from(process.env.COOKIE_ENCRYPTION_KEY, 'hex');

//     function decrypt(encrypted) {
//       try {
//         const [ivHex, encryptedText] = encrypted.split(':');
//         if (!ivHex || !encryptedText) throw new Error('Invalid encrypted data format');
//         const iv = Buffer.from(ivHex, 'hex');
//         if (iv.length !== 16) throw new Error('Invalid IV length');
//         const decipher = crypto.createDecipheriv(algorithm, key, iv);
//         let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//         decrypted += decipher.final('utf8');
//         console.log(decrypted)
//         return decrypted;
//       } catch (error) {
//         console.error('Decryption error:', error.message);
//         throw new Error('Failed to decrypt token');
//       }
//     }

//     // 1. Check Authorization header first (not encrypted)
//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       token = authHeader.split(" ")[1];
//       tokenSource = "Authorization header";
//       console.log("Token from Authorization header");
//     }
//     // 2. Check for admin token if no header token
//     else if (cookies?.adminAccessToken) {
//       try {
//         token = decrypt(cookies.adminAccessToken);
//         tokenSource = "adminAccessToken cookie";
//         isAdminToken = true;
//         console.log("Token from adminAccessToken cookie (decrypted)");
//       } catch (error) {
//         console.error('Failed to decrypt adminAccessToken:', error.message);
//         return res.status(401).json({ message: "Unauthorized - Invalid token format" });
//       }
//     }
//     // 3. Check for regular user token
//     else if (cookies?.accessToken) {
//       try {
//         token = decrypt(cookies.accessToken);
//         tokenSource = "accessToken cookie";
//         console.log("Token from accessToken cookie (decrypted)");
//       } catch (error) {
//         console.error('Failed to decrypt accessToken:', error.message);
//         return res.status(401).json({ message: "Unauthorized - Invalid token format" });
//       }
//     }

//     if (!token) {
//       console.error("No token found in headers or cookies");
//       return res.status(401).json({ message: "Unauthorized - No token provided" });
//     }

//     try {
//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log("Decoded token:", decoded);

//       // Find user
//       const user = await User.findById(decoded.userId || decoded.id);
//       if (!user) {
//         console.error("User not found for ID:", decoded.userId || decoded.id);
//         return res.status(401).json({ message: "Unauthorized - User not found" });
//       }

//       // Check if token matches user role
//       if (user.role !== decoded.role) {
//         console.error(`Role mismatch: User role ${user.role}, Token role ${decoded.role}`);
//         return res.status(401).json({ message: "Unauthorized - Invalid token role" });
//       }

//       // Check admin token usage
//       if (isAdminToken && !decoded.isAdminSession) {
//         console.error("Admin cookie used for non-admin token");
//         return res.status(401).json({ message: "Unauthorized - Invalid token type" });
//       }

//       req.user = {
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//         googleId: user.googleId,
//         isVerified: user.isVerified,
//         isAdminSession: decoded.isAdminSession || false
//       };

//       // For regular users, add coopMember info
//       if (user.role === "user") {
//         const CoopMember = require("../models/CoopMembers");
//         const coopMember = await CoopMember.findOne({ userId: user._id });
//         req.user.coopMember = coopMember ? coopMember.toObject() : null;
//       }

//       // Role requirement check
//       if (requiredRole && req.user.role !== requiredRole) {
//         console.error(`Role requirement failed: Required ${requiredRole}, Got ${req.user.role}`);
//         return res.status(403).json({
//           message: `Forbidden - ${requiredRole} access required`
//         });
//       }

//       // Additional check for admin routes
//       if (requiredRole === "admin" && !req.user.isAdminSession) {
//         console.error("Admin route accessed with non-admin token");
//         return res.status(403).json({
//           message: "Forbidden - Admin session required"
//         });
//       }

//       console.log(`Authenticated as ${user.role} (${isAdminToken ? "admin token" : "user token"})`);
//       next();
//     } catch (error) {
//       console.error("JWT Error:", error.message);

//       let response = { message: "Unauthorized - Invalid token" };
//       let statusCode = 401;

//       if (error.name === "TokenExpiredError") {
//         response.message = "Session expired - Please log in again";
//         if (isAdminToken) {
//           response = {
//             message: "Admin session expired",
//             action: "Use /adminRefreshToken to renew"
//           };
//         }
//       }
//       res.status(statusCode).json(response);
//     }
//   };
// };







// //PREVIOUS ORIGINAL
// // const jwt = require("jsonwebtoken");
// // const User = require("../models/User");
// // require("dotenv").config();

// // module.exports = (requiredRole = null) => {
// //   return async (req, res, next) => {
// //     const authHeader = req.headers.authorization;
// //     const cookies = req.cookies;
// //     console.log("Cookies:", cookies);
    
// //     let token = null;
// //     let tokenSource = null;
// //     let isAdminToken = false;

// //     // 1. Check Authorization header first
// //     if (authHeader && authHeader.startsWith("Bearer ")) {
// //       token = authHeader.split(" ")[1];
// //       tokenSource = "Authorization header";
// //       console.log("Token from Authorization header");
// //     }
// //     // 2. Check for admin token if no header token
// //     else if (cookies?.adminAccessToken) {
// //       token = cookies.adminAccessToken;
// //       tokenSource = "adminAccessToken cookie";
// //       isAdminToken = true;
// //       console.log("Token from adminAccessToken cookie");
// //     }
// //     // 3. Check for regular user token
// //     else if (cookies?.accessToken) {
// //       token = cookies.accessToken;
// //       tokenSource = "accessToken cookie";
// //       console.log("Token from accessToken cookie");
// //     }

// //     if (!token) {
// //       console.error("No token found in headers or cookies");
// //       return res.status(401).json({ message: "Unauthorized - No token provided" });
// //     }

// //     try {
// //       // Verify token
// //       const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //       console.log("Decoded token:", decoded);

// //     // i used userId || id
// //       const user = await User.findById(decoded.userId || decoded.id); 
// //       if (!user) {
// //         console.error("User not found for ID:", decoded.userId || decoded.id);
// //         return res.status(401).json({ message: "Unauthorized - User not found" });
// //       }

// //       // Check if token matches user role
// //       if (user.role !== decoded.role) {
// //         console.error(`Role mismatch: User role ${user.role}, Token role ${decoded.role}`);
// //         return res.status(401).json({ message: "Unauthorized - Invalid token role" });
// //       }

// //       // Check admin token usage
// //       if (isAdminToken && !decoded.isAdminSession) {
// //         console.error("Admin cookie used for non-admin token");
// //         return res.status(401).json({ message: "Unauthorized - Invalid token type" });
// //       }

// //       req.user = {
// //         _id: user._id,
// //         email: user.email,
// //         role: user.role,
// //         googleId: user.googleId,
// //         isVerified: user.isVerified,
// //         isAdminSession: decoded.isAdminSession || false
// //       };

// //       // For regular users, add coopMember info
// //       if (user.role === "user") {
// //         const CoopMember = require("../models/CoopMembers");
// //         const coopMember = await CoopMember.findOne({ userId: user._id });
// //         req.user.coopMember = coopMember ? coopMember.toObject() : null;
// //       }

// //       // Role requirement check
// //       if (requiredRole && req.user.role !== requiredRole) {
// //         console.error(`Role requirement failed: Required ${requiredRole}, Got ${req.user.role}`);
// //         return res.status(403).json({
// //           message: `Forbidden - ${requiredRole} access required`
// //         });
// //       }

// //       // Additional check for admin routes
// //       if (requiredRole === "admin" && !req.user.isAdminSession) {
// //         console.error("Admin route accessed with non-admin token");
// //         return res.status(403).json({
// //           message: "Forbidden - Admin session required"
// //         });
// //       }

// //       console.log(`Authenticated as ${user.role} (${isAdminToken ? "admin token" : "user token"})`);
// //       next();
// //     } catch (error) {
// //       console.error("JWT Error:", error.message);
      
// //       let response = { message: "Unauthorized - Invalid token" };
// //       let statusCode = 401;
      
// //       if (error.name === "TokenExpiredError") {
// //         response.message = "Session expired - Please log in again";
        
// //         // Special handling for admin tokens
// //         if (isAdminToken) {
// //           response = { 
// //             message: "Admin session expired",
// //             action: "Use /admin-refresh-token to renew"
// //           };
// //         }
// //       }      res.status(statusCode).json(response);
// //     }
// //   };
// // };
