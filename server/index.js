const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from root .env or server .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/greencard', require('./routes/greencard'));
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LeaveEase Full-Stack Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve Frontend Static Files (Single Host Setup)
const frontendDist = path.join(__dirname, '..', 'project', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA fallback for non-API client-side routes (e.g. /login, /student/dashboard)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Initialize database & start server
async function startServer() {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('YOUR_USERNAME')) {
      await connectDB();
    } else {
      console.warn('⚠️ Warning: MONGODB_URI is not set or still contains placeholder credentials in .env.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 LeaveEase Unified Full-Stack app running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
