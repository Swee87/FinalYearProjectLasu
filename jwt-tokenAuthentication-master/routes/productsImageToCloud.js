// 1. Import required packages
// THIS FILE IS FOR UPLOADING PRODUCT IMAGES TO CLOUDINARY
// cloudinary.js
const { v2: cloudinary } = require('cloudinary');
const { v4 } = require('uuid');
const { config } = require('dotenv');
config();

cloudinary.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.API_Key,
  api_secret: process.env.API_Secret,
  secure: true,
});

const uploadToCloudinary = async (fileBuffer) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${fileBuffer.toString('base64')}`,
      {
        folder: 'product_images',
        public_id: `product_${v4()}`,
        resource_type: 'auto',
        use_filename: false,
        unique_filename: true,
      }
    );

    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

const getTransformedImageTag = (publicId) => {
  return cloudinary.image(publicId, {
    transformation: [
      { width: 250, height: 250, gravity: 'faces', crop: 'thumb' },
      { radius: 'max' },
      { effect: 'outline:10', color: 'black' },
      { background: 'white' },
    ],
  });
};

const getAssetInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      colors: true,
    });
    return result.colors;
  } catch (error) {
    console.error('Error fetching asset info:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getTransformedImageTag,
  getAssetInfo,
};
