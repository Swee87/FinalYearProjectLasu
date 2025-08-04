// Base URL configuration (adjust as needed)
const API_BASE = 'http://localhost:5000/productEndpoint'; // Replace with your actual API base URL

// Helper function for handling responses
const handleResponse = async (response) => {
    console.log('Response status:', response);
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @param {File} imageFile - Product image file
 * @returns {Promise} Created product data
 */
export const createProduct = async (productData, imageFile) => {
  const formData = new FormData();
  
  // Append product fields
  Object.entries(productData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Append image file
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      credentials: 'include', // Include cookies
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};

/**
 * Get products with pagination and filtering
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.category - Category filter
 * @param {boolean} options.soldOut - Sold out filter
 * @param {number} options.stock - Minimum stock filter
 * @returns {Promise} { data: products[], total: number }
 */
export const getProducts = async ({ 
  page = 1, 
  limit = 10, 
  category, 
  soldOut, 
  stock 
} = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
    ...(soldOut !== undefined && { soldOut: soldOut.toString() }),
    ...(stock !== undefined && { stock: stock.toString() })
  });

  try {
    const response = await fetch(`${API_BASE}?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get products error:', error);
    throw error;
  }
};

/**
 * Get single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise} Product object
 */
export const getProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE}/${productId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
};

/**
 * Update a product
 * @param {string} productId - Product ID to update
 * @param {Object} updates - Product updates
 * @param {File} [imageFile] - Optional new image file
 * @returns {Promise} Updated product data
 */
export const updateProduct = async (productId, updates, imageFile) => {
  const formData = new FormData();
  
  // Append updated fields
  Object.entries(updates).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Append new image if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const response = await fetch(`${API_BASE}/${productId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
};

/**
 * Soft-delete a product
 * @param {string} productId - Product ID to delete
 * @returns {Promise} Success message
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE}/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};

/**
 * Fetch all products (public endpoint)
 * @returns {Promise<Array>} Array of all products
 */
export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE}/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get all products error:', error);
    throw error;
  }
};
