# GrantKit (TypeScript) — Grant Application Information Manager

This is a small, open-source product to help charities manage reusable grant application information.

## Why local mock storage?
During the hack context, teams were asked not to use cloud databases and to mock data locally, while designing for future persistence.
This build stores data in a local JSON file under `apps/api/data/db.json`.

## Windows-only Setup

### 0) Prereqs
- Node.js 20+ recommended

### 1) Create projects
```Command Prompt as Admin
mkdir 51a7db-tfg-hack-grant-application-node
cd 51a7db-tfg-hack-grant-application-node
npm init -y

mkdir apps
mkdir apps\api

cd apps

cd api
npm init -y
npm install express cors helmet morgan nanoid zod
npm install -D typescript tsx @types/node @types/express @types/cors @types/morgan
mkdir src
mkdir data
```

### 2) Install + run
From repo root: 51a7db-tfg-hack-grant-application-node
```Command Prompt as Admin
npm install
npm run dev
```

- API: http://localhost:4000/api/health

## Data location
- `apps/api/data/db.json`
- Backup/Restore available in UI
