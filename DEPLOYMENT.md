# Deployment Guide

This document outlines the deployment process for the Naveen Portfolio project using Vercel (frontend) and Render (backend).

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Render.com    │    │  MongoDB Atlas  │
│   (Frontend)    │───▶│   (Backend)     │───▶│   (Database)    │
│   - Vite Build  │    │   - Node.js API │    │   - Production  │
│   - Static CDN  │    │   - Auto Deploy │    │   - Optimized   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository** - Code pushed to main branch
2. **Vercel Account** - Connected to your GitHub
3. **Render Account** - Connected to your GitHub  
4. **MongoDB Atlas** - Database cluster running
5. **Environment Variables** - All secrets configured

## Frontend Deployment (Vercel)

### Manual Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and connect project
   vercel login
   vercel link
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `VITE_BACKEND_URL` = `https://your-backend.onrender.com`

3. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   ```

### Automatic Deployment

- Push to `main` branch triggers auto-deployment
- Vercel builds using `npm run build`
- Static files served via global CDN

## Backend Deployment (Render)

### Manual Deployment

1. **Create Web Service**
   - Go to Render Dashboard → New → Web Service
   - Connect GitHub repository
   - Select `backend` folder as root directory

2. **Configure Build Settings**
   ```
   Build Command: npm install
   Start Command: npm start
   Environment: Node
   Region: Oregon (or closest to you)
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=8001
   MONGO_URL=mongodb+srv://...
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=your-cloud
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=secure-password
   ```

### Health Checks

Render monitors: `https://your-backend.onrender.com/health`

## Database Setup (MongoDB Atlas)

### Connection Configuration

1. **Network Access**
   - Add `0.0.0.0/0` to IP Whitelist (for Render)
   - Enable connection from anywhere

2. **Database User**
   - Create user with `readWrite` permissions
   - Use strong password

3. **Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/portfolio_db?retryWrites=true&w=majority
   ```

### Database Optimization

Run optimization script after deployment:
```bash
node scripts/optimizeDatabase.js
```

## Environment Variables Setup

### Required Secrets for GitHub Actions

Add these to GitHub Repository → Settings → Secrets:

```
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id  
VERCEL_PROJECT_ID=your-project-id

# Render
RENDER_SERVICE_ID=your-service-id
RENDER_API_KEY=your-api-key

# URLs for health checks
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.onrender.com
VITE_BACKEND_URL=https://your-backend.onrender.com

# Database
MONGO_URL=mongodb+srv://...
```

### Frontend Environment Variables

**Vercel Dashboard:**
- `VITE_BACKEND_URL` → Backend URL

**Local Development:**
- Copy `.env.local.example` → `.env.local`
- Set `VITE_BACKEND_URL=http://localhost:8001`

### Backend Environment Variables

**Render Dashboard:**
- All variables from `.env.production.example`

**Local Development:**
- Copy `.env.production.example` → `.env`
- Fill in your actual values

## Deployment Process

### Automated (Recommended)

1. **Push to main branch**
   ```bash
   git add .
   git commit -m "Deploy: Your changes"
   git push origin main
   ```

2. **GitHub Actions will:**
   - Test frontend build
   - Test backend startup
   - Deploy to Vercel (frontend)
   - Deploy to Render (backend)
   - Run health checks

### Manual Deployment

**Frontend:**
```bash
cd frontend
npm run build
vercel --prod
```

**Backend:**
- Push triggers auto-deployment on Render
- Or use Render Dashboard → Manual Deploy

## Monitoring & Maintenance

### Health Checks

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com/health`
- **API**: `https://your-backend.onrender.com/api/health`
- **Performance**: `https://your-backend.onrender.com/api/performance`

### Database Maintenance

**Performance Monitoring:**
```bash
curl https://your-backend.onrender.com/api/performance
```

**Re-run Optimizations:**
```bash
node scripts/optimizeDatabase.js
```

### Cache Management

**Clear API Cache:**
```bash
curl -X POST https://your-backend.onrender.com/api/admin/cache/clear \\
  -H "Content-Type: application/json" \\
  -d '{"type": "all"}'
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify Node.js version compatibility
   - Check build logs in Vercel/Render dashboard

2. **API Connection Issues**
   - Verify CORS settings in backend
   - Check `VITE_BACKEND_URL` is correct
   - Ensure backend is deployed and healthy

3. **Database Connection**
   - Check MongoDB Atlas network access
   - Verify connection string format
   - Ensure user has proper permissions

4. **Performance Issues**
   - Run database optimization script
   - Check `/api/performance` endpoint
   - Monitor response times

### Debug Commands

**Test Backend Locally:**
```bash
cd backend
npm start
curl http://localhost:8001/health
```

**Test Frontend Build:**
```bash
cd frontend
npm run build
npm run preview
```

**Check Database Connection:**
```bash
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));
"
```

## Performance Optimization

### Frontend (Vercel)

- ✅ Vite build optimization
- ✅ Static asset caching
- ✅ Global CDN distribution
- ✅ Automatic compression

### Backend (Render)

- ✅ Database indexing (25 indexes)
- ✅ Connection pooling  
- ✅ Response time monitoring
- ✅ Performance metrics API

### Database (MongoDB Atlas)

- ✅ Optimized queries with indexes
- ✅ Connection string optimization
- ✅ Performance monitoring
- ✅ Automatic scaling

## Security Checklist

- [ ] Environment variables secured
- [ ] Database user has minimal permissions
- [ ] CORS properly configured
- [ ] JWT secret is strong and unique
- [ ] Admin credentials are secure
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting enabled
- [ ] Input validation implemented

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Vercel/Render deployment logs  
3. Test API endpoints manually
4. Check database connectivity
5. Monitor performance metrics

---

**Deployment Status**: ✅ Ready for Production