# Backend Deployment Guide

## Overview

This guide covers deploying the FEMbalance Node.js/Express.js backend API to various hosting platforms. The backend provides REST APIs for cycle tracking, symptom logging, PCOS assessment, and user management.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB database (local or cloud)
- npm or yarn package manager
- Git access to the repository
- Access to chosen deployment platform

## Environment Configuration

### Required Environment Variables

Create a production environment file:

```bash
# Create .env.production in the backend directory
cd backend
cp .env.example .env.production
```

**Production Environment Variables:**
```env
# Application Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fembalance_prod?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://admin.your-domain.com

# External API Integration
ML_API_URL=https://your-ml-api-domain.com/api/v1
ML_API_KEY=your-ml-api-key

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@fembalance.com
EMAIL_PASS=your-app-password
EMAIL_FROM=FEMbalance <noreply@fembalance.com>

# Redis Configuration (Optional - for rate limiting)
REDIS_URL=redis://username:password@redis-host:6379

# Monitoring and Logging
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn

# File Upload (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=fembalance-uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment-Specific Configurations

**Development:**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fembalance_dev
FRONTEND_URL=http://localhost:3000
ML_API_URL=http://localhost:8000/api/v1
LOG_LEVEL=debug
```

**Staging:**
```env
NODE_ENV=staging
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fembalance_staging
FRONTEND_URL=https://staging.fembalance.com
ML_API_URL=https://ml-staging.fembalance.com/api/v1
LOG_LEVEL=info
```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Cluster:**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Configure network access (whitelist deployment IPs)
   - Create database user with read/write permissions

2. **Connection String:**
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
   ```

3. **Database Initialization:**
   ```bash
   # Run database migrations/seeding
   cd backend
   npm run db:migrate
   npm run db:seed  # Optional: seed with sample data
   ```

### Self-Hosted MongoDB

```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# CentOS/RHEL
sudo yum install mongodb-server

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
> use fembalance_prod
> db.createUser({
    user: "fembalance",
    pwd: "secure-password",
    roles: [{ role: "readWrite", db: "fembalance_prod" }]
  })
```

## Deployment Platforms

### Heroku Deployment

**1. Heroku Setup:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create fembalance-api-prod

# Set buildpack
heroku buildpacks:set heroku/nodejs
```

**2. Environment Variables:**
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/fembalance_prod"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
heroku config:set ML_API_URL="https://your-ml-api-domain.com/api/v1"

# View all config vars
heroku config
```

**3. Deployment:**
```bash
# Deploy from backend directory
cd backend
git init
git add .
git commit -m "Initial backend deployment"

# Add Heroku remote
heroku git:remote -a fembalance-api-prod

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

**4. Heroku Configuration Files:**

```json
// package.json - ensure start script exists
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

```
# Procfile (create in backend root)
web: npm start
```

### AWS EC2 Deployment

**1. EC2 Instance Setup:**
```bash
# Launch EC2 instance (Ubuntu 20.04 LTS recommended)
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx
```

**2. Application Deployment:**
```bash
# Clone repository
git clone https://github.com/your-username/fembalance.git
cd fembalance/backend

# Install dependencies
npm install --production

# Create environment file
sudo nano .env.production
# Add all production environment variables

# Start application with PM2
pm2 start src/app.js --name "fembalance-api" --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

**3. Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/fembalance-api
server {
    listen 80;
    server_name api.fembalance.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fembalance-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.fembalance.com
```

**4. PM2 Ecosystem File:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'fembalance-api',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};

# Deploy with ecosystem file
pm2 start ecosystem.config.js --env production
```

### DigitalOcean App Platform

**1. App Configuration:**
```yaml
# .do/app.yaml
name: fembalance-api
services:
- name: api
  source_dir: /backend
  github:
    repo: your-username/fembalance
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${MONGODB_URI}
  - key: JWT_SECRET
    value: ${JWT_SECRET}
  - key: FRONTEND_URL
    value: ${FRONTEND_URL}
```

**2. Deployment:**
```bash
# Install doctl CLI
# Deploy using App Platform dashboard or CLI
doctl apps create --spec .do/app.yaml
```

### Docker Deployment

**1. Dockerfile:**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

**2. Docker Compose:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - mongodb
    restart: unless-stopped
    volumes:
      - ./backend/logs:/usr/src/app/logs

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=fembalance_prod
    volumes:
      - mongodb_data:/data/db
      - ./backend/scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
```

**3. Deploy with Docker:**
```bash
# Build and run
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Kubernetes Deployment

**1. Deployment Configuration:**
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fembalance-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fembalance-backend
  template:
    metadata:
      labels:
        app: fembalance-backend
    spec:
      containers:
      - name: backend
        image: fembalance/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: fembalance-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: fembalance-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

**2. Service Configuration:**
```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: fembalance-backend-service
spec:
  selector:
    app: fembalance-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: LoadBalancer
```

**3. Deploy to Kubernetes:**
```bash
# Apply configurations
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/fembalance-backend
```

## Security Considerations

### 1. Environment Variables Security
```bash
# Use secrets management
# AWS Secrets Manager
aws secretsmanager create-secret --name "fembalance/prod/jwt-secret" --secret-string "your-jwt-secret"

# Kubernetes Secrets
kubectl create secret generic fembalance-secrets \
  --from-literal=mongodb-uri="mongodb+srv://..." \
  --from-literal=jwt-secret="your-jwt-secret"
```

### 2. Network Security
```bash
# Configure firewall (UFW on Ubuntu)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Restrict MongoDB access
# Only allow backend server IPs in MongoDB Atlas network access
```

### 3. SSL/TLS Configuration
```bash
# Let's Encrypt SSL certificate
sudo certbot --nginx -d api.fembalance.com

# Or use CloudFlare for SSL termination
# Configure CloudFlare proxy for your domain
```

### 4. Rate Limiting and DDoS Protection
```javascript
// Implement in middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

module.exports = limiter;
```

## Monitoring and Logging

### 1. Application Monitoring
```javascript
// Install monitoring packages
npm install @sentry/node @sentry/tracing

// Configure in src/app.js
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});
```

### 2. Health Check Endpoint
```javascript
// Add to routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});
```

### 3. Logging Configuration
```javascript
// Configure Winston logger
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 4. Database Monitoring
```javascript
// MongoDB connection monitoring
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
```

## Performance Optimization

### 1. Database Optimization
```javascript
// Add database indexes
// In your models or migration scripts
db.users.createIndex({ email: 1 }, { unique: true });
db.cycles.createIndex({ userId: 1, startDate: -1 });
db.symptoms.createIndex({ userId: 1, date: -1 });
db.pcosassessments.createIndex({ userId: 1, createdAt: -1 });
```

### 2. Caching Strategy
```javascript
// Install Redis for caching
npm install redis

// Configure Redis caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

### 3. Connection Pooling
```javascript
// MongoDB connection pooling
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0 // Disable mongoose buffering
});
```

## Backup and Recovery

### 1. Database Backup
```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="fembalance_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --uri="$MONGODB_URI" --db=$DB_NAME --out=$BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://fembalance-backups/mongodb/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

### 2. Automated Backup with Cron
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### 3. Recovery Process
```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" --db=fembalance_prod /path/to/backup/fembalance_prod
```

## CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run tests
        run: cd backend && npm test
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/fembalance_test
          JWT_SECRET: test-secret
      
      - name: Run linting
        run: cd backend && npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "fembalance-api-prod"
          heroku_email: "your-email@example.com"
          appdir: "backend"
          
      - name: Run database migrations
        run: |
          heroku run npm run db:migrate --app fembalance-api-prod
        env:
          HEROKU_API_KEY: ${{secrets.HEROKU_API_KEY}}
```

## Troubleshooting

### Common Issues

**1. Database Connection Issues:**
```bash
# Check MongoDB connection
mongo "mongodb+srv://cluster.mongodb.net/test" --username username

# Test connection in Node.js
node -e "
const mongoose = require('mongoose');
mongoose.connect('$MONGODB_URI')
  .then(() => console.log('Connected successfully'))
  .catch(err => console.error('Connection failed:', err));
"
```

**2. Environment Variable Issues:**
```bash
# Check if environment variables are loaded
node -e "console.log(process.env.NODE_ENV, process.env.MONGODB_URI)"

# Verify .env file location and format
cat .env.production
```

**3. Port and Process Issues:**
```bash
# Check if port is in use
lsof -i :3001

# Kill process using port
kill -9 $(lsof -t -i:3001)

# Check PM2 processes
pm2 list
pm2 logs fembalance-api
```

**4. SSL Certificate Issues:**
```bash
# Check SSL certificate
openssl s_client -connect api.fembalance.com:443

# Renew Let's Encrypt certificate
sudo certbot renew
```

### Health Monitoring
```bash
# Check application health
curl https://api.fembalance.com/api/health

# Monitor server resources
htop
df -h
free -m

# Check logs
tail -f /var/log/nginx/error.log
pm2 logs fembalance-api --lines 100
```

This comprehensive guide covers all aspects of deploying the FEMbalance backend API across different platforms and environments, ensuring scalability, security, and reliability.