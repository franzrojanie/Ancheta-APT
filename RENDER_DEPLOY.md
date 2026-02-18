# Deploying Ancheta Apartment System to Render

This guide covers deploying both the **backend** (Node.js/Express) and **frontend** (React/Vite) to Render.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Prepare your GitHub repository](#prepare-your-github-repository)
3. [Deploy Backend to Render](#deploy-backend-to-render)
4. [Deploy Frontend to Render](#deploy-frontend-to-render)
5. [Connect frontend to backend](#connect-frontend-to-backend)
6. [Environment Variables](#environment-variables)

---

## Prerequisites

- GitHub account
- Render account (free at https://render.com)
- Your repository pushed to GitHub (public or private)
- Render PostgreSQL database (recommended and managed by Render)

### Database Setup
Render provides **managed PostgreSQL** at no cost. This is ideal for production deployment.

**Create a PostgreSQL Instance** (recommended)
- Go to Render Dashboard → Create → PostgreSQL
- Choose free tier (Starter)
- Render will provide connection details automatically
- Copy the **Internal Connection String** - you'll need it for backend environment variables

---

## ⚠️ Important: PostgreSQL Migration

Since you're moving away from cPanel/MySQL to Render, the backend has been updated to use **PostgreSQL** instead of MySQL.

### What Changed:
1. ✅ Replaced `mysql2` package with `pg` (PostgreSQL driver)
2. ✅ Updated `backend/config/database.js` for PostgreSQL connections
3. ✅ Rewritten `backend/scripts/migrate.js` with PostgreSQL-compatible SQL
4. ✅ Updated `backend/scripts/seed.js` to work with PostgreSQL
5. ✅ Added missing database columns: `address`, `bedrooms`, `bathrooms`, `area_sqft`, `description`, `amenities`, `images`

### Before Deploying:

**Locally**, run:
```bash
cd backend
npm install
npm run migrate
npm run seed
```

This will set up the PostgreSQL schema with sample data.

---

## Prepare Your GitHub Repository

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Ancheta Apartment System"
   git remote add origin https://github.com/YOUR_USERNAME/ancheta-apartment.git
   git branch -M main
   git push -u origin main
   ```

2. **Check `.gitignore`** ensures `.env` files are NOT committed:
   ```
   .env
   .env.local
   .env.*.local
   backend/.env
   frontend/.env.local
   ```

3. **Verify folder structure** is git-tracked:
   ```
   .
   ├── backend/
   │   ├── package.json
   │   ├── server.js
   │   ├── config/
   │   ├── routes/
   │   └── scripts/
   ├── frontend/
   │   ├── package.json
   │   ├── src/
   │   ├── public/
   │   └── vite.config.js
   ├── docker-compose.yml
   └── README.md
   ```

---

## Deploy Backend to Render

### Step 1: Create Backend Service

1. Log in to **Render Dashboard**: https://dashboard.render.com
2. Click **Create** → **Web Service**
3. **Connect Repository**:
   - Select your GitHub repository
   - Click **Connect**

### Step 2: Configure Service

**Basic settings:**
- **Name**: `ancheta-apartment-backend`
- **Environment**: `Node`
- **Region**: Choose geographically closest to your users
- **Branch**: `main`

**Build & Start:**
- **Build Command**: 
  ```
  cd backend && npm install && npm run migrate
  ```
- **Start Command**: 
  ```
  cd backend && npm start
  ```

### Step 3: Add Environment Variables

In **Environment** tab, add:
```
PORT=3000
NODE_ENV=production
DB_HOST=your-render-postgres-host.render.com
DB_PORT=5432
DB_NAME=ancheta_apartment
DB_USER=your_postgres_user
DB_PASSWORD=your_secure_password
DB_SSL=true
FRONTEND_URL=https://ancheta-apartment-frontend.onrender.com
JWT_SECRET=anchetasecret12345
PAYMONGO_SECRET_KEY=sk_test_vdnnC2dZRARq96ujUEodXaNq
```

**Important**:
- **JWT_SECRET**: Set to `anchetasecret12345` (or generate a new one with `openssl rand -base64 32` for production)
- **DB_HOST/PORT**: Get these from your Render PostgreSQL dashboard
- **DB_SSL**: Set to `true` for PostgreSQL over Render
- **PAYMONGO_SECRET_KEY**: This is your test key; upgrade to live key when ready

### Step 4: Deploy

Click **Create Web Service** → Wait for deployment to complete.

Once deployed, Render will provide a URL like: `https://ancheta-apartment-backend.onrender.com`

### Step 5: Verify Backend

Test the health endpoint:
```
curl https://ancheta-apartment-backend.onrender.com/api/health
```

You should see: `{"status":"ok","message":"Ancheta Apartment API is running"}`

---

## Deploy Frontend to Render

### Step 1: Create Frontend Service

1. Click **Create** → **Static Site**
2. **Connect Repository** (same repo)

### Step 2: Configure Service

**Basic settings:**
- **Name**: `ancheta-apartment-frontend`
- **Branch**: `main`
- **Root Directory**: `frontend`

**Build Command**:
```
npm install && npm run build
```

**Publish Directory**: `dist`

### Step 3: Add Environment Variables (if needed)

If your frontend uses environment variables for the backend URL, add:
```
VITE_API_BASE_URL=https://ancheta-apartment-backend.onrender.com/api
```

Then update `frontend/src/services/api.js`:
```javascript
const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
```

### Step 4: Deploy

Click **Create Static Site** → Wait for build & deployment.

Render will provide a URL like: `https://ancheta-apartment-frontend.onrender.com`

---

## Connect Frontend to Backend

### Update Backend CORS

Update `backend/server.js` to allow your Render frontend:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',  // Local dev
    'https://ancheta-apartment-frontend.onrender.com'  // Render production
  ],
  credentials: true
}));
```

### Update Frontend API Service

Edit `frontend/src/services/api.js`:
```javascript
const API_BASE = process.env.VITE_API_BASE_URL 
  || (process.env.NODE_ENV === 'production' 
    ? 'https://ancheta-apartment-backend.onrender.com/api'
    : 'http://localhost:3000/api')
```

### Redeploy

- **Backend**: Push changes → Render auto-redeploys
- **Frontend**: Update env var in Render dashboard → Trigger redeploy

---

## Environment Variables Reference

### Backend (`backend/.env` for local) / Render Variables (for production)
```env
PORT=3000
NODE_ENV=production
DB_HOST=your-render-postgres-host.render.com
DB_PORT=5432
DB_NAME=ancheta_apartment
DB_USER=postgres_user
DB_PASSWORD=your_secure_password
DB_SSL=true
FRONTEND_URL=https://ancheta-apartment-frontend.onrender.com
JWT_SECRET=anchetasecret12345
PAYMONGO_SECRET_KEY=sk_test_vdnnC2dZRARq96ujUEodXaNq
```

### Frontend (`frontend/.env.local` or Render env vars)
```
VITE_API_BASE_URL=https://ancheta-apartment-backend.onrender.com/api
```

---

## Troubleshooting

### Backend Build/Deploy Fails
- Check **Logs** tab in Render
- Verify `npm install` completes in `backend/`
- Ensure `.env` variables are set correctly

### Database Connection Error
- Verify PostgreSQL credentials in Render environment variables
- Check that `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` are correct
- Ensure `DB_SSL=true` for Render PostgreSQL
- Check Render PostgreSQL dashboard to confirm database is running

### Frontend Shows 404 on Navigation
- Ensure **Publish Directory** is set to `dist`
- Vite build output should be in `frontend/dist/`

### CORS Errors
- Update backend `CORS` origin in code
- Redeploy backend after changes

---

## Next Steps

1. **Set up Custom Domain**
   - Go to Frontend service → Settings → Custom Domains
   - Add your domain (e.g., `apartment.yourdomain.com`)
   - Update DNS records pointing to Render
   - Render auto-provisions HTTPS with Let's Encrypt

2. **Database Backups**
   - Render PostgreSQL includes automatic daily backups
   - Access backups in PostgreSQL dashboard → Backups tab
   - Configure backup retention period (7 days default)

3. **Monitor Production**
   - Backend: Check **Logs** tab for errors
   - Frontend: Monitor **Build Logs** for build failures
   - Set up alerts in Render dashboard

4. **Upgrade PayMongo** (when ready)
   - Switch from test key (`sk_test_...`) to live key (`sk_live_...`)
   - Update `PAYMONGO_SECRET_KEY` in Render environment variables
   - Test a live payment transaction

5. **Performance & Security**
   - Enable **Auto-Deploy** on push (default)
   - Set up branch protection rules on GitHub
   - Monitor backend memory usage in Render dashboard
   - Consider upgrading plan if needed (Render free tier has limits)

**Render Resources**:
- [Render Docs](https://render.com/docs)
- [Node.js Deployment](https://render.com/docs/deploy-node)
- [Static Site Deployment](https://render.com/docs/static-sites)
