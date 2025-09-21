# 🚀 Deployment Checklist

## Pre-Deployment Setup

### Repository Setup
- [ ] Code pushed to GitHub `main` branch
- [ ] All sensitive data removed from code
- [ ] `.env` files in `.gitignore`
- [ ] Build files in `.gitignore` (`build/`, `dist/`)

### Accounts & Services
- [ ] **GitHub Account** - Repository accessible
- [ ] **Vercel Account** - Connected to GitHub
- [ ] **Render Account** - Connected to GitHub
- [ ] **MongoDB Atlas** - Database cluster running
- [ ] **Cloudinary Account** - API credentials ready

## Frontend Deployment (Vercel)

### Vercel Project Setup
- [ ] Create new project in Vercel Dashboard
- [ ] Connect to GitHub repository
- [ ] Set Framework Preset: `Vite`
- [ ] Set Root Directory: `frontend`
- [ ] Set Build Command: `npm run build`
- [ ] Set Output Directory: `build`

### Vercel Environment Variables
```
VITE_BACKEND_URL=https://your-backend.onrender.com
```

### Vercel Domain Setup
- [ ] Configure custom domain (optional)
- [ ] Update CORS settings in backend
- [ ] Test frontend accessibility

## Backend Deployment (Render)

### Render Web Service Setup
- [ ] Create new Web Service
- [ ] Connect to GitHub repository
- [ ] Set Root Directory: `backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Set Environment: `Node`
- [ ] Set Health Check Path: `/health`

### Render Environment Variables
```
# Production Environment Variables for Render Deployment
# Copy this to .env and fill in your actual values

# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_DEBUG=false
EMAIL_LOGGER=false

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-admin-password

# App Configuration
NODE_ENV=production
PORT=8001
FRONTEND_URL=https://your-vercel-app.vercel.app
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000

# Database Name
DB_NAME=portfolio_db
```

### Database Configuration
- [ ] MongoDB Atlas cluster running
- [ ] Network Access: Allow `0.0.0.0/0` (for Render)
- [ ] Database User created with `readWrite` permissions
- [ ] Connection string tested

## GitHub Actions CI/CD Setup

### Required Secrets
Add these in GitHub Repository → Settings → Secrets and Variables → Actions:

```
# Vercel Configuration
VERCEL_TOKEN=your-vercel-token-here
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

# Render Configuration  
RENDER_SERVICE_ID=your-render-service-id
RENDER_API_KEY=your-render-api-key

# Environment URLs
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.onrender.com
VITE_BACKEND_URL=https://your-backend.onrender.com

# Database & Secrets
MONGO_URL=mongodb+srv://...
JWT_SECRET=your-jwt-secret
```

### How to Get Tokens

**Vercel Token:**
1. Go to Vercel Dashboard → Settings → Tokens
2. Create new token with appropriate scope
3. Copy token value

**Vercel Org & Project IDs:**
1. Go to project settings in Vercel
2. Find in General tab

**Render API Key:**
1. Go to Render Dashboard → Account Settings → API Keys
2. Create new API key
3. Copy key value

**Render Service ID:**
1. Go to your service dashboard
2. Copy service ID from URL

## Deployment Process

### Method 1: Automatic (Recommended)
1. Push to main branch:
   ```bash
   git add .
   git commit -m "Deploy: Ready for production"
   git push origin main
   ```

2. GitHub Actions will automatically:
   - Build and test frontend
   - Test backend startup
   - Deploy to Vercel and Render
   - Run health checks

### Method 2: Manual Deployment

**Frontend (Vercel CLI):**
```bash
npm install -g vercel
cd frontend
vercel login
vercel --prod
```

**Backend (Render):**
- Automatic on git push
- Or use "Manual Deploy" in Render Dashboard

## Post-Deployment Testing

### Health Checks
- [ ] **Frontend**: https://your-app.vercel.app loads properly
- [ ] **Backend Health**: https://your-backend.onrender.com/health returns `status: ok`
- [ ] **API Health**: https://your-backend.onrender.com/api/health returns `success: true`
- [ ] **Database**: Performance endpoint works

### Functionality Testing
- [ ] **Navigation**: All sections load properly
- [ ] **Resume Downloads**: PDFs download correctly
- [ ] **Admin Panel**: Login and upload work
- [ ] **Contact Form**: Email sending works
- [ ] **Certificates**: Display correctly
- [ ] **Projects**: Load with proper data
- [ ] **Mobile Menu**: Animations work on mobile

### Performance Testing
- [ ] **Page Load Speed**: < 3 seconds
- [ ] **API Response Time**: < 500ms average
- [ ] **Database Performance**: Check `/api/performance`
- [ ] **Build Size**: Optimized bundles
- [ ] **Core Web Vitals**: Good scores

## Production Optimization

### Database Optimization
```bash
# Run this after first deployment
curl -X POST https://your-backend.onrender.com/scripts/optimize-database
```

### Cache Management
```bash
# Clear cache if needed
curl -X POST https://your-backend.onrender.com/api/admin/cache/clear \\
  -H "Content-Type: application/json" \\
  -d '{"type": "all"}'
```

### Performance Monitoring
```bash
# Check performance metrics
curl https://your-backend.onrender.com/api/performance | jq
```

## Troubleshooting

### Build Failures
- [ ] Check GitHub Actions logs
- [ ] Verify all environment variables set
- [ ] Test build locally: `npm run build`
- [ ] Check Node.js version compatibility

### API Connection Issues  
- [ ] Verify `VITE_BACKEND_URL` in Vercel
- [ ] Check CORS configuration
- [ ] Test backend directly
- [ ] Verify network connectivity

### Database Issues
- [ ] Check MongoDB Atlas network access
- [ ] Verify connection string format
- [ ] Test connection locally
- [ ] Check user permissions

### Performance Issues
- [ ] Run database optimization
- [ ] Check `/api/performance` metrics
- [ ] Monitor response times
- [ ] Check resource usage

## Security Checklist

- [ ] **Environment Variables**: No secrets in code
- [ ] **Database Security**: User has minimal permissions
- [ ] **CORS**: Properly configured for your domains
- [ ] **HTTPS**: Enforced on all endpoints
- [ ] **JWT Secret**: Strong and unique
- [ ] **Admin Credentials**: Secure and not default
- [ ] **Rate Limiting**: Enabled and tested
- [ ] **Input Validation**: Implemented

## Maintenance

### Regular Tasks
- [ ] **Monitor Performance**: Check metrics weekly
- [ ] **Database Maintenance**: Run optimization monthly
- [ ] **Security Updates**: Update dependencies regularly
- [ ] **Backup Verification**: Test restore procedures
- [ ] **SSL Certificates**: Auto-renewed (Vercel/Render handle this)

### Emergency Procedures
- [ ] **Rollback Plan**: Know how to revert deployments
- [ ] **Database Backup**: Recent backup available
- [ ] **Contact Support**: Vercel/Render support channels ready
- [ ] **Health Monitoring**: Alerts configured

---

## ✅ Deployment Complete!

Once all items are checked, your portfolio will be:
- 🚀 **Live on Production**: Vercel + Render
- ⚡ **High Performance**: Optimized builds and database
- 🔒 **Secure**: Environment variables and CORS configured
- 📊 **Monitored**: Health checks and performance metrics
- 🔄 **Auto-Deployed**: CI/CD pipeline active

**Next Steps**: Monitor performance and iterate based on user feedback!