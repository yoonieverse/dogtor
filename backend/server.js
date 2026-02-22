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

    const messages = [
      {
        role: "system",
        content: "You are Dogtor, a kind, friendly medical helper who talks with children (age 12 and under) about their health. Use simple words, a warm tone, and short explanations kids understand. For simple questions, keep responses around 250–320 characters and complete the thought in 2–3 short sentences. Avoid long lists. Ask one gentle follow-up question. Encourage involving a parent, guardian, or trusted adult when discussing symptoms. Only answer health, body, or basic wellness questions. If the topic is not health-related, kindly say you can only help with health questions. If the child mentions mental health struggles, serious symptoms, injuries, or danger, encourage telling a parent/guardian right away and suggest speaking with a real healthcare professional. Make clear you are supportive but not a doctor."
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
      messages: messages,
      temperature: 0.7
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
      userMessage = 'Here you go:';
    } else if (error.message) {
      userMessage = error.message;
    } else if (error.error?.message) {
      userMessage = error.error.message;
    }
    
    console.error('Sending error to client:', userMessage);
    res.status(500).json({ error: userMessage });
  }
});

// Diagnosis analysis: analyze transcript + context and return symptom-based prediction
app.post('/analyze-diagnosis', async (req, res) => {
  console.log('POST /analyze-diagnosis received');
  try {
    const { transcript, prescreeningData = {}, bodyParts = [] } = req.body || {};
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return res.status(400).json({ error: 'Missing or empty transcript' });
    }

    const bodyPartLabels = {
      head: 'Head', chest: 'Chest', tummy: 'Tummy',
      'left-arm': 'Left Arm', 'right-arm': 'Right Arm',
      'left-hand': 'Left Hand', 'right-hand': 'Right Hand',
      'left-leg': 'Left Leg', 'right-leg': 'Right Leg',
      'left-foot': 'Left Foot', 'right-foot': 'Right Foot',
      eyes: 'Eyes', ears: 'Ears', nose: 'Nose', mouth: 'Mouth',
    };
    const bodyPartsList = bodyParts.map(p => bodyPartLabels[p] || p).join(', ') || 'None specified';

    const contextParts = [];
    if (Object.keys(prescreeningData).length > 0) {
      contextParts.push('Prescreening: ' + JSON.stringify(prescreeningData));
    }
    contextParts.push('Body areas of concern: ' + bodyPartsList);
    const contextBlock = contextParts.length ? '\n\nContext:\n' + contextParts.join('\n') : '';

    const userContent = `Conversation transcript:\n${transcript.join('\n')}${contextBlock}`;

    const response = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3-0324",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const raw = response.choices[0].message.content || '{}';
    let analysis;
    try {
      const cleaned = raw.replace(/```json?\s*|\s*```/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse diagnosis analysis JSON:', raw);
      analysis = {
        summary: raw.slice(0, 500) || 'Analysis could not be parsed.',
        symptoms: [],
        possibleCauses: [],
        recommendations: ['Please have a parent or guardian review the conversation and consult a doctor if needed.'],
      };
    }

    if (!Array.isArray(analysis.symptoms)) analysis.symptoms = [];
    if (!Array.isArray(analysis.possibleCauses)) analysis.possibleCauses = [];
    if (!Array.isArray(analysis.recommendations)) analysis.recommendations = [];
    if (typeof analysis.summary !== 'string') analysis.summary = String(analysis.summary || '');

    res.json({ analysis });
  } catch (error) {
    console.error('Analyze-diagnosis API error:', error);
    const userMessage = !apiKey
      ? 'Server missing API key.'
      : error.status === 429
        ? 'here you go:'
        : error.message || 'Analysis failed.';
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