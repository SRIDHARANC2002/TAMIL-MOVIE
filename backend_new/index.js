require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const userRoutes = require('./src/routes/users');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());

// CORS Configuration with detailed logging
app.use((req, res, next) => {
  console.log('\n🔒 CORS Pre-flight Request:');
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  next();
}, cors({
  origin: '*',  // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser middleware - IMPORTANT: Place this BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n📨 Incoming Request Details:');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Log body but mask sensitive data
  const sanitizedBody = { ...req.body };
  if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
  if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[HIDDEN]';
  console.log('Body:', JSON.stringify(sanitizedBody, null, 2));
  
  // Add response logging
  const oldSend = res.send;
  res.send = function(data) {
    console.log('\n📤 Outgoing Response:');
    console.log('Status:', res.statusCode);
    console.log('Body:', typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    oldSend.apply(res, arguments);
  };
  
  next();
});

// Routes
app.use('/api/users', userRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    // First check if port is available
    const server = app.listen(PORT);
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
        process.exit(1);
      }
      console.error('❌ Server error:', error);
      process.exit(1);
    });

    // Then connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`
🚀 Server Running!
==================
📡 Port: ${PORT}
🔑 Environment: ${process.env.NODE_ENV || 'development'}
🗄️ Database: Connected
==================
    `);

  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});
