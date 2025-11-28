const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * @desc   Lấy danh sách sản phẩm với phân trang và filter
 * @route  GET /api/products
 * @access Public
 */
exports.getProducts = async (req, res) => {
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
      query.$text = { $search: req.query.search };
    }
    
    // Sắp xếp
    let sortOption = { createdAt: -1 }; // Mặc định: mới nhất
    if (req.query.sort === 'price-asc') sortOption = { price: 1 };
    if (req.query.sort === 'price-desc') sortOption = { price: -1 };
    if (req.query.sort === 'name') sortOption = { name: 1 };
    if (req.query.sort === 'popular') sortOption = { sold: -1 };
    if (req.query.sort === 'rating') sortOption = { rating: -1 };
    
    // Lấy sản phẩm
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Đếm tổng số sản phẩm
    const total = await Product.countDocuments(query);
    
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
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Lấy sản phẩm nổi bật
 * @route  GET /api/products/featured
 * @access Public
 */
exports.getFeaturedProducts = async (req, res) => {
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
    
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Lấy chi tiết sản phẩm theo ID
 * @route  GET /api/products/:id
 * @access Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description');
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc   Lấy sản phẩm theo danh mục
 * @route  GET /api/products/category/:categorySlug
 * @access Public
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.categorySlug,
      isActive: true 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Sắp xếp
    let sortOption = { createdAt: -1 };
    if (req.query.sort === 'price-asc') sortOption = { price: 1 };
    if (req.query.sort === 'price-desc') sortOption = { price: -1 };
    if (req.query.sort === 'popular') sortOption = { sold: -1 };
    if (req.query.sort === 'rating') sortOption = { rating: -1 };
    
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
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};