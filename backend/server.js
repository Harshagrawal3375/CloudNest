const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const TelegramBot = require('node-telegram-bot-api');

let MongoMemoryServer;
try {
    MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (e) {
    MongoMemoryServer = null;
}

dotenv.config();
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(morgan('combined'));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many attempts, try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
global.bot = bot;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/swagger.json', express.static(path.join(__dirname, 'swagger.json')));
app.use('/api-docs', express.static(path.join(__dirname, 'swagger-ui.html')));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/file', apiLimiter, fileRoutes);

app.use((err, req, res, next) => {
    console.error(err && err.stack ? err.stack : err);
    res.status(500).json({
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? (err && err.message ? err.message : String(err)) : undefined
    });
});

async function startServer() {
    try {
        let mongoUri = process.env.MONGODB_URI;
        if (!mongoUri && process.env.NODE_ENV === 'development' && MongoMemoryServer) {
            const mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
            console.log('Using in-memory MongoDB for development.');
        }

        if (!mongoUri) {
            throw new Error('No MONGODB_URI provided and in-memory server not available');
        }

        await mongoose.connect(mongoUri);
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Connected to MongoDB and server running on port ${port}`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
        if (process.env.NODE_ENV === 'development' && MongoMemoryServer) {
            try {
                const mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();
                await mongoose.connect(uri);
                const port = process.env.PORT || 5000;
                app.listen(port, () => {
                    console.log('Connected to in-memory MongoDB and server running on port', port);
                });
                return;
            } catch (memErr) {
                console.error('In-memory MongoDB start failed:', memErr);
            }
        }
        process.exit(1);
    }
}

startServer();
