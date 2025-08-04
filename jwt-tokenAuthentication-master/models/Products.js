const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  //Cloudinary Image Fields
  image: {
    type: String, // Cloudinary secure_url
    required: true,
  },
  publicId: {
    type: String, // Cloudinary public_id (used to delete the image)
    required: true,
  },

  stock: {
    type: Number,
    required: true,
    default: 0,
  },

  soldOut: {
    type: Boolean,
    default: false, // auto-updated before save
  },
  //  Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

//Auto-update soldOut based on stock
ProductSchema.pre('save', function (next) {
  this.soldOut = this.stock <= 0;
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
