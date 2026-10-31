import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main API Routes Middleware
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/chat', chatRoutes);

// Direct AI Chatbot Fallback Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, resumeContext } = req.body;
    const targetRole = resumeContext?.targetRole || 'Software Engineer';
    const score = resumeContext?.matchScore || 75;
    const candidate = resumeContext?.candidateName || 'Candidate';

    const reply = `Hi ${candidate}! For your target role as ${targetRole} (Current ATS Score: ${score}%), focus on bridging high-priority skill gaps and adding quantifiable achievements in your project descriptions.`;

    res.json({ reply });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ reply: "I'm here to help guide your career path and resume optimization." });
  }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ai_enabled: false, model: "SQLite Local Engine" });
});
// Start Express Server
app.listen(PORT, () => {
  console.log(`\n⚡ Server running on http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health\n`);
});