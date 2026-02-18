# Pre-Deployment Checklist

Use this checklist before deploying to **Render** or **cPanel**.

---

## ✅ Local Testing

- [ ] Backend runs locally: `npm run dev` from `backend/`
- [ ] Frontend runs locally: `npm run dev` from `frontend/`
- [ ] Database migrations work: `npm run migrate` from `backend/`
- [ ] Seeding works: `npm run seed` from `backend/`
- [ ] Login works with default account
- [ ] API endpoints respond (hit `/api/health`)
- [ ] Frontend connects to backend API
- [ ] All pages load without errors
- [ ] Footer displays with Rental Law PDF link
- [ ] Footer is responsive (test mobile/tablet views)
- [ ] CORS errors do not appear in browser console

---

## ✅ Code Quality & Security

- [ ] `.env` files are in `.gitignore` (never committed)
- [ ] No hardcoded API keys or secrets in code
- [ ] No console.log() statements left for sensitive data
- [ ] JWT_SECRET is set to a random value (not default)
- [ ] Error messages don't expose internal details in production
- [ ] Input validation on all API endpoints
- [ ] SQL injection prevention (using parameterized queries ✓)
- [ ] Password hashing enabled (bcryptjs ✓)
- [ ] No SQL passwords in repo history

---

## ✅ Database Preparation

- [ ] Database backup created locally
- [ ] Database migration script tested locally
- [ ] All required tables exist: `users`, `units`, `bills`, `payments`, `maintenance_requests`
- [ ] Foreign keys properly configured
- [ ] Indexes created for performance
- [ ] Default admin/manager account has secure password

---

## ✅ Backend Configuration

### Code

- [ ] `backend/server.js` health check endpoint working
- [ ] CORS configured for production domain(s)
- [ ] Database connection string uses environment variables
- [ ] Error handling middleware in place
- [ ] Routes properly organized
- [ ] Authentication middleware working
- [ ] All dependencies in `package.json` (no hardcoded vendor paths)
- [ ] `npm run migrate` script works standalone
- [ ] `npm run seed` script includes password hashing

### Environment Variables

- [ ] `.env.example` created with all required variables
- [ ] `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` documented
- [ ] `JWT_SECRET` set to unique secure value
- [ ] `NODE_ENV=production` ready
- [ ] `FRONTEND_URL` will be correct in production
- [ ] `PAYMONGO_SECRET_KEY` (or empty if unused)

### Deployment Ready

- [ ] `package.json` has `"start": "node server.js"` script
- [ ] `package.json` has `"migrate": "node scripts/migrate.js"` script
- [ ] No `nodemon` in production dependencies (only in devDependencies)
- [ ] `npm install --production` installs only runtime deps

---

## ✅ Frontend Configuration

### Code

- [ ] API base URL uses environment variable or detects production
- [ ] All routes work (SPA routing configured)
- [ ] Images load correctly
- [ ] Footer displays properly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] No console.log() for sensitive info
- [ ] Build completes without warnings: `npm run build`

### Build & Deployment

- [ ] `dist/` folder generated and contains `index.html`
- [ ] All static assets in `public/` folder
- [ ] PDF file (`rental_law.pdf`) in `public/`
- [ ] `vite.config.js` configured correctly
- [ ] `npm run build` produces optimized output
- [ ] No absolute paths (use relative for assets)

### Environment Variables

- [ ] `VITE_API_BASE_URL` or similar points to backend API
- [ ] `.env.local` NOT committed to git
- [ ] `.example` environment file created

---

## ✅ Git Repository

- [ ] Repository is clean: `git status` shows no uncommitted changes
- [ ] `.gitignore` includes: `.env`, `dist/`, `node_modules/`, `.env.*`
- [ ] All necessary files committed (`backend/`, `frontend/`, `docker-compose.yml`, migration scripts)
- [ ] Latest changes pushed to GitHub: `git push origin main`
- [ ] No sensitive data in commit history
- [ ] Repository is public (or configured for deployment service access)

---

## ✅ Render Deployment Steps

- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Backend service created with:
  - [ ] Correct GitHub repo selected
  - [ ] Build command: `cd backend && npm install && npm run migrate`
  - [ ] Start command: `cd backend && npm start`
  - [ ] Environment variables set (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, etc.)
- [ ] Frontend service created with:
  - [ ] Correct GitHub repo selected
  - [ ] Root directory: `frontend`
  - [ ] Build command: `npm install && npm run build`
  - [ ] Publish directory: `dist`
- [ ] Services deployed and health checks passing
- [ ] Backend `/api/health` endpoint responds
- [ ] Frontend loads without 404 errors
- [ ] Frontend can reach backend API

---

## ✅ cPanel Deployment Steps

- [ ] SSH access to server verified
- [ ] Node.js installed on cPanel server
- [ ] GitHub SSH keys configured
- [ ] Repository cloned to `public_html/ancheta-apartment`
- [ ] Backend `.env` created with cPanel database credentials
- [ ] `npm install --production` completed in `backend/`
- [ ] `npm run migrate` executed successfully
- [ ] PM2 installed: `npm install -g pm2`
- [ ] Backend started with PM2: `pm2 start server.js`
- [ ] PM2 configured for auto-restart: `pm2 startup` and `pm2 save`
- [ ] Frontend built: `npm run build` (produces `frontend/dist/`)
- [ ] Frontend files copied to `public_html/`
- [ ] `.htaccess` SPA routing rules added
- [ ] SSL certificate installed (AutoSSL)
- [ ] CORS configured for cPanel domain
- [ ] Backend accessible and connected
- [ ] Database backups enabled

---

## ✅ Post-Deployment Testing

### Backend

- [ ] Health endpoint works: `curl https://yourdomain.com/api/health`
- [ ] Database connection established
- [ ] Login endpoint responds
- [ ] Create user/tenant endpoint works
- [ ] Payment endpoints accessible
- [ ] All CRUD operations function

### Frontend

- [ ] Landing page loads (redirects to dashboard)
- [ ] Login page accessible
- [ ] Dashboard displays data
- [ ] Navigation works
- [ ] Forms submit successfully
- [ ] Footer displays and PDF link works
- [ ] Mobile view is responsive
- [ ] Page refresh maintains state (no 404s)

### Integration

- [ ] Frontend communicates with backend API
- [ ] CORS issues resolved
- [ ] Errors display user-friendly messages
- [ ] Authentication tokens working
- [ ] Session management working

---

## ✅ Monitoring & Maintenance

- [ ] Error logging configured
- [ ] Database backups scheduled (cPanel)
- [ ] PM2 logs monitored (cPanel): `pm2 logs`
- [ ] Render logs reviewed (Render)
- [ ] Performance acceptable
- [ ] No memory leaks or crash loops
- [ ] SSL certificate auto-renewal configured
- [ ] Uptime monitoring set up (optional)

---

## ✅ Security Final Check

- [ ] No `.env` files visible publicly
- [ ] Database user has least privilege (not root if possible)
- [ ] JWT secret is secure and unique
- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] CORS restrictive to production domains
- [ ] Rate limiting considered (for scale-up)
- [ ] Input sanitization implemented
- [ ] API keys (PayMongo) stored securely

---

## 📋 Keep These Documents

- [ ] `README.md` — Project overview
- [ ] `SETUP.md` — Local development
- [ ] `RENDER_DEPLOY.md` — Render deployment
- [ ] `CPANEL_DEPLOY.md` — cPanel deployment

---

## 🚀 Ready to Deploy?

If all checkboxes are checked, your application is ready for production!

**For issues, refer to:**
- `RENDER_DEPLOY.md` (Render troubleshooting)
- `CPANEL_DEPLOY.md` (cPanel troubleshooting)
- Backend logs: `pm2 logs` (cPanel) or Render dashboard
- Frontend console (browser dev tools)
