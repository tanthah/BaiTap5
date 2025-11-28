const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
} = require('../controllers/productController');

/**
 * @route   GET /api/products/featured
 * @desc    Lấy sản phẩm nổi bật
 * @access  Public
 * @note    Phải định nghĩa trước route /:id để tránh conflict
 */
router.get('/featured', getFeaturedProducts);

/**
 * @route   GET /api/products/category/:categorySlug
 * @desc    Lấy sản phẩm theo danh mục
 * @access  Public
 */
router.get('/category/:categorySlug', getProductsByCategory);

/**
 * @route   GET /api/products
 * @desc    Lấy danh sách sản phẩm với phân trang và filter
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Lấy chi tiết sản phẩm
 * @access  Public
 */
router.get('/:id', getProductById);

module.exports = router;