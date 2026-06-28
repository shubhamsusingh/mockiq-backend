# MockIQ Backend API

Node.js + TypeScript + Express + MySQL backend for the MockIQ mock interview platform.

---

## Folder Structure

```
src/
├── index.ts                  ← Entry point (Express app + start)
├── config/
│   ├── db.ts                 ← MySQL connection pool
│   ├── axios.ts              ← Axios clients (Ollama, external)
│   └── response.ts           ← sendSuccess / sendError helpers
├── middleware/
│   ├── auth.middleware.ts    ← JWT authenticate + authorizeAdmin
│   └── error.middleware.ts   ← 404 + global error handler
├── controllers/
│   ├── auth.controller.ts    ← signup, login, logout, refresh, me
│   ├── user.controller.ts    ← profile, update, change-password, list
│   ├── domain.controller.ts  ← list, get, create, update, delete
│   ├── session.controller.ts ← save, history, stats, getById
│   └── question.controller.ts← list, random, getById, create
├── routes/
│   ├── index.ts              ← Central router (mounts all sub-routers)
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── domain.routes.ts
│   ├── session.routes.ts
│   └── question.routes.ts
└── types/
    └── index.ts              ← Shared interfaces and types
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your MySQL credentials and JWT secrets in .env
```

### 3. Create the database and tables
```bash
mysql -u root -p < schema.sql
```

### 4. Seed demo data
```bash
mysql -u root -p mockiq_db < seed.sql
```

### 5. Run in development
```bash
npm run dev
```

---

## API Reference

### Auth  `/api/auth`
| Method | Endpoint          | Auth | Description          |
|--------|-------------------|------|----------------------|
| POST   | `/signup`         | ✗    | Register new user    |
| POST   | `/login`          | ✗    | Login, get tokens    |
| POST   | `/logout`         | ✗    | Invalidate refresh   |
| POST   | `/refresh`        | ✗    | Refresh access token |
| GET    | `/me`             | ✓    | Current user info    |

### User  `/api/user`
| Method | Endpoint           | Auth  | Description          |
|--------|--------------------|-------|----------------------|
| GET    | `/profile`         | ✓     | Own profile          |
| PUT    | `/profile`         | ✓     | Update name          |
| PUT    | `/change-password` | ✓     | Change password      |
| GET    | `/list`            | Admin | List + search users  |

### Domain  `/api/domain`
| Method | Endpoint | Auth  | Query params      |
|--------|----------|-------|-------------------|
| GET    | `/list`  | ✗     | `?search=`        |
| GET    | `/:id`   | ✗     |                   |
| POST   | `/`      | Admin |                   |
| PUT    | `/:id`   | Admin |                   |
| DELETE | `/:id`   | Admin | soft delete       |

### Question  `/api/question`
| Method | Endpoint  | Auth  | Query params                             |
|--------|-----------|-------|------------------------------------------|
| GET    | `/list`   | ✗     | `?search=&domain_id=&difficulty=&page=`  |
| GET    | `/random` | ✓     | `?domain_id=&difficulty=&exclude=1,2,3`  |
| GET    | `/:id`    | ✗     |                                          |
| POST   | `/`       | Admin |                                          |

### Session  `/api/session`
| Method | Endpoint   | Auth | Query params                             |
|--------|------------|------|------------------------------------------|
| POST   | `/`        | ✓    | Save completed session                   |
| GET    | `/history` | ✓    | `?search=&domain=&difficulty=&page=`     |
| GET    | `/stats`   | ✓    | Dashboard summary                        |
| GET    | `/:id`     | ✓    | Single session + answers                 |

---

## Default Credentials (from seed)

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@mockiq.dev   | password  |

> Change this immediately after first login.
