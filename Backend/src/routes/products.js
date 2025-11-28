const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * QUAN TRỌNG: Thứ tự routes rất quan trọng!
 * Các route cụ thể phải được định nghĩa TRƯỚC route với params động
 */

/**
 * @route   GET /api/products/featured
 * @desc    Lấy sản phẩm nổi bật
 * @access  Public
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @route   GET /api/products/category/:categorySlug
 * @desc    Lấy sản phẩm theo danh mục
 * @access  Public
 */
router.get('/category/:categorySlug', productController.getProductsByCategory);

/**
 * @route   GET /api/products
 * @desc    Lấy danh sách sản phẩm với phân trang và filter
 * @access  Public
 */
router.get('/', productController.getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Lấy chi tiết sản phẩm
 * @access  Public
 * @note    Phải để sau cùng để tránh conflict với các route khác
 */
router.get('/:id', productController.getProductById);

module.exports = router;