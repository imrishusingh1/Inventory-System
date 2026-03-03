const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routes/UserRouter');
const productRouter = require('./routes/ProductRouter');
const stockRouter = require('./routes/StockRouter');
const reportRouter = require('./routes/ReportRouter');
const exportRouter = require('./routes/ExportRouter');
const orderRouter = require('./routes/OrderRouter');
const publicRouter = require('./routes/PublicRouter');

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    // Allow any localhost origin during development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    // Allow configured frontend URL
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection with caching for serverless
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.log('MongoDB connection error:', err);
    throw err;
  }
};

// Connect to DB before handling requests (for serverless)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/auth', userRouter);
app.use('/api/products', productRouter);
app.use('/api/stock', stockRouter);
app.use('/api/reports', reportRouter);
app.use('/api/export', exportRouter);
app.use('/api/orders', orderRouter);
app.use('/api/public', publicRouter);

// Global Error Handler
const globalErrorHandler = require('./middlewares/GlobalErrorHandler');
app.use(globalErrorHandler);

// Only listen locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

// Export for Vercel serverless
module.exports = app;
