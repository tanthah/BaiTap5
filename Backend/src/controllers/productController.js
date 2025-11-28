// Backend/src/controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');

class ProductController {
  async getProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;
      
      // Build query
      const query = { isActive: true };
      
      // Filter theo category
      if (req.query.category) {
        console.log('Filtering by category ID:', req.query.category);
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
      let sortOption = { createdAt: -1 };
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
      
      console.log('=== Product Query Debug ===');
      console.log('Query:', JSON.stringify(query, null, 2));
      console.log('Sort:', sortOption);
      console.log('Page:', page, 'Limit:', limit);
      
      // Đếm TRƯỚC khi query
      const totalInDb = await Product.countDocuments({});
      const totalActive = await Product.countDocuments({ isActive: true });
      console.log('Total products in DB:', totalInDb);
      console.log('Total active products:', totalActive);
      
      // Lấy sản phẩm
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();
      
      // Đếm tổng số sản phẩm theo query
      const total = await Product.countDocuments(query);
      
      console.log('Found products:', products.length);
      console.log('Total matching query:', total);
      
      if (products.length > 0) {
        console.log('First product sample:', {
          name: products[0].name,
          category: products[0].category,
          isActive: products[0].isActive,
          price: products[0].price
        });
      }
      console.log('=========================');
      
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
      console.error('❌ Error in getProducts:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  async getFeaturedProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 8;
      
      console.log('=== Featured Products Query ===');
      const totalFeatured = await Product.countDocuments({ 
        featured: true,
        isActive: true 
      });
      console.log('Total featured products:', totalFeatured);
      
      const products = await Product.find({ 
        featured: true,
        isActive: true 
      })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      console.log('Found featured products:', products.length);
      console.log('===============================');
      
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('❌ Error in getFeaturedProducts:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

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
      console.error('❌ Error in getProductById:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      console.log('=== Get Products By Category ===');
      console.log('Category slug:', req.params.categorySlug);
      
      const category = await Category.findOne({ 
        slug: req.params.categorySlug,
        isActive: true 
      });
      
      if (!category) {
        console.log('❌ Category not found!');
        return res.status(404).json({ 
          success: false,
          message: 'Không tìm thấy danh mục' 
        });
      }
      
      console.log('✅ Category found:', category.name, '(', category._id, ')');
      
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
      
      const query = { 
        category: category._id,
        isActive: true 
      };
      
      console.log('Query:', JSON.stringify(query));
      
      // Kiểm tra xem có sản phẩm nào của category này không (bất kể isActive)
      const allProductsInCategory = await Product.countDocuments({ 
        category: category._id 
      });
      console.log('Total products in this category (any status):', allProductsInCategory);
      
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await Product.countDocuments(query);
      
      console.log('Active products in category:', total);
      console.log('Found products for this page:', products.length);
      
      if (products.length > 0) {
        console.log('Sample product:', products[0].name);
      }
      console.log('================================');
      
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
      console.error('❌ Error in getProductsByCategory:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

module.exports = new ProductController();