const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Products');
const cors = require('cors');
const authMiddleware = require('../middleware/authMiddleware');
const app = express();
// const cloudinary = require('../utils/cloudinary');
app.use(cors({
  origin: "http://localhost:5173",  // Your frontend's address
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], // Allow PATCH
  credentials: true, // Allow cookies
}));
// Multer config (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

//  CREATE PRODUCT
const { uploadToCloudinary ,  deleteFromCloudinary } = require('./productsImageToCloud'); // path to your helper

router.post('/', authMiddleware('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, unit, category, stock } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const result = await uploadToCloudinary(req.file.buffer); // use buffer from multer

    const product = new Product({
      name,
      description,
      price,
      unit,
      category,
      image: result.url,
      publicId: result.public_id,
      stock,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET PRODUCTS (Filter + Pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, soldOut, stock } = req.query;

    const filter = { isDeleted: false };

    if (category) filter.category = category;
    if (soldOut !== undefined) filter.soldOut = soldOut === 'true';
    if (stock !== undefined) filter.stock = { $gte: parseInt(stock) };

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({ data: products, total });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET ALL PRODUCTS (for admin or frontend bulk display)
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: false })
      .select('name price image category stock soldOut')// only fetch necessary fields
      .sort({ createdAt: -1 });
      console.log('Fetched all products:', products);
    res.status(200).json( products );
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: 'Failed to fetch all products' });
  }
});

//  GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


//  UPDATE PRODUCT (with optional image update)
router.put('/:id', authMiddleware('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, unit, category, stock } = req.body;

    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (req.file) {
      // Delete the old image from Cloudinary
      if (product.publicId) {
        await deleteFromCloudinary(product.publicId);
      }

      // Upload the new image to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer);
      product.image = result.url;
      product.publicId = result.public_id;
    }
    // Update product fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (unit) product.unit = unit;
    if (category) product.category = category;
    if (typeof stock !== 'undefined') product.stock = stock;

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware('admin'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Delete image from Cloudinary
    if (product.publicId) {
      await deleteFromCloudinary(product.publicId);
    }
    // Soft delete
    product.isDeleted = true;
    await product.save();

    res.json({ message: 'Product soft-deleted and image deleted from Cloudinary' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
