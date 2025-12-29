# FEMbalance Backend

Node.js/Express.js backend API for FEMbalance - Intelligent menstrual health platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- Redis (optional, for caching)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or use local MongoDB installation
   mongod
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **API is ready**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
src/
├── controllers/        # Request handlers
├── models/            # Database models (Mongoose)
├── routes/            # API route definitions
├── middleware/        # Custom middleware functions
├── services/          # Business logic services
├── utils/             # Utility functions
├── config/            # Configuration files
└── app.js             # Main application file
```

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🗄️ Database

### MongoDB Collections

#### Users
- User profiles and authentication
- Preferences and settings
- Account management

#### Cycles
- Menstrual cycle data
- Period tracking
- Cycle predictions

#### Symptoms
- Daily symptom logs
- Lifestyle tracking
- PCOS-related symptoms

#### PCOSRisk
- Risk assessment results
- Historical assessments
- Recommendations

### Database Schema

```javascript
// User Schema
{
  email: String,
  password: String (hashed),
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    height: Number,
    weight: Number
  },
  preferences: {
    units: String,
    notifications: Object,
    privacy: Object
  }
}

// Cycle Schema
{
  userId: ObjectId,
  startDate: Date,
  endDate: Date,
  cycleLength: Number,
  periodLength: Number,
  flow: String,
  isIrregular: Boolean,
  predictions: Object
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update preferences

### Cycles
- `GET /api/cycles` - Get user cycles
- `POST /api/cycles` - Create new cycle
- `PUT /api/cycles/:id` - Update cycle
- `DELETE /api/cycles/:id` - Delete cycle
- `GET /api/cycles/stats` - Get cycle statistics
- `GET /api/cycles/predictions` - Get cycle predictions

### Symptoms
- `GET /api/symptoms` - Get symptoms
- `POST /api/symptoms` - Log symptoms
- `PUT /api/symptoms/:id` - Update symptoms
- `DELETE /api/symptoms/:id` - Delete symptoms

### PCOS
- `POST /api/pcos/risk-assessment` - Submit risk assessment
- `GET /api/pcos/history` - Get assessment history
- `GET /api/pcos/recommendations` - Get recommendations

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens** - Stateless authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - express-validator middleware

### Security Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - Request logging
- **Express Rate Limit** - Rate limiting

### Data Protection
- **Password Encryption** - bcrypt hashing
- **Sensitive Data** - Excluded from API responses
- **Input Sanitization** - Prevent injection attacks

## 🧪 Testing

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
└── fixtures/          # Test data
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "User Controller"

# Run with coverage
npm run test:coverage
```

### Test Examples
```javascript
// Unit test example
describe('User Controller', () => {
  it('should create a new user', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.user.email).toBe(userData.email);
  });
});
```

## 📊 Monitoring & Logging

### Logging
- **Winston** - Structured logging
- **Log Levels** - Error, warn, info, debug
- **Log Files** - Separate files for different log levels
- **Request Logging** - Morgan middleware

### Health Checks
- `GET /health` - Basic health check
- Database connectivity check
- External service status

### Metrics
- Response times
- Error rates
- Database query performance
- Memory usage

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/fembalance
JWT_SECRET=your-secret-key
```

### Docker Deployment
```bash
# Build image
docker build -t fembalance-backend .

# Run container
docker run -p 3001:3001 fembalance-backend
```

### Production Considerations
- **Process Management** - PM2 or similar
- **Load Balancing** - Nginx or cloud load balancer
- **Database Scaling** - MongoDB replica sets
- **Caching** - Redis for session storage
- **Monitoring** - Application performance monitoring

## 🔧 Configuration

### Database Configuration
```javascript
// config/database.js
module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10
    }
  }
};
```

### JWT Configuration
```javascript
// config/jwt.js
module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256'
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Code Style
- Use ESLint configuration
- Follow Node.js best practices
- Write meaningful function and variable names
- Add JSDoc comments for functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.