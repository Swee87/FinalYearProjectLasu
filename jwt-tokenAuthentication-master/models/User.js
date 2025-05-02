// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // Define the user schema
// //         id="password"

// const userSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     isVerified: {
//         type: Boolean,
//         default: false,
//     },
//     resetToken: String, // Stores the hashed reset token
//     resetTokenSalt: String, // Stores the salt used to hash the reset token
//     resetTokenExpires: Date, // Stores the expiration time for the reset token
//     role: {
//         type: String,
//         enum: ['user', 'admin'], // Only allow 'user' or 'admin'
//         default: 'user', // Default role is 'user'
//     },
// });

// // Pre-save hook to hash the password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// module.exports = mongoose.model('User', userSchema);
// 





// WITH GOOGLE AUTH

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        sparse: true, // Allows for unique constraint on null values
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Require password only if googleId is not present
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetToken: String,
    resetTokenSalt: String,
    resetTokenId: String,
    resetTokenExpires: Date,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
});

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Apply the `findOrCreate` plugin
userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//         email: {
//                 type: String,
//                 required: true,
//                 unique: true,
//         },
//         password: {
//                 type: String,
//                 required: true,
//         },
//         isVerified: {
//                 type: Boolean,
//                 default: false,
//         },
//         resetToken: String,
//         resetTokenExpires: Date,
// });

// // Pre-save hook to hash the password before saving
// userSchema.pre('save', async function (next) {
//         if (!this.isModified('password')) return next();
//         this.password = await bcrypt.hash(this.password, 10);
//         next();
// });

// module.exports = mongoose.model('User', userSchema);