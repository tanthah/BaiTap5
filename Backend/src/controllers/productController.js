const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Product Controller - Xử lý logic sản phẩm
 */
class ProductController {
  /**
   * @desc   Lấy danh sách sản phẩm với phân trang và filter
   * @route  GET /api/products
   * @access Public
   */
  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      
      // Build query
      const query = { isActive: true };
      
      // Filter theo category
      if (req.query.category) {
        query.category = req.query.category;
      }
      
      // Filter theo giá
      if (req.query.minPrice || req.query.maxPrice) {
        query.price = {};
        if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
      }
      
      // Tìm kiếm theo tên
      if (req.query.search) {
        query.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ];
      }
      
      // Sắp xếp
      let sortOption = { createdAt: -1 }; // Mặc định: mới nhất
      switch (req.query.sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
        case 'popular':
          sortOption = { sold: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
      
      console.log('Product query:', JSON.stringify(query));
      console.log('Sort option:', sortOption);
      
      // Lấy sản phẩm
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();
      
      // Đếm tổng số sản phẩm
      const total = await Product.countDocuments(query);
      
      console.log(`Found ${products.length} products out of ${total} total`);
      
      res.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * @desc   Lấy sản phẩm nổi bật
   * @route  GET /api/products/featured
   * @access Public
   */
  async getFeaturedProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      
      const products = await Product.find({ 
        featured: true,
        isActive: true 
      })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      console.log(`Found ${products.length} featured products`);
      
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Error fetching featured products:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * @desc   Lấy chi tiết sản phẩm theo ID
   * @route  GET /api/products/:id
   * @access Public
   */
  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id)
        .populate('category', 'name slug description');
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Không tìm thấy sản phẩm' 
        });
      }
      
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  /**
   * @desc   Lấy sản phẩm theo danh mục
   * @route  GET /api/products/category/:categorySlug
   * @access Public
   */
  async getProductsByCategory(req, res) {
    try {
      const category = await Category.findOne({ 
        slug: req.params.categorySlug,
        isActive: true 
      });
      
      if (!category) {
        return res.status(404).json({ 
          success: false,
          message: 'Không tìm thấy danh mục' 
        });
      }
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      
      // Sắp xếp
      let sortOption = { createdAt: -1 };
      switch (req.query.sort) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'popular':
          sortOption = { sold: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
      
      console.log(`Fetching products for category: ${category.name} (${category._id})`);
      
      const products = await Product.find({ 
        category: category._id,
        isActive: true 
      })
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await Product.countDocuments({ 
        category: category._id,
        isActive: true 
      });
      
      console.log(`Found ${products.length} products in category out of ${total} total`);
      
      res.json({
        success: true,
        data: products,
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      });
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = new ProductController();