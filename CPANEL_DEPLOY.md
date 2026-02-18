# Deploying Ancheta Apartment System to cPanel

This guide covers deploying the application directly to a cPanel server using **Git SSH deployment and Node.js**.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setup on cPanel](#setup-on-cpanel)
3. [Deploy Backend](#deploy-backend)
4. [Deploy Frontend](#deploy-frontend)
5. [Database Setup](#database-setup)
6. [SSL/HTTPS Configuration](#ssldttps-configuration)
7. [Auto-Restart with PM2](#auto-restart-with-pm2)

---

## Prerequisites

- cPanel/WHM server with SSH access
- Node.js installed on server (via cPanel App Installer or EasyApache)
- MySQL/MariaDB configured on server
- Git SSH keys set up
- GitHub account with SSH access configured

---

## Setup on cPanel

### Step 1: Enable Node.js on Your Server

1. Log into **WHM** (WebHost Manager)
2. Navigate to **Software** → **Application Installer** (or **Node.js Installer**)
3. Install **Node.js** (choose LTS version 18 or higher)
4. Note the installation path (usually `/opt/cpanel/ea-nodejs20/` or similar)

### Step 2: Add Public SSH Key to GitHub

1. **Generate SSH key on server** (if not exists):
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```
   Press Enter for all prompts (no passphrase).

2. **Copy public key**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. **Add to GitHub**:
   - Go to GitHub Settings → SSH and GPG Keys → New SSH Key
   - Paste the entire key
   - Click Add SSH Key

### Step 3: Create Deployment Directory

SSH into your cPanel server:
```bash
ssh user@your-server.com
```

Create project directory:
```bash
mkdir -p public_html/ancheta-apartment
cd public_html/ancheta-apartment
```

---

## Deploy Backend

### Step 1: Clone Repository

```bash
git clone git@github.com:YOUR_USERNAME/ancheta-apartment.git .
# Or if you already have the directory:
git pull origin main
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install --production
```

### Step 3: Create `.env` File

```bash
nano .env
```

Add (replace with your values):
```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ancheta_apartment
DB_USER=ancheta_user
DB_PASSWORD=your_secure_password_here
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-random-secret-key-generate-with-openssl
PAYMONGO_SECRET_KEY=your_paymongo_key_or_leave_empty
```

Save (Ctrl+X, Y, Enter).

### Step 4: Run Database Migration

```bash
npm run migrate
```

You should see: `✅ Database tables created successfully`

### Step 5: Start Backend Service (Use PM2)

Install PM2 globally:
```bash
npm install -g pm2
```

Start backend with PM2:
```bash
pm2 start server.js --name "ancheta-backend"
```

Save PM2 config to auto-restart on reboot:
```bash
pm2 startup
pm2 save
```

### Step 6: Configure cPanel to Proxy Requests

#### Option A: Using cPanel's Addon Domains (Recommended)

1. Log into cPanel
2. Go to **Addon Domains**
3. Create addon domain for backend (e.g., `api.yourdomain.com`)
4. Point to `public_html/ancheta-apartment/backend/public` (or `/`)

#### Option B: Using Apache Proxy

Ask your hosting provider to enable **mod_proxy** and create `.htaccess` in `public_html/ancheta-apartment/`:

```apache
<IfModule mod_proxy.c>
  ProxyRequests On
  ProxyPass /api http://localhost:3000/api
  ProxyPassReverse /api http://localhost:3000/api
</IfModule>
```

---

## Deploy Frontend

### Step 1: Build Frontend

From `ancheta-apartment/frontend`:
```bash
npm install --production
npm run build
```

This creates a `dist/` folder with optimized static files.

### Step 2: Serve Frontend via cPanel

**Option A: Use the built frontend as public_html**

Copy `dist/` contents to your main domain's public_html:
```bash
cp -r frontend/dist/* ../
```

### Step 3: Configure Routing for SPA

Frontend is a **Single Page Application (SPA)** — all routes should serve `index.html`.

Create `.htaccess` in your cPanel `public_html/`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite existing files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything to index.html for SPA routing
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

---

## Database Setup

### Step 1: Create Database in cPanel

1. Log into cPanel
2. Go to **MySQL Databases**
3. Create database: `ancheta_apartment`
4. Create user: `ancheta_user` with password
5. Add user to database with **ALL PRIVILEGES**

Use **phpMyAdmin** to verify tables are created:
- Check database → should see `users`, `units`, `bills`, `payments`, `maintenance_requests` tables

---

## SSL/HTTPS Configuration

### Step 1: Enable AutoSSL

1. In cPanel, go to **AutoSSL**
2. Click **Run AutoSSL** to install free Let's Encrypt certificate
3. Choose all domains

### Step 2: Force HTTPS

Create `.htaccess` (or append to existing):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

---

## Auto-Restart with PM2

### Monitor Backend Service

```bash
pm2 status
pm2 logs ancheta-backend
```

### Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 save
```

### Auto-Deploy on Git Push

Install PM2 Plus (optional):
```bash
pm2 plus
```

Or create a **GitHub webhook** that pulls latest code and restarts:

1. Create a deploy script `backend/deploy.sh`:
```bash
#!/bin/bash
cd /home/user/public_html/ancheta-apartment
git pull origin main
cd backend
npm install --production
pm2 restart ancheta-backend
```

2. Make executable:
```bash
chmod +x backend/deploy.sh
```

3. (Advanced) Set up a webhook listener (e.g., using `webhook` npm package)

---

## Environment Variables for cPanel

### Backend (backend/.env)
```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ancheta_apartment
DB_USER=ancheta_user
DB_PASSWORD=SecurePassword123!
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=change-me-to-random-secret-key
PAYMONGO_SECRET_KEY=sk_live_xxx (if using PayMongo)
```

### Frontend (.env or vite config)
If backend is on same domain (recommended with proxy):
- No environment variable needed; API requests go to `/api`

If backend is on different domain:
- Update `frontend/src/services/api.js` to point to `https://api.yourdomain.com`

---

## Verification Checklist

- [ ] Node.js installed on cPanel
- [ ] Repository cloned via SSH
- [ ] Backend `.env` configured
- [ ] Database created and migrated
- [ ] Backend PM2 process running (`pm2 status`)
- [ ] Backend health check passes: `curl https://yourdomain.com/api/health`
- [ ] Frontend built and deployed to public_html
- [ ] Frontend routes working (SPA `.htaccess` in place)
- [ ] SSL certificate installed
- [ ] CORS configured for frontend domain
- [ ] Database backups enabled (cPanel Backups)

---

## Troubleshooting

### Backend Port 3000 Not Accessible
- Verify firewall allows port 3000
- Check PM2 logs: `pm2 logs ancheta-backend`
- Ensure Apache proxy/rewrite is configured

### Database Connection Error
- Verify credentials in `.env` match cPanel settings
- Test connection: `mysql -u ancheta_user -p ancheta_apartment`
- Check MySQL is running: `service mysql status`

### Frontend Shows 404 on Routes
- Verify `.htaccess` with SPA rewrite rules is present
- Check rewrite module enabled: `a2enmod rewrite`
- Test with `curl https://yourdomain.com/dashboard` — should serve `index.html`

### PM2 Process Crashes
- Check logs: `pm2 logs ancheta-backend`
- Verify `.env` variables are correct
- Ensure MySQL is running

### CORS Errors
- Update `backend/server.js` CORS origin to production domain
- Redeploy: `pm2 restart ancheta-backend`

---

## Maintenance

### Regular Updates
```bash
cd /home/user/public_html/ancheta-apartment
git pull origin main
cd backend
npm install --production
pm2 restart ancheta-backend
cd ../frontend
npm install --production
npm run build
cp -r dist/* ../
```

### Monitor Logs
```bash
pm2 logs ancheta-backend --lines 100
```

### Database Backups
- Use cPanel's **Backup** module (automate daily backups)
- Or use: `mysqldump -u ancheta_user -p ancheta_apartment > backup.sql`

---

## Resources

- [cPanel Node.js Support](https://docs.cpanel.net/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Apache Rewrite Guide](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html)
