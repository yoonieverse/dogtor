const path = require('path');
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// CORS configuration - allow all origins for development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware to see incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  next();
});

app.use(express.json());

const apiKey = process.env.FEATHERLESS_API_KEY;
if (!apiKey) {
  console.error('Missing FEATHERLESS_API_KEY in .env. Add: FEATHERLESS_API_KEY=your_key');
}

const client = new OpenAI({
  baseURL: "https://api.featherless.ai/v1",
  apiKey: apiKey || 'dummy', // OpenAI client requires a value; request will fail if key is invalid
});

// Basic test route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// AI route
app.post('/chat', async (req, res) => {
  console.log('POST /chat received');
  try {
    const { message, conversationHistory } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid message' });
    }

    // Build messages array with system prompt and conversation history
    const messages = [
      {
        role: "system",
        content: "You are Dogster, a kind and friendly health helper who talks with children age 12 and under. Use very simple words, short sentences, and a warm, playful tone. Format every response so it is easy for kids to read: use short paragraphs, blank lines between sections, and a few friendly emojis. Prefer asking 2–4 gentle leading questions instead of long explanations or long lists. Keep responses concise. Encourage the child to involve a parent, guardian, or trusted adult when discussing symptoms. You may only answer questions related to health, the body, or basic wellness. If a question is outside health topics, politely say you can only help with health questions. If the child mentions mental health concerns, strong pain, injuries, or anything serious, kindly tell them to inform a parent/guardian right away and suggest talking to a real doctor, nurse, or healthcare professional. Make it clear you are a supportive assistant, not a doctor. When giving tips, keep them simple (1–2 gentle ideas) and safe for children."
      }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        if (msg.sender === "user") {
          messages.push({ role: "user", content: msg.text });
        } else if (msg.sender === "dog") {
          messages.push({ role: "assistant", content: msg.text });
        }
      });
    }

    // Add the current message
    messages.push({ role: "user", content: message });

    const response = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3-0324",
      messages: messages
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error('Chat API error - Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error code:', error.code);
    
    let userMessage = 'Something went wrong';
    if (!apiKey) {
      userMessage = 'Server missing API key (FEATHERLESS_API_KEY). Add it to backend/.env and restart.';
    } else if (error.status === 401 || error.code === 'invalid_api_key') {
      userMessage = 'Invalid API key. Check FEATHERLESS_API_KEY in backend/.env.';
    } else if (error.status === 429) {
      userMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.message) {
      userMessage = error.message;
    } else if (error.error?.message) {
      userMessage = error.error.message;
    }
    
    console.error('Sending error to client:', userMessage);
    res.status(500).json({ error: userMessage });
  }
});

const PORT = process.env.PORT || 5001; // Use 5001 if 5000 is taken

app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Test it at: http://localhost:${PORT}`);
  console.log(`✅ API endpoint: http://localhost:${PORT}/chat`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
    console.error(`   You can set PORT environment variable: PORT=5002 npm start`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});