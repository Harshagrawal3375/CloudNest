const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

let mongod;
let app;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    process.env.JWT_SECRET = 'test-secret';
    process.env.BOT_TOKEN = 'fake-token';
    process.env.CHANNEL_USERNAME = 'fake-channel';

    const authRoutes = require('../routes/authRoutes');
    const fileRoutes = require('../routes/fileRoutes');

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/file', fileRoutes);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

describe('Auth', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
    };

    it('should signup a new user', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(testUser);
        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.msg).toBe('User created successfully');
    });

    it('should not signup with duplicate email', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(testUser);
        expect(res.status).toBe(400);
    });

    it('should not signup with invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'not-an-email', password: 'password123', name: 'Test' });
        expect(res.status).toBe(400);
    });

    it('should not signup with short password', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'new@example.com', password: '123', name: 'Test' });
        expect(res.status).toBe(400);
    });

    it('should login with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' });
        expect(res.status).toBe(400);
    });

    it('should not login with nonexistent email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });
        expect(res.status).toBe(400);
    });
});

describe('File Routes (auth required)', () => {
    let token;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });
        token = res.body.token;
    });

    it('should reject requests without token', async () => {
        const res = await request(app).get('/api/file/my-files');
        expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
        const res = await request(app)
            .get('/api/file/my-files')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(401);
    });

    it('should return empty files list for new user', async () => {
        const res = await request(app)
            .get('/api/file/my-files')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.totalFiles).toBe(0);
    });

    it('should return health check', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});
