const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/password');
const furnitureRoutes = require('./routes/furnitureRoutes');

const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/admin');
const designRoutes = require('./routes/designRoutes');
const paintRoutes = require('./routes/paintRoutes');


const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Permissive CORS for dev debugging
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Global Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/furniture', furnitureRoutes);

app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/paint', paintRoutes);


// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Interior Design System API is running!' });
});

// Catch-all for 404
app.use((req, res) => {
  console.log(`[404] NOT FOUND: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.url} not found on this server.` });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});