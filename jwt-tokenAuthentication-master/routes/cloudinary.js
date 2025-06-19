// 1. Import required packagesconst
const { v2: cloudinary } = require('cloudinary');
const { v4} = require('uuid');
const { config } = require('dotenv'); // ✅ CommonJS

config(); // Load environment variables
// 2. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.API_Key ,
  api_secret: process.env.API_Secret,
  secure: true,
});
// 3. Function to upload file to Cloudinary
const uploadToCloudinary = async (fileBuffer) => {
  try {
    // Convert buffer to base64 string for upload
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${fileBuffer.toString('base64')}`,
      {
        folder: 'payment_slips',
        public_id: `slip_${v4()}`,   // Unique ID
        resource_type: 'auto',        // Supports images & PDFs
        use_filename: false,
        unique_filename: true,
      }
    );

    return result.secure_url; // Return the URL to store in DB
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

// 4. Optional: Generate transformed image tag (for thumbnails, etc.)
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

// 🔁 Export everything
module.exports= {
  cloudinary,
  uploadToCloudinary,
  getTransformedImageTag,
  getAssetInfo,
};