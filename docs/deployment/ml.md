# ML API Deployment Guide

## Overview

This guide covers deploying the FEMbalance Python ML API built with FastAPI. The ML service provides PCOS risk assessment, cycle predictions, and symptom analysis using machine learning models.

## Prerequisites

- Python 3.8 or higher
- pip package manager
- Git access to the repository
- Access to chosen deployment platform
- Trained ML models (stored in ml/models/ directory)

## Environment Configuration

### Required Environment Variables

Create a production environment file:

```bash
# Create .env.production in the ml directory
cd ml
cp .env.example .env.production
```

**Production Environment Variables:**
```env
# Application Configuration
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0
DEBUG=false

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://api.your-domain.com
ALLOWED_METHODS=GET,POST,PUT,DELETE
ALLOWED_HEADERS=*

# Model Configuration
MODEL_PATH=/app/models
PCOS_MODEL_VERSION=v2.1.0
CYCLE_MODEL_VERSION=v1.3.0
SYMPTOM_MODEL_VERSION=v1.1.0

# Database Configuration (if using model versioning)
DATABASE_URL=postgresql://user:password@host:5432/ml_models

# Monitoring and Logging
LOG_LEVEL=INFO
SENTRY_DSN=https://your-sentry-dsn

# Performance Configuration
MAX_WORKERS=4
WORKER_TIMEOUT=30
KEEP_ALIVE=2

# Security
API_KEY_REQUIRED=true
VALID_API_KEYS=key1,key2,key3

# External Services
BACKEND_API_URL=https://api.your-domain.com
BACKEND_API_KEY=your-backend-api-key
```
### Environment-Specific Configurations

**Development:**
```env
ENVIRONMENT=development
PORT=8000
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=DEBUG
API_KEY_REQUIRED=false
```

**Staging:**
```env
ENVIRONMENT=staging
PORT=8000
ALLOWED_ORIGINS=https://staging.fembalance.com,https://api-staging.fembalance.com
LOG_LEVEL=INFO
API_KEY_REQUIRED=true
```

## Model Management

### Model Storage Structure
```
ml/
├── models/
│   ├── pcos/
│   │   ├── v2.1.0/
│   │   │   ├── model.pkl
│   │   │   ├── scaler.pkl
│   │   │   └── metadata.json
│   │   └── latest -> v2.1.0
│   ├── cycle_prediction/
│   │   ├── v1.3.0/
│   │   │   ├── model.pkl
│   │   │   └── metadata.json
│   │   └── latest -> v1.3.0
│   └── symptom_analysis/
│       ├── v1.1.0/
│       │   ├── model.pkl
│       │   └── metadata.json
│       └── latest -> v1.1.0
```

### Model Versioning
```python
# Model metadata example (metadata.json)
{
  "version": "v2.1.0",
  "created_at": "2023-12-01T10:00:00Z",
  "accuracy": 0.89,
  "precision": 0.87,
  "recall": 0.91,
  "f1_score": 0.89,
  "training_data_size": 10000,
  "features": [
    "irregular_periods",
    "excess_hair_growth",
    "acne",
    "weight_gain"
  ],
  "model_type": "RandomForestClassifier",
  "hyperparameters": {
    "n_estimators": 100,
    "max_depth": 10,
    "random_state": 42
  }
}
```

## Deployment Platforms

### Heroku Deployment

**1. Heroku Setup:**
```bash
# Install Heroku CLI
pip install heroku3

# Login to Heroku
heroku login

# Create Heroku app
heroku create fembalance-ml-prod

# Set Python buildpack
heroku buildpacks:set heroku/python
```

**2. Requirements and Configuration:**
```txt
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
scikit-learn==1.3.2
pandas==2.1.3
numpy==1.24.3
pydantic==2.5.0
python-multipart==0.0.6
python-dotenv==1.0.0
sentry-sdk[fastapi]==1.38.0
prometheus-client==0.19.0
```

```
# Procfile
web: uvicorn src.api.app:app --host 0.0.0.0 --port $PORT --workers 4
```

**3. Environment Variables:**
```bash
# Set environment variables
heroku config:set ENVIRONMENT=production
heroku config:set ALLOWED_ORIGINS="https://your-frontend-domain.com"
heroku config:set MODEL_PATH="/app/models"
heroku config:set LOG_LEVEL=INFO
```

**4. Deploy:**
```bash
# Deploy from ml directory
cd ml
git init
git add .
git commit -m "Initial ML API deployment"

# Add Heroku remote
heroku git:remote -a fembalance-ml-prod

# Deploy
git push heroku main
```

### AWS EC2 Deployment

**1. EC2 Instance Setup:**
```bash
# Launch EC2 instance (Ubuntu 20.04 LTS)
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.8+
sudo apt install python3.8 python3.8-venv python3-pip

# Install system dependencies
sudo apt install build-essential python3-dev
```

**2. Application Setup:**
```bash
# Clone repository
git clone https://github.com/your-username/fembalance.git
cd fembalance/ml

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
nano .env.production
# Add all production environment variables

# Install Gunicorn for production
pip install gunicorn
```

**3. Systemd Service:**
```ini
# /etc/systemd/system/fembalance-ml.service
[Unit]
Description=FEMbalance ML API
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/fembalance/ml
Environment=PATH=/home/ubuntu/fembalance/ml/venv/bin
EnvironmentFile=/home/ubuntu/fembalance/ml/.env.production
ExecStart=/home/ubuntu/fembalance/ml/venv/bin/gunicorn src.api.app:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable fembalance-ml
sudo systemctl start fembalance-ml
sudo systemctl status fembalance-ml
```

**4. Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/fembalance-ml
server {
    listen 80;
    server_name ml.fembalance.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for ML processing
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

### Google Cloud Platform (Cloud Run)

**1. Dockerfile:**
```dockerfile
# ml/Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "src.api.app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**2. Cloud Run Deployment:**
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Build and push to Container Registry
cd ml
gcloud builds submit --tag gcr.io/your-project-id/fembalance-ml

# Deploy to Cloud Run
gcloud run deploy fembalance-ml \
  --image gcr.io/your-project-id/fembalance-ml \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars ENVIRONMENT=production,LOG_LEVEL=INFO
```

### Docker Deployment

**1. Production Dockerfile:**
```dockerfile
# ml/Dockerfile.prod
FROM python:3.9-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application with Gunicorn
CMD ["gunicorn", "src.api.app:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "300"]
```

**2. Docker Compose:**
```yaml
# docker-compose.ml.yml
version: '3.8'

services:
  ml-api:
    build:
      context: ./ml
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - MODEL_PATH=/app/models
      - LOG_LEVEL=INFO
    volumes:
      - ./ml/models:/app/models:ro
      - ./ml/logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ml.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - ml-api
    restart: unless-stopped
```

### Kubernetes Deployment

**1. Deployment Configuration:**
```yaml
# k8s/ml-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fembalance-ml
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fembalance-ml
  template:
    metadata:
      labels:
        app: fembalance-ml
    spec:
      containers:
      - name: ml-api
        image: fembalance/ml-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: ENVIRONMENT
          value: "production"
        - name: ALLOWED_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: ml-config
              key: allowed-origins
        - name: MODEL_PATH
          value: "/app/models"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        volumeMounts:
        - name: models-volume
          mountPath: /app/models
          readOnly: true
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: models-volume
        persistentVolumeClaim:
          claimName: ml-models-pvc
```

## GPU Support (Optional)

### NVIDIA GPU Setup

**1. Docker with GPU Support:**
```dockerfile
# ml/Dockerfile.gpu
FROM nvidia/cuda:11.8-runtime-ubuntu20.04

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3.9 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch with CUDA support
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Copy and install requirements
COPY requirements.gpu.txt .
RUN pip install -r requirements.gpu.txt

# Copy application
COPY . /app
WORKDIR /app

# Start application
CMD ["uvicorn", "src.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**2. GPU Requirements:**
```txt
# requirements.gpu.txt
torch==2.1.0+cu118
torchvision==0.16.0+cu118
torchaudio==2.1.0+cu118
transformers==4.35.0
accelerate==0.24.0
```

**3. Run with GPU:**
```bash
# Docker run with GPU
docker run --gpus all -p 8000:8000 fembalance-ml-gpu

# Docker Compose with GPU
version: '3.8'
services:
  ml-api:
    build:
      context: ./ml
      dockerfile: Dockerfile.gpu
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

## Performance Optimization

### 1. Model Loading Optimization
```python
# Lazy model loading
import asyncio
from functools import lru_cache

@lru_cache(maxsize=None)
def load_model(model_name: str, version: str):
    """Load and cache models"""
    model_path = f"/app/models/{model_name}/{version}/model.pkl"
    return joblib.load(model_path)

# Async model prediction
async def predict_async(model_name: str, features: dict):
    loop = asyncio.get_event_loop()
    model = load_model(model_name, "latest")
    
    # Run CPU-intensive prediction in thread pool
    prediction = await loop.run_in_executor(
        None, model.predict, [list(features.values())]
    )
    return prediction[0]
```

### 2. Caching Strategy
```python
# Redis caching for predictions
import redis
import json
import hashlib

redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))

def cache_prediction(features: dict, prediction: dict, ttl: int = 3600):
    """Cache prediction results"""
    cache_key = hashlib.md5(json.dumps(features, sort_keys=True).encode()).hexdigest()
    redis_client.setex(f"prediction:{cache_key}", ttl, json.dumps(prediction))

def get_cached_prediction(features: dict):
    """Get cached prediction"""
    cache_key = hashlib.md5(json.dumps(features, sort_keys=True).encode()).hexdigest()
    cached = redis_client.get(f"prediction:{cache_key}")
    return json.loads(cached) if cached else None
```

### 3. Batch Processing
```python
# Batch prediction endpoint
@app.post("/api/v1/predict/batch")
async def batch_predict(requests: List[PredictionRequest]):
    """Process multiple predictions in batch"""
    tasks = []
    for request in requests:
        task = predict_async(request.model_name, request.features)
        tasks.append(task)
    
    results = await asyncio.gather(*tasks)
    return {"predictions": results}
```

## Monitoring and Logging

### 1. Health Check Endpoint
```python
# Health check with model status
@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    try:
        # Check model availability
        models_status = {}
        for model_name in ["pcos", "cycle_prediction", "symptom_analysis"]:
            try:
                load_model(model_name, "latest")
                models_status[model_name] = "healthy"
            except Exception as e:
                models_status[model_name] = f"error: {str(e)}"
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "models": models_status,
            "version": os.getenv("MODEL_VERSION", "unknown")
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")
```

### 2. Metrics Collection
```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, generate_latest

prediction_counter = Counter('ml_predictions_total', 'Total predictions', ['model', 'status'])
prediction_duration = Histogram('ml_prediction_duration_seconds', 'Prediction duration', ['model'])

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    if request.url.path.startswith("/api/v1/predict/"):
        model_name = request.url.path.split("/")[-1]
        status = "success" if response.status_code == 200 else "error"
        
        prediction_counter.labels(model=model_name, status=status).inc()
        prediction_duration.labels(model=model_name).observe(duration)
    
    return response

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type="text/plain")
```

### 3. Structured Logging
```python
# Structured logging configuration
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage in endpoints
@app.post("/api/v1/predict/pcos")
async def predict_pcos(request: PCOSRequest):
    logger.info("PCOS prediction request", user_id=request.user_id, features=request.features)
    
    try:
        prediction = await predict_async("pcos", request.features)
        logger.info("PCOS prediction successful", user_id=request.user_id, risk_score=prediction.risk_score)
        return prediction
    except Exception as e:
        logger.error("PCOS prediction failed", user_id=request.user_id, error=str(e))
        raise HTTPException(status_code=500, detail="Prediction failed")
```

## Security Considerations

### 1. API Key Authentication
```python
# API key middleware
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify API key"""
    valid_keys = os.getenv("VALID_API_KEYS", "").split(",")
    if credentials.credentials not in valid_keys:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return credentials.credentials

# Protected endpoint
@app.post("/api/v1/predict/pcos")
async def predict_pcos(request: PCOSRequest, api_key: str = Depends(verify_api_key)):
    # Prediction logic here
    pass
```

### 2. Input Validation
```python
# Pydantic models for validation
from pydantic import BaseModel, validator
from typing import Dict, Any

class PCOSRequest(BaseModel):
    user_id: str
    features: Dict[str, Any]
    
    @validator('features')
    def validate_features(cls, v):
        required_features = [
            'irregular_periods', 'excess_hair_growth', 'acne', 
            'weight_gain', 'hair_loss', 'dark_skin_patches'
        ]
        
        for feature in required_features:
            if feature not in v:
                raise ValueError(f"Missing required feature: {feature}")
            
            if not isinstance(v[feature], (int, bool)):
                raise ValueError(f"Invalid type for feature {feature}")
        
        return v
```

### 3. Rate Limiting
```python
# Rate limiting with slowapi
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/predict/pcos")
@limiter.limit("10/minute")
async def predict_pcos(request: Request, pcos_request: PCOSRequest):
    # Prediction logic here
    pass
```

## Model Updates and Versioning

### 1. Model Update Strategy
```python
# Model version management
class ModelManager:
    def __init__(self):
        self.models = {}
        self.load_all_models()
    
    def load_all_models(self):
        """Load all available model versions"""
        for model_type in ["pcos", "cycle_prediction", "symptom_analysis"]:
            self.load_model_versions(model_type)
    
    def load_model_versions(self, model_type: str):
        """Load specific model versions"""
        model_dir = f"/app/models/{model_type}"
        versions = [d for d in os.listdir(model_dir) if d.startswith("v")]
        
        for version in versions:
            model_path = f"{model_dir}/{version}/model.pkl"
            if os.path.exists(model_path):
                self.models[f"{model_type}:{version}"] = joblib.load(model_path)
        
        # Set latest version
        if versions:
            latest_version = max(versions, key=lambda x: tuple(map(int, x[1:].split('.'))))
            self.models[f"{model_type}:latest"] = self.models[f"{model_type}:{latest_version}"]

model_manager = ModelManager()
```

### 2. A/B Testing for Models
```python
# A/B testing configuration
import random

@app.post("/api/v1/predict/pcos")
async def predict_pcos(request: PCOSRequest):
    # A/B test between model versions
    if random.random() < 0.1:  # 10% traffic to new model
        model_version = "v2.2.0"
        experiment_group = "treatment"
    else:
        model_version = "v2.1.0"
        experiment_group = "control"
    
    prediction = await predict_with_version("pcos", model_version, request.features)
    
    # Log experiment data
    logger.info("A/B test prediction", 
                user_id=request.user_id,
                model_version=model_version,
                experiment_group=experiment_group,
                prediction=prediction)
    
    return prediction
```

## Troubleshooting

### Common Issues

**1. Model Loading Errors:**
```bash
# Check model files exist
ls -la /app/models/pcos/latest/

# Verify model format
python -c "import joblib; model = joblib.load('/app/models/pcos/latest/model.pkl'); print(type(model))"

# Check model dependencies
pip list | grep scikit-learn
```

**2. Memory Issues:**
```bash
# Monitor memory usage
htop
free -m

# Check model sizes
du -sh /app/models/*

# Optimize model loading
# Use model compression or quantization
```

**3. Performance Issues:**
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8000/api/v1/predict/pcos"

# Monitor CPU usage
top -p $(pgrep -f "uvicorn")

# Check for memory leaks
python -m memory_profiler src/api/app.py
```

**4. GPU Issues (if using):**
```bash
# Check GPU availability
nvidia-smi

# Verify CUDA installation
python -c "import torch; print(torch.cuda.is_available())"

# Check GPU memory usage
nvidia-smi --query-gpu=memory.used,memory.total --format=csv
```

This comprehensive guide covers all aspects of deploying the FEMbalance ML API, ensuring scalability, performance, and reliability across different platforms and environments.