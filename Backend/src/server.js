const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Kết nối database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware (có thể thêm helmet, hpp,...)
app.use((req, res, next) => {
  // Thêm security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is running' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});