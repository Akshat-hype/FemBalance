# FEMbalance Development Setup Guide

This guide will help you set up the FEMbalance development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **Docker** (optional, for containerized development) - [Download](https://docker.com/)

## Quick Start with Docker

If you have Docker installed, you can get the entire application running with a single command:

```bash
# Clone the repository
git clone <repository-url>
cd FEMbalance

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access the applications:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ML API: http://localhost:8000
- Database Admin: http://localhost:8081

## Manual Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd FEMbalance
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGODB_URI
# - JWT_SECRET
# - FRONTEND_URL

# Start MongoDB (if not using Docker)
# On macOS with Homebrew:
brew services start mongodb-community

# On Ubuntu:
sudo systemctl start mongod

# Start the backend server
npm run dev
```

The backend will be available at http://localhost:3001

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file (optional)
cp .env.example .env

# Start the development server
npm start
```

The frontend will be available at http://localhost:3000

### 4. ML API Setup

```bash
cd ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the ML API
python src/api/app.py
```

The ML API will be available at http://localhost:8000

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Application
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/fembalance_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# External APIs
ML_API_URL=http://localhost:8000

# Optional: Redis for rate limiting
REDIS_URL=redis://localhost:6379

# Optional: Email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ML_API_URL=http://localhost:8000/api/v1
```

### ML API Environment Variables

Create a `.env` file in the `ml` directory:

```env
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Database Setup

### MongoDB Setup

1. **Install MongoDB Community Edition**
   - Follow the [official installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB**
   ```bash
   # On macOS with Homebrew:
   brew services start mongodb-community
   
   # On Ubuntu:
   sudo systemctl start mongod
   
   # On Windows:
   # MongoDB should start automatically as a service
   ```

3. **Verify MongoDB is running**
   ```bash
   mongo --eval "db.adminCommand('ismaster')"
   ```

### Database Seeding (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

## Development Workflow

### Running the Application

1. **Start all services manually:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   
   # Terminal 3 - ML API
   cd ml && python src/api/app.py
   ```

2. **Or use Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Available Scripts

#### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run seed         # Seed database with sample data
```

#### Frontend Scripts
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

#### ML API Scripts
```bash
python src/api/app.py              # Start ML API server
python src/training/train_pcos_model.py  # Train PCOS model
jupyter notebook notebooks/       # Start Jupyter notebooks
pytest tests/                     # Run tests
```

## Development Tools

### Recommended VS Code Extensions

- **Backend:**
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - REST Client
  - MongoDB for VS Code

- **Frontend:**
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Tailwind CSS IntelliSense

- **ML:**
  - Python
  - Pylance
  - Jupyter
  - Python Docstring Generator

### API Testing

Use tools like Postman, Insomnia, or the REST Client VS Code extension to test API endpoints.

Example API requests:

```http
### Register User
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1995-06-15"
}

### Login User
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   
   # Kill process
   kill -9 <PID>
   ```

2. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify MongoDB is accessible

3. **Module not found errors**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Python virtual environment issues**
   ```bash
   # Recreate virtual environment
   rm -rf venv
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

### Getting Help

- Check the [Contributing Guidelines](contributing.md)
- Review the [API Documentation](../api/)
- Open an issue on GitHub
- Join our development Discord (link in README)

## Next Steps

Once you have the development environment set up:

1. Review the [Contributing Guidelines](contributing.md)
2. Explore the [API Documentation](../api/)
3. Check out the project structure in the main README
4. Start with good first issues labeled in GitHub

Happy coding! 🚀