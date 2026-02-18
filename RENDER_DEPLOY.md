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
- MySQL database (either local MySQL connected from Render, or Render's managed PostgreSQL)

### Note on Database
**Render does NOT provide MySQL/MariaDB**. You have these options:

**Option A: Use your own MySQL server** (recommended for cPanel integration)
- Keep your existing MySQL server running (e.g., on cPanel)
- Use the public IP or domain to connect from Render
- Set `DB_HOST` to your server's IP/domain in Render environment variables

**Option B: Migrate to PostgreSQL**
- Render offers managed PostgreSQL
- Requires database schema migration (not covered here)

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
DB_HOST=YOUR_MYSQL_SERVER_IP_OR_DOMAIN
DB_PORT=3306
DB_NAME=ancheta_apartment
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
FRONTEND_URL=https://YOUR_FRONTEND_DOMAIN.onrender.com
PAYMONGO_SECRET_KEY=YOUR_PAYMONGO_KEY_HERE
JWT_SECRET=your-super-secret-key-change-this
```

**Important**:
- If MySQL is on **cPanel**: Use cPanel's public IP or domain
- Set strong `JWT_SECRET` (use: `openssl rand -base64 32`)
- Or leave `PAYMONGO_SECRET_KEY` empty if not using PayMongo yet

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

### Backend (`backend/.env`)
```env
PORT=3000
NODE_ENV=production
DB_HOST=your-mysql-server.com
DB_PORT=3306
DB_NAME=ancheta_apartment
DB_USER=root
DB_PASSWORD=your_secure_password
FRONTEND_URL=https://ancheta-apartment-frontend.onrender.com
JWT_SECRET=your-random-secret-key-here
PAYMONGO_SECRET_KEY=pk_live_xxx (optional)
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
- Verify MySQL is accessible from Render's IP
- Check firewall rules on cPanel server
- Test connection locally with same credentials

### Frontend Shows 404 on Navigation
- Ensure **Publish Directory** is set to `dist`
- Vite build output should be in `frontend/dist/`

### CORS Errors
- Update backend `CORS` origin in code
- Redeploy backend after changes

---

## Next Steps

1. Set up **custom domain** (Render → Settings → Custom Domains)
2. Enable **HTTPS** (automatic on Render)
3. Set up **database backups** (use cPanel's backup system)
4. Monitor logs in Render dashboard for production issues

**Render Resources**:
- [Render Docs](https://render.com/docs)
- [Node.js Deployment](https://render.com/docs/deploy-node)
- [Static Site Deployment](https://render.com/docs/static-sites)
