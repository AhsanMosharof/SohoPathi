require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const quizRoutes = require('./routes/quiz');
const answerRoutes = require('./routes/answer');
const dashboardRoutes = require('./routes/dashboard');
const explainRoutes = require('./routes/explain');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Sohopathi API is running 🚀', status: 'ok' });
});

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/generate-quiz', quizRoutes);
app.use('/api/submit-answer', answerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/explain', explainRoutes);

// Error handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🎓 Sohopathi Server is running on http://localhost:${PORT}`);
});
