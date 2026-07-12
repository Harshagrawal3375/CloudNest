# CloudNest

A secure file storage and sharing platform that uses Telegram as a backend storage layer.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express 5, Mongoose |
| Storage | Telegram Bot API |
| Database | MongoDB |

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `JWT_SECRET` | Secret for JWT signing |
| `MONGODB_URI` | MongoDB connection string |
| `BOT_TOKEN` | Telegram bot token |
| `CHANNEL_USERNAME` | Telegram channel ID for file storage |
| `FRONTEND_URL` | Frontend origin for CORS |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BACKEND` | Backend API URL (default: http://localhost:5000) |

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/login` — Login

### Files (requires Bearer token)
- `POST /api/file/upload` — Upload a file
- `GET /api/file/download/:messageId` — Download a file
- `GET /api/file/my-files?page=1&limit=20` — List files with pagination
- `POST /api/file/share/:id` — Share/unshare a file with a user
- `DELETE /api/file/:id` — Delete a file

### Health
- `GET /health` — Health check
