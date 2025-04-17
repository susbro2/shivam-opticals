require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

// Configure CORS
const corsOptions = {
    origin: ['http://localhost:3000', 'https://yourdomain.com'], // Add your domain
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Make Google API key available
app.get('/api/google-key', (req, res) => {
    if (!process.env.GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'Google API key not configured' });
    }
    res.json({ apiKey: process.env.GOOGLE_API_KEY });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful AI assistant for Shivam Opticals. You help customers with queries about eye care, glasses, contact lenses, and other optical services." },
                { role: "user", content: message }
            ],
            max_tokens: 150
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`- GET  /api/google-key`);
    console.log(`- POST /chat`);
});