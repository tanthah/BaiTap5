
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config();

const categories = [
  {
    name: 'Điện thoại',
    description: 'Các sản phẩm điện thoại thông minh',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
  },
  {
    name: 'Laptop',
    description: 'Máy tính xách tay cho công việc và giải trí',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
  },
  {
    name: 'Tablet',
    description: 'Máy tính bảng tiện lợi',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300',
  },
  {
    name: 'Phụ kiện',
    description: 'Phụ kiện công nghệ đa dạng',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
  },
  {
    name: 'Đồng hồ thông minh',
    description: 'Smartwatch và thiết bị đeo thông minh',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
  },
];

const generateProducts = (categoryId, categoryName) => {
  const products = [];
  const baseProducts = {
    'Điện thoại': [
      { name: 'iPhone 15 Pro Max', price: 29990000, desc: 'Chip A17 Pro, Camera 48MP' },
      { name: 'Samsung Galaxy S24 Ultra', price: 27990000, desc: 'Snapdragon 8 Gen 3' },
      { name: 'Xiaomi 14 Pro', price: 19990000, desc: 'Camera Leica, sạc nhanh 120W' },
      { name: 'OPPO Find X7', price: 18990000, desc: 'Camera Hasselblad' },
      { name: 'Vivo X100 Pro', price: 21990000, desc: 'Camera Zeiss, chip Dimensity 9300' },
    ],
    'Laptop': [
      { name: 'MacBook Pro M3', price: 45990000, desc: 'Chip M3, 16GB RAM' },
      { name: 'Dell XPS 15', price: 42990000, desc: 'Intel Core i7, RTX 4060' },
      { name: 'ASUS ROG Zephyrus', price: 38990000, desc: 'Gaming laptop RTX 4070' },
      { name: 'Lenovo ThinkPad X1', price: 35990000, desc: 'Doanh nhân cao cấp' },
      { name: 'HP Spectre x360', price: 39990000, desc: 'Laptop 2 trong 1' },
    ],
    'Tablet': [
      { name: 'iPad Pro 12.9', price: 28990000, desc: 'Chip M2, màn hình Liquid Retina' },
      { name: 'Samsung Galaxy Tab S9', price: 22990000, desc: 'Màn hình AMOLED 120Hz' },
      { name: 'Xiaomi Pad 6', price: 8990000, desc: 'Snapdragon 870, 144Hz' },
      { name: 'Lenovo Tab P12', price: 12990000, desc: '12.7 inch, JBL speakers' },
    ],
    'Phụ kiện': [
      { name: 'AirPods Pro 2', price: 5990000, desc: 'Chống ồn chủ động' },
      { name: 'Bàn phím cơ Keychron', price: 2490000, desc: 'Hot-swap, RGB' },
      { name: 'Chuột Logitech MX Master 3S', price: 2290000, desc: 'Cảm biến 8K DPI' },
      { name: 'Sạc dự phòng Anker 20000mAh', price: 890000, desc: 'Sạc nhanh 65W' },
      { name: 'Case iPhone 15 Pro', price: 490000, desc: 'Chống sốc, viền nâng camera' },
    ],
    'Đồng hồ thông minh': [
      { name: 'Apple Watch Series 9', price: 10990000, desc: 'Chip S9, Always-on display' },
      { name: 'Samsung Galaxy Watch 6', price: 7990000, desc: 'Wear OS, theo dõi sức khỏe' },
      { name: 'Garmin Forerunner 965', price: 14990000, desc: 'GPS, pin 23 ngày' },
      { name: 'Amazfit GTR 4', price: 4990000, desc: 'AMOLED, pin 14 ngày' },
    ],
  };

  const categoryProducts = baseProducts[categoryName] || baseProducts['Phụ kiện'];
  
  categoryProducts.forEach((item, index) => {
    for (let i = 0; i < 5; i++) {
      const variant = i > 0 ? ` ${['128GB', '256GB', '512GB', 'Plus', 'Ultra'][i - 1]}` : '';
      products.push({
        name: item.name + variant,
        description: item.desc + '. Sản phẩm chính hãng, bảo hành 12 tháng.',
        price: item.price + (i * 2000000),
        originalPrice: item.price + (i * 2000000) + 3000000,
        discount: Math.floor(Math.random() * 20) + 5,
        category: categoryId,
        mainImage: `https://picsum.photos/400/400?random=${Math.random()}`,
        images: [
          `https://picsum.photos/400/400?random=${Math.random()}`,
          `https://picsum.photos/400/400?random=${Math.random()}`,
          `https://picsum.photos/400/400?random=${Math.random()}`,
        ],
        stock: Math.floor(Math.random() * 100) + 20,
        sold: Math.floor(Math.random() * 500),
        rating: (Math.random() * 2 + 3).toFixed(1),
        numReviews: Math.floor(Math.random() * 200) + 10,
        featured: Math.random() > 0.7,
      });
    }
  });

  return products;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Xóa dữ liệu cũ
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Đã xóa dữ liệu cũ');

    // Tạo categories
    const createdCategories = [];
    for (const c of categories) {
        createdCategories.push(await Category.create(c)); // create triggers pre-save
    }

    console.log(`Đã tạo ${createdCategories.length} danh mục`);

    // Tạo products cho mỗi category
    let allProducts = [];
    for (const category of createdCategories) {
      const products = generateProducts(category._id, category.name);
      allProducts = allProducts.concat(products);
    }

    await Product.insertMany(allProducts);
    console.log(`Đã tạo ${allProducts.length} sản phẩm`);

    console.log('✅ Seed data thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seed data:', error);
    process.exit(1);
  }
};

seedDatabase();