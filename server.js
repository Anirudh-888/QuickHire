const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static files from the uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const userRoutes = require('./routes/userRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const agentRoutes = require('./routes/agentRoutes');

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/agent', agentRoutes);

const fs = require('fs');

// Serve static assets if the dist folder exists
const distPath = path.join(__dirname, 'frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*any', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('QuickHire API is running...');
  });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
