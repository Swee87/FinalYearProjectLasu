const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware factory function
module.exports = (requiredRole = null) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            req.role = decoded.role;

            // Check if a specific role is required
            if (requiredRole && req.role !== requiredRole) {
                return res.status(403).json({ message: `Forbidden. ${requiredRole} access required.` });
            }

            next();
        } catch (error) {
            console.error(error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            }
            res.status(401).json({ message: 'Invalid token' });
        }
    };
};




// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// module.exports = async (req, res, next) => {
//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//                 return res.status(401).json({ message: 'Unauthorized' });
//         }

//         const token = authHeader.split(' ')[1];
//         try {
//                 const decoded = jwt.verify(token, process.env.JWT_SECRET);
//                 req.userId = decoded.userId;
//                 next();
//         } catch (error) {
//                 console.error(error);
//                 if (error.name === 'TokenExpiredError') {
//                     return res.status(401).json({ message: 'Token expired. Please log in again.' });
//                 }
//                 res.status(401).json({ message: 'Invalid token' });
//             }
// };