# Job Board API

A production-ready RESTful API for a job board platform built with Node.js, Express.js, TypeScript, and MongoDB. Supports two user roles (recruiter and candidate) with JWT-based authentication, full-text job search, and MongoDB aggregation pipelines for analytics.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM) — hosted on MongoDB Atlas
- **Auth:** JWT + bcryptjs
- **Containerization:** Docker, Docker Compose

## Features

- Role-based access control — recruiters post jobs and view applicants; candidates apply and track applications
- Full-text job search using MongoDB text indexes on title, description, and skills
- Dynamic filtering by job type, location, and skills with pagination
- Duplicate application prevention via compound unique index on (job, candidate)
- Recruiter analytics dashboard powered by MongoDB aggregation pipelines — applications per job and top skills in demand
- Containerized with Docker Compose and connected to a cloud-hosted MongoDB Atlas cluster

## Project Structure

```
job-board-api/
├── src/
│   ├── config/
│   │   └── db.ts                 # MongoDB connection
│   ├── middleware/
│   │   ├── auth.ts               # JWT verify + role-based guards
│   │   └── errorHandler.ts       # Centralized error handling
│   ├── models/
│   │   ├── User.ts               # User schema (recruiter | candidate)
│   │   ├── Job.ts                # Job schema with text index
│   │   └── Application.ts        # Application schema with compound index
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── jobController.ts
│   │   └── applicationController.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── jobs.ts
│   │   └── applications.ts
│   └── index.ts
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- MongoDB Atlas account (free M0 tier works)

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/ProphetMason/job-board-api.git
cd job-board-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jobboard?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

4. Run in development mode:
```bash
npm run dev
```

### Docker Setup

```bash
docker compose up --build
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register as recruiter or candidate |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Protected | Get current user |

### Jobs

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/jobs` | Public | List all jobs with search, filter, pagination |
| GET | `/api/jobs/:id` | Public | Get a single job |
| POST | `/api/jobs` | Recruiter | Post a new job |
| PUT | `/api/jobs/:id` | Recruiter (owner) | Update a job |
| DELETE | `/api/jobs/:id` | Recruiter (owner) | Delete a job |
| GET | `/api/jobs/analytics` | Recruiter | Aggregation analytics |

### Applications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/applications/:jobId` | Candidate | Apply to a job |
| GET | `/api/applications/mine` | Candidate | View own applications |
| GET | `/api/applications/job/:jobId` | Recruiter (owner) | View applicants for a job |
| PATCH | `/api/applications/:id/status` | Recruiter (owner) | Update application status |

### Query Parameters for GET /api/jobs

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Full-text search on title, description, skills |
| `type` | string | Filter by `full-time`, `part-time`, `contract`, `remote` |
| `location` | string | Case-insensitive location filter |
| `skills` | string | Comma-separated skills filter e.g. `Node.js,MongoDB` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

### Example Requests

**Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"secret123","role":"recruiter"}'
```

**Create a Job**
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Backend Engineer","description":"...","company":"TechCorp","location":"Remote","type":"full-time","skills":["Node.js","MongoDB"]}'
```

**Search Jobs**
```bash
curl "http://localhost:5000/api/jobs?search=backend&type=full-time&skills=Node.js,MongoDB&page=1&limit=10"
```

## Analytics Response Example

```json
{
  "success": true,
  "analytics": {
    "totalJobs": 3,
    "applicationStats": [
      { "_id": "...", "title": "Backend Engineer", "applicationCount": 5, "isActive": true }
    ],
    "topSkills": [
      { "skill": "Node.js", "count": 3 },
      { "skill": "MongoDB", "count": 2 }
    ]
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server listens on |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | JWT expiry duration (e.g. `7d`) |

## License

MIT