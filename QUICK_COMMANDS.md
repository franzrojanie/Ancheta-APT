# Quick Commands Reference

## 🏠 Local Development

### Initial Setup (First time)

```bash
# Backend
cd backend
npm install
copy .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Daily Startup

```powershell
# Terminal 1: Backend
cd backend
npm run dev
# Should show: Server running on http://localhost:3000

# Terminal 2: Frontend
cd frontend
npm run dev
# Should show: Local: http://localhost:5173
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Create tenant (with new fields)
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "address": "123 Main Street, Apt 4B"
  }'

# Get tenant detail
curl http://localhost:3000/api/tenants/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update tenant
curl -X PUT http://localhost:3000/api/tenants/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "555-5678",
    "address": "456 Oak Ave, Apt 2C"
  }'

# Change password
curl -X POST http://localhost:3000/api/users/me/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "old_password": "password123",
    "new_password": "newpassword456"
  }'

# Get users (excludes tenants by default)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get users (include tenants)
curl "http://localhost:3000/api/users?role=tenant" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create unit (with new fields)
curl -X POST http://localhost:3000/api/units \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "unit_number": "A101",
    "floor": 1,
    "building": "Building A",
    "type": "1BR",
    "rent_amount": 15000,
    "bedrooms": 1,
    "bathrooms": 1,
    "area_sqft": 450,
    "description": "Cozy 1-bedroom apartment with city view",
    "amenities": "WiFi, AC, Kitchen",
    "images": "https://example.com/unit1.jpg,https://example.com/unit2.jpg"
  }'
```

---

## 🚀 Render Deployment

### 1. Prepare GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy Backend

In **Render Dashboard**:
1. Create Web Service
2. Select GitHub repo
3. Settings:
   - **Language:** Node
   - **Build Command:** `cd backend && npm install && npm run migrate`
   - **Start Command:** `cd backend && npm start`
4. Add Environment Variables:
   ```
   PORT=3000
   NODE_ENV=production
   DB_HOST=your-mysql-host
   DB_PORT=3306
   DB_NAME=ancheta_apartment
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   FRONTEND_URL=https://your-frontend-url.onrender.com
   JWT_SECRET=your-random-secret-key
   PAYMONGO_SECRET_KEY=sk_live_xxx (if using)
   ```
5. Click **Create Web Service**

### 3. Deploy Frontend

In **Render Dashboard**:
1. Create Static Site
2. Select GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Click **Create Static Site**

### 4. Verify Deployment

```bash
# Test backend (replace with your URL)
curl https://ancheta-apartment-backend.onrender.com/api/health

# Test frontend (should load dashboard or login page)
# Open: https://ancheta-apartment-frontend.onrender.com
```

---

## 💻 cPanel Deployment

### 1. Connect SSH

```bash
ssh user@your-server.com
```

### 2. Clone Repository

```bash
cd public_html
git clone git@github.com:YOUR_USERNAME/ancheta-apartment.git .
cd ancheta-apartment
```

### 3. Setup Backend

```bash
cd backend
npm install --production

# Create .env
cat > .env << EOF
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ancheta_apartment
DB_USER=ancheta_user
DB_PASSWORD=your-secure-password
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=$(openssl rand -base64 32)
PAYMONGO_SECRET_KEY=
EOF

# Run migration
npm run migrate

# Install PM2 globally
npm install -g pm2

# Start backend
pm2 start server.js --name "ancheta-backend"

# Auto-restart on reboot
pm2 startup
pm2 save
```

### 4. Build Frontend

```bash
cd frontend
npm install --production
npm run build

# Copy to public_html
cp -r dist/* ../
```

### 5. Add SPA Routing (.htaccess)

```bash
cat > ../.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
EOF
```

### 6. Monitor

```bash
# Check backend status
pm2 status

# View logs
pm2 logs ancheta-backend

# Restart if needed
pm2 restart ancheta-backend
```

---

## 🐛 Troubleshooting Commands

### Backend Connection Issues

```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Check PM2 logs (cPanel)
pm2 logs ancheta-backend --lines 50

# Test database connection from command line
mysql -u root -p ancheta_apartment -e "SELECT COUNT(*) FROM users;"

# Check MySQL status (cPanel)
service mysql status

# Restart MySQL
service mysql restart
```

### Frontend Issues

```bash
# Rebuild frontend
cd frontend
npm run build

# Check dist folder created
ls -la frontend/dist/

# Clear browser cache and hard refresh
# Ctrl+Shift+R (Chrome/Firefox) or Cmd+Shift+R (Mac)
```

### CORS Issues

Edit `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
```

Then restart backend:
```bash
# Local
# Stop: Ctrl+C in terminal
npm run dev

# cPanel
pm2 restart ancheta-backend
```

---

## 🔄 Auto-Deploy Updates

### Update on cPanel (pull latest)

```bash
cd /home/user/public_html/ancheta-apartment

# Pull latest code
git pull origin main

# Reinstall deps (if package.json changed)
cd backend && npm install --production
cd ../frontend && npm install --production && npm run build

# Restart backend
pm2 restart ancheta-backend

# Copy new frontend files
cp -r frontend/dist/* /home/user/public_html/
```

---

## 📊 Database Maintenance

### Backup Database

```bash
# Local MySQL
mysqldump -u root -p ancheta_apartment > backup.sql

# cPanel
mysqldump -u ancheta_user -p ancheta_apartment > backup.sql
```

### Restore Database

```bash
mysql -u root -p ancheta_apartment < backup.sql
```

### Reset Database (clear everything)

```bash
# Login to MySQL
mysql -u root -p

# Drop and recreate
DROP DATABASE ancheta_apartment;
CREATE DATABASE ancheta_apartment;
EXIT;

# Re-migrate and seed
npm run migrate
npm run seed
```

---

## 🔐 Generate Secure Keys

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate API key
openssl rand -hex 32

# Result examples:
# JWT: d7k9mP2xL3vN8wQ5rT6yU9aB1cD4eF7gH0jK2lM5n8oP1q4sT7
# API: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 📋 Pre-Deployment Checklist

```bash
# Run before pushing to Render/cPanel

# 1. Test backend locally
npm run dev  # Should show "Database connected"

# 2. Test frontend locally
npm run build  # Should complete without errors
npm run dev    # Should load at localhost:5173

# 3. Check .env not in git
git status | grep .env  # Should show nothing

# 4. Verify migrations
npm run migrate  # Should show success

# 5. Check for console.log on secrets
grep -r "password\|secret\|token" src/ | grep log  # Should show nothing

# ✅ Ready to deploy!
```

---

## 📞 Getting Help

- **Render issues?** → `RENDER_DEPLOY.md` Troubleshooting
- **cPanel issues?** → `CPANEL_DEPLOY.md` Troubleshooting
- **General help?** → `DEPLOYMENT_GUIDE.md`
- **Full checklist?** → `DEPLOYMENT_CHECKLIST.md`

---

**Remember: Always backup your database before major changes! 💾**
