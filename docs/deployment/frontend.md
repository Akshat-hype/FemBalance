# Frontend Deployment Guide

## Overview

This guide covers deploying the FEMbalance React.js frontend application to various hosting platforms. The frontend is a single-page application (SPA) built with React.js and Tailwind CSS.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git access to the repository
- Access to chosen deployment platform

## Build Process

### 1. Environment Configuration

Create a production environment file:

```bash
# Create .env.production in the frontend directory
cd frontend
cp .env.example .env.production
```

**Required Environment Variables:**
```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_ML_API_URL=https://your-ml-api-domain.com/api/v1

# Optional: Analytics and Monitoring
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
REACT_APP_SENTRY_DSN=https://your-sentry-dsn

# Optional: Feature Flags
REACT_APP_ENABLE_PCOS_ASSESSMENT=true
REACT_APP_ENABLE_ML_PREDICTIONS=true
```

### 2. Build the Application

```bash
cd frontend

# Install dependencies
npm install

# Run tests (optional but recommended)
npm test -- --coverage --watchAll=false

# Build for production
npm run build
```

The build process creates an optimized production build in the `build/` directory.

### 3. Build Optimization

The production build includes:
- Minified JavaScript and CSS
- Optimized images and assets
- Service worker for caching (if enabled)
- Source maps for debugging

## Deployment Platforms

### Netlify Deployment

**Method 1: Git Integration (Recommended)**

1. **Connect Repository:**
   ```bash
   # Push your code to GitHub/GitLab
   git push origin main
   ```

2. **Netlify Configuration:**
   - Log in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Configure build settings:
     - **Build command:** `cd frontend && npm run build`
     - **Publish directory:** `frontend/build`
     - **Base directory:** `frontend`

3. **Environment Variables:**
   - Go to Site settings → Environment variables
   - Add all required environment variables

4. **Deploy Settings:**
   ```toml
   # netlify.toml (place in repository root)
   [build]
     base = "frontend"
     command = "npm run build"
     publish = "build"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

**Method 2: Manual Deployment**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the application
cd frontend
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

### Vercel Deployment

**Method 1: Git Integration**

1. **Connect Repository:**
   - Log in to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Project Configuration:**
   - **Framework Preset:** React
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

3. **Environment Variables:**
   - Add environment variables in project settings

4. **Vercel Configuration:**
   ```json
   {
     "version": 2,
     "name": "fembalance-frontend",
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

**Method 2: CLI Deployment**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

### AWS S3 + CloudFront

**1. Create S3 Bucket:**

```bash
# Create S3 bucket
aws s3 mb s3://fembalance-frontend-prod

# Configure bucket for static website hosting
aws s3 website s3://fembalance-frontend-prod \
  --index-document index.html \
  --error-document index.html
```

**2. Build and Upload:**

```bash
# Build the application
cd frontend
npm run build

# Upload to S3
aws s3 sync build/ s3://fembalance-frontend-prod --delete

# Set public read permissions
aws s3api put-bucket-policy --bucket fembalance-frontend-prod --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fembalance-frontend-prod/*"
    }
  ]
}'
```

**3. CloudFront Distribution:**

```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "fembalance-frontend-'$(date +%s)'",
  "Comment": "FEMbalance Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-fembalance-frontend-prod",
        "DomainName": "fembalance-frontend-prod.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-fembalance-frontend-prod",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}'
```

### Docker Deployment

**1. Create Dockerfile:**

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**2. Create Nginx Configuration:**

```nginx
# frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

**3. Build and Run:**

```bash
# Build Docker image
cd frontend
docker build -t fembalance-frontend .

# Run container
docker run -p 3000:80 fembalance-frontend

# Or use docker-compose
docker-compose up frontend
```

## Environment-Specific Configurations

### Development
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ML_API_URL=http://localhost:8000/api/v1
REACT_APP_ENABLE_DEBUG=true
```

### Staging
```env
REACT_APP_API_URL=https://api-staging.fembalance.com/api
REACT_APP_ML_API_URL=https://ml-staging.fembalance.com/api/v1
REACT_APP_ENABLE_DEBUG=false
```

### Production
```env
REACT_APP_API_URL=https://api.fembalance.com/api
REACT_APP_ML_API_URL=https://ml.fembalance.com/api/v1
REACT_APP_ENABLE_DEBUG=false
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

## Performance Optimization

### 1. Bundle Analysis

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### 2. Code Splitting

The application uses React.lazy() for route-based code splitting:

```javascript
// Implemented in src/App.js
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CycleTracking = lazy(() => import('./pages/CycleTracking'));
```

### 3. Asset Optimization

- Images are optimized during build
- CSS is minified and purged of unused styles
- JavaScript is minified and tree-shaken

### 4. Caching Strategy

```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Don't cache HTML files
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## Security Considerations

### 1. Content Security Policy

```html
<!-- Add to public/index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.google-analytics.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.fembalance.com https://ml.fembalance.com;">
```

### 2. Environment Variable Security

- Never expose sensitive keys in frontend environment variables
- Use REACT_APP_ prefix for public environment variables only
- Validate all environment variables at build time

### 3. HTTPS Configuration

Ensure all deployments use HTTPS:
- Netlify/Vercel: Automatic HTTPS
- AWS CloudFront: Enable HTTPS redirect
- Custom servers: Configure SSL certificates

## Monitoring and Analytics

### 1. Error Tracking

```javascript
// Install Sentry
npm install @sentry/react

// Configure in src/index.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Performance Monitoring

```javascript
// Web Vitals tracking
npm install web-vitals

// Add to src/index.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. Google Analytics

```javascript
// Install Google Analytics
npm install gtag

// Configure in src/App.js
import { gtag } from 'gtag';

gtag('config', process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
```

## Troubleshooting

### Common Issues

**1. Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be v16+
```

**2. Environment Variables Not Loading:**
```bash
# Ensure variables start with REACT_APP_
# Check .env file is in correct location
# Restart development server after changes
```

**3. Routing Issues in Production:**
```bash
# Ensure server redirects all routes to index.html
# Check _redirects file for Netlify
# Verify nginx configuration for custom servers
```

**4. API Connection Issues:**
```bash
# Check CORS configuration on backend
# Verify API URLs in environment variables
# Check network tab in browser dev tools
```

### Health Checks

```bash
# Test build locally
npm run build
npx serve -s build

# Check bundle size
npm run build -- --analyze

# Test with different environments
NODE_ENV=production npm run build
```

## Rollback Strategy

### 1. Git-based Deployments
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### 2. Manual Deployments
```bash
# Keep previous build
mv build build-backup
# Deploy previous version
# Restore if needed
mv build-backup build
```

### 3. Platform-specific Rollbacks
- **Netlify:** Use deployment history in dashboard
- **Vercel:** Use deployment history in dashboard  
- **AWS:** Update S3 objects and invalidate CloudFront

## Automation

### GitHub Actions Example

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ['frontend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run tests
        run: cd frontend && npm test -- --coverage --watchAll=false
      
      - name: Build application
        run: cd frontend && npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
          REACT_APP_ML_API_URL: ${{ secrets.REACT_APP_ML_API_URL }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=frontend/build
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

This comprehensive guide covers all aspects of deploying the FEMbalance frontend application across different platforms and environments.