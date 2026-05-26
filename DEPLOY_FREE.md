# Free Deployment Guide

This project is prepared for a free deployment as one Render web service plus a free hosted PostgreSQL database.

## Free Stack

- App hosting: Render free web service
- Database: Supabase Free or Neon Free PostgreSQL
- Frontend: Built during Docker build and served by FastAPI
- Backend: FastAPI at `/api`

Serving the frontend and backend from the same Render domain keeps auth cookies simple and avoids cross-domain login issues.

## 1. Create A Free PostgreSQL Database

Create a free PostgreSQL project on Supabase or Neon, then copy the connection string.

Use the normal PostgreSQL URL. The backend accepts either:

```env
postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

or:

```env
postgresql+asyncpg://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

The app automatically converts standard PostgreSQL URLs to the async driver format needed by SQLAlchemy.

## 2. Push The Code To GitHub

Push this folder to:

```text
https://github.com/Prabhmehar003/Malwa-Milk-Farm-erp
```

Commit the new deployment files before connecting Render:

```bash
git add .
git commit -m "Prepare free Render deployment"
git push
```

## 3. Deploy On Render

In Render:

1. Choose **New +**.
2. Choose **Blueprint**.
3. Connect the GitHub repo.
4. Select the repo root so Render can read `render.yaml`.
5. Fill these environment variables when Render asks:

```env
POSTGRES_URL=your_postgres_connection_string
ADMIN_PASSWORD=choose-a-strong-password
```

`JWT_SECRET` is generated automatically by `render.yaml`.

## 4. Login

After deployment opens:

```text
Email: admin@malwamilk.com
Password: the ADMIN_PASSWORD you set on Render
```

The first request after inactivity may be slow because Render free services sleep.

## Manual Render Settings

If you do not use Blueprint, create a Render web service with:

```text
Runtime: Docker
Dockerfile path: ./Dockerfile
Plan: Free
```

Set these environment variables:

```env
APP_ENV=production
POSTGRES_URL=your_postgres_connection_string
POSTGRES_SSL=true
JWT_SECRET=generate-a-long-random-value
ADMIN_EMAIL=admin@malwamilk.com
ADMIN_PASSWORD=choose-a-strong-password
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
SEED_STAFF_USER=false
WRITE_TEST_CREDENTIALS=false
```
