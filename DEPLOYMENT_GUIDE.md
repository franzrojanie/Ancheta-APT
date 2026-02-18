# Ancheta Apartment Management System — Deployment Guide

## 🚀 Quick Overview

This is a full-stack apartment management system with:
- **Backend**: Node.js/Express API with MySQL database
- **Frontend**: React/Vite responsive SPA with Tailwind CSS
- **Features**: Tenant management, unit management, billing, payments, maintenance requests
- **Deployment**: Ready for Render (cloud) or cPanel (traditional hosting)

---

## 📋 What's New (Latest Changes)

### ✨ Footer Implementation
- **Responsive footer** with "© 2026 Ancheta Apartment System" copyright
- **PDF link** to Rental Law docs (clickable, opens in new tab)
- **Sticky footer**: Always at bottom of page, adjusts to content
- **Mobile responsive**: Flexes on small screens

### 🔧 Backend Improvements
- Added `tenant.address` field for contract/contact information
- Enhanced tenants creation with email and address
- Tenant detail view and edit functionality (manager/staff)
- Payment log fix: Prevents duplicate pending payments for same bill
- User password change endpoint for tenants/staff profiles
- Extended units with images, descriptions, and amenities
- Staff now allowed to create units (in addition to manager)

### 📦 Deployment Documentation
- **`RENDER_DEPLOY.md`** — Complete Render cloud deployment guide
- **`CPANEL_DEPLOY.md`** — Complete cPanel traditional hosting guide
- **`DEPLOYMENT_CHECKLIST.md`** — Pre-deployment verification checklist
- **`.env.example`** — Environment variable template with documentation

---

## 🌐 Deployment Options

### Option 1: Render (Cloud - Recommended for beginners)
✅ Easiest  
✅ Auto-scaling  
✅ Free tier available  
📖 See: **`RENDER_DEPLOY.md`**

```bash
# Quick summary:
# 1. Push to GitHub
# 2. Create 2 services in Render (backend + frontend)
# 3. Set environment variables
# 4. Deploy with one click
```

### Option 2: cPanel (Traditional Hosting)
✅ Full control  
✅ Works with existing MySQL  
✅ No auto-scaling needed  
📖 See: **`CPANEL_DEPLOY.md`**

```bash
# Quick summary:
# 1. SSH into server
# 2. Clone repo via Git SSH
# 3. Configure .env
# 4. Run migrations
# 5. Use PM2 for process management
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- MySQL 5.7+ (via XAMPP, local, or Docker)
- npm (comes with Node.js)

### Quick Start

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run migrate    # Create tables
npm run seed       # Load sample data
npm run dev        # Start at http://localhost:3000
```

**Frontend:** (in new terminal)
```bash
cd frontend
npm install
npm run dev        # Start at http://localhost:5173
```

**Default Credentials:**
- Email: `manager@ancheta.com`
- Password: `password123`

---

## 📁 Project Structure

```
ancheta-apartment/
├── backend/
│   ├── server.js              # Express app
│   ├── package.json
│   ├── .env.example           # Template (copy to .env)
│   ├── config/
│   │   └── database.js        # MySQL connection
│   ├── middleware/
│   │   └── auth.js            # JWT auth
│   ├── routes/                # API endpoints
│   │   ├── auth.js
│   │   ├── tenants.js
│   │   ├── units.js
│   │   ├── payments.js
│   │   └── ...
│   └── scripts/
│       ├── migrate.js         # Database setup
│       └── seed.js            # Sample data
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Main layout with footer
│   │   │   └── Footer.jsx     # Responsive footer
│   │   ├── pages/             # Page components
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   └── contexts/
│   │       └── AuthContext.jsx
│   ├── public/
│   │   └── rental_law.pdf     # Rental Law document
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docker-compose.yml         # Docker setup (optional)
├── SETUP.md                   # Local dev guide
├── RENDER_DEPLOY.md           # Render deployment
├── CPANEL_DEPLOY.md           # cPanel deployment
└── DEPLOYMENT_CHECKLIST.md    # Pre-deploy checklist
```

---

## 🔐 Security Checklist

Before deployment:
- [ ] `.env` is in `.gitignore` (never commit)
- [ ] Change `JWT_SECRET` to a random value
- [ ] Database user has limited privileges (not root)
- [ ] HTTPS enabled (automatic on Render, manual on cPanel)
- [ ] No console.log() for sensitive data
- [ ] Input validation on all endpoints
- [ ] CORS restricted to your domain

---

## 📊 Key Features

### For Managers/Staff
- Dashboard with overview
- Unit management (create, edit, upload images/details)
- Tenant management (create, view details, edit info)
- Bill management
- User/staff management
- Maintenance request tracking

### For Tenants
- View assigned unit details
- View bills and make payments
- Request maintenance
- Update profile/password
- View payment history

### All Users
- Responsive design (mobile-friendly)
- Rental Law PDF footer link
- Secure authentication (JWT)
- Real-time data updates

---

## 🌍 Environment Variables

### Backend (`.env`)
```env
DB_HOST=localhost             # or your MySQL server
DB_NAME=ancheta_apartment
DB_USER=root
DB_PASSWORD=your_password
PORT=3000
NODE_ENV=production
JWT_SECRET=random-key-here
FRONTEND_URL=https://yourdomain.com
PAYMONGO_SECRET_KEY=sk_live_xxx (optional)
```

### Frontend (Vite auto-detects)
- API base URL configured in `frontend/src/services/api.js`
- Uses `/api` for same-domain, or environment variable for different domain

---

## 🐛 Troubleshooting

### Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Fix:** Ensure MySQL is running and credentials in `.env` are correct

### CORS errors in browser console
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Update `backend/server.js` CORS origin to match frontend URL, then redeploy

### Frontend shows 404 on page refresh
```
GET /dashboard 404 Not Found
```
**Fix:** Ensure `.htaccess` with SPA routing is in place (cPanel) or static site serving `dist/` (Render)

### PM2 process keeps crashing (cPanel)
```bash
pm2 logs ancheta-backend  # Check logs
pm2 restart ancheta-backend
```

---

## 📞 Support & Resources

- **Render Docs**: https://render.com/docs
- **Node.js Express**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **MySQL Docs**: https://dev.mysql.com/doc/

---

## 📄 License

MIT License — See LICENSE file

---

## ✅ Before You Deploy

Use the **`DEPLOYMENT_CHECKLIST.md`** to verify everything is ready.

**Missing something?** Refer to:
- Local setup → `SETUP.md`
- Render deployment → `RENDER_DEPLOY.md`
- cPanel deployment → `CPANEL_DEPLOY.md`

**Let's ship it! 🚀**
