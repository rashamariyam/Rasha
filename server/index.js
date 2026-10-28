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
const rootDist = path.join(__dirname, '..', 'dist');
const distPath = fs.existsSync(frontendDist) ? frontendDist : (fs.existsSync(rootDist) ? rootDist : null);

if (distPath) {
  app.use(express.static(distPath));

  // SPA fallback for non-API client-side routes (e.g. /login, /student/dashboard)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Warning: Frontend dist folder not found. API routes are active.');
  app.get('*', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>LeaveEase - Building Frontend</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white;">
          <div style="text-align: center; max-width: 500px; padding: 2rem;">
            <h2>🚀 LeaveEase Backend API is Live</h2>
            <p style="color: #94a3b8;">Frontend assets are currently compiling or building. Please refresh in a moment or run npm run build.</p>
          </div>
        </body>
      </html>
    `);
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

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 LeaveEase Unified Full-Stack app running at http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
