# Systelle 🌸

**Your Health, Your Power - Intelligent Menstrual Health Tracking Platform**

Systelle is a comprehensive women's health platform that combines intelligent menstrual cycle tracking, PCOS/PCOD risk assessment, and personalized wellness guidance. Built with modern web technologies, it empowers women to understand their bodies better through data-driven insights and AI-powered health predictions.

![Systelle Dashboard](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Systelle+Dashboard)

## 🌟 Key Features

### 📊 **Smart Cycle Tracking**
- Intelligent period prediction with visual circular progress tracker
- Automatic cycle length calculation and pattern recognition
- Real-time cycle status monitoring and management
- Historical data analysis with trend identification
- Personalized cycle phase insights and recommendations

### 🩺 **PCOS/PCOD Risk Assessment**
- AI-powered risk evaluation using machine learning models
- Comprehensive symptom tracking (flow, pain, sleep, skin, hair)
- Real-time risk percentage calculation and visualization
- Educational content about PCOS awareness and management
- Progress tracking and risk monitoring over time

### � **PersoRnalized Wellness Hub**
- Cycle-phase specific workout recommendations
- Nutrition guidance tailored to menstrual health
- Exercise plans for different fitness levels
- Wellness tips and daily health recommendations
- Interactive health and exercise modules

### �  **Daily Health Logging**
- Comprehensive daily update system
- Symptom severity tracking with visual indicators
- Lifestyle factors monitoring (sleep quality, stress levels)
- Mood and energy level tracking
- Historical data visualization and analytics

### 🎨 **Modern User Experience**
- Beautiful glassmorphism design with smooth animations
- Fully responsive design for all devices
- Intuitive navigation with mobile-optimized interface
- Dark/light theme support with custom color schemes
- Accessibility-compliant design (WCAG 2.1)

## 🏗️ Technology Stack

### **Frontend** (React.js + Tailwind CSS)
- **Framework**: React 19 with modern hooks and functional components
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form for efficient form handling
- **Routing**: React Router v7 with protected routes
- **HTTP Client**: Axios for API communication

### **Backend** (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with secure cookies
- **Security**: CORS, rate limiting, input validation
- **API Design**: RESTful APIs with comprehensive error handling

### **Machine Learning** (Python + Flask)
- **Framework**: Flask for ML API endpoints
- **Models**: Scikit-learn for PCOS risk prediction
- **Data Processing**: Pandas + NumPy for data analysis
- **Model**: Pre-trained PCOS prediction model (pkl format)
- **Inference**: Real-time prediction with confidence scoring

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ and npm
- **Python** 3.8+ with pip
- **MongoDB** (local or cloud instance)

### Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/systelle.git
cd systelle
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Configure your MongoDB URI and JWT secrets in .env

# Start the backend server
npm start
# Backend will run on http://localhost:5000
```

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the development server
npm run dev
# Frontend will run on http://localhost:5173
```

#### 4. ML API Setup
```bash
cd python-model
pip install -r requirements.txt

# Start the ML API server
python app.py
# ML API will run on http://localhost:5000 (Flask)
```

### Environment Configuration

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/systelle
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (Vite automatically loads .env files)
```env
VITE_API_URL=http://localhost:5000
VITE_ML_API_URL=http://localhost:5000
```

## 📁 Project Structure

```
Systelle/
├── 🎨 frontend/                 # React.js application
│   ├── src/
│   │   ├── component/          # React components
│   │   │   ├── Login.jsx       # Authentication components
│   │   │   ├── Signup.jsx      # User registration
│   │   │   ├── Homepage.jsx    # Main dashboard
│   │   │   ├── Navbar.jsx      # Navigation component
│   │   │   ├── Calendar.jsx    # Cycle calendar view
│   │   │   ├── Health.jsx      # Health tracking
│   │   │   ├── Exercise.jsx    # Fitness modules
│   │   │   ├── DailyUpdate.jsx # Daily logging
│   │   │   └── ...             # Other components
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # App entry point
│   │   └── index.css           # Global styles
│   ├── public/                 # Static assets
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── postcss.config.js       # PostCSS setup
│   └── package.json
│
├── ⚙️ backend/                  # Node.js API server
│   ├── server.js               # Main server file
│   ├── authentication.js      # Auth middleware
│   ├── package.json
│   └── README.md
│
├── 🤖 python-model/            # Machine Learning API
│   ├── app.py                  # Flask application
│   ├── pcod_pcos_predictor_model.pkl  # Trained ML model
│   └── .gitattributes
│
├── 📚 docs/                    # Documentation (if exists)
└── 📄 README.md               # This file
```

## 🎯 Core Features Walkthrough

### 1. **User Authentication**
- Secure registration and login system
- JWT-based authentication with HTTP-only cookies
- Protected routes and session management
- Password validation and security measures

### 2. **Dashboard Overview**
- Circular progress tracker showing cycle progression
- Days remaining until next period
- Personalized health insights based on cycle phase
- Quick access to daily updates and key features

### 3. **Cycle Management**
- Visual cycle tracking with progress indicators
- Automatic cycle length calculation
- Period start/end date logging
- Cycle reset and confirmation features
- Historical cycle data and patterns

### 4. **Health Risk Assessment**
- Comprehensive PCOS/PCOD risk evaluation
- Machine learning-powered predictions
- Risk percentage with color-coded indicators
- Symptom correlation and analysis
- Personalized health recommendations

### 5. **Daily Health Logging**
- Flow intensity and characteristics
- Pain level tracking with visual scales
- Sleep quality assessment
- Skin and hair condition monitoring
- Mood and energy level tracking

### 6. **Wellness & Exercise**
- Curated workout routines for different cycle phases
- Exercise recommendations based on current health status
- Nutrition tips and dietary guidance
- Wellness tracking and progress monitoring

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test                # Run tests
npm run test:coverage   # Coverage report
```

### Backend Testing
```bash
cd backend
npm test                # Run API tests
```

### ML Model Testing
```bash
cd python-model
python -m pytest       # Run ML tests
```

## 🚀 Deployment

### Production Build

#### Frontend
```bash
cd frontend
npm run build           # Creates dist/ folder
npm run preview         # Preview production build
```

#### Backend
```bash
cd backend
npm run start           # Production server
```

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔧 Development Guidelines

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: Node.js best practices
- **Python**: PEP 8 compliance
- **Git**: Conventional commit messages

### Component Structure
```jsx
// Example component structure
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Side effects
  }, []);

  return (
    <motion.div 
      className="glass-effect rounded-3xl p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Component content */}
    </motion.div>
  );
};

export default ComponentName;
```

## 🔒 Security & Privacy

### Data Protection
- **Encryption**: All sensitive data encrypted in transit and at rest
- **Privacy**: Minimal data collection with user consent
- **GDPR**: Compliance with data protection regulations
- **Security**: Regular security audits and updates

### Authentication Security
- JWT tokens with secure HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Session management and automatic logout

## 📊 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /signup` - User registration
- `POST /logout` - User logout
- `GET /login` - Check authentication status

### User Data
- `GET /home` - Get user dashboard data
- `GET /home/profile` - Get user profile
- `POST /home/cycle-confirm` - Confirm cycle start
- `GET /home/cycle-status` - Get cycle status

### Health Data
- `GET /pcos/latest-data` - Get latest health data
- `POST /predict` - ML prediction endpoint (Python API)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper testing
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🐛 Known Issues & Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend CORS is configured for frontend URL
2. **MongoDB Connection**: Check MongoDB URI in environment variables
3. **ML Model Loading**: Ensure Python dependencies are installed
4. **Build Errors**: Clear node_modules and reinstall dependencies

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=* npm start
```

## 📈 Roadmap

### ✅ Current Features (v1.0)
- [x] User authentication and registration
- [x] Cycle tracking with visual progress
- [x] PCOS risk assessment with ML
- [x] Daily health logging
- [x] Responsive design with glassmorphism UI
- [x] Exercise and wellness modules

### 🚧 Upcoming Features (v1.1)
- [ ] Advanced analytics dashboard
- [ ] Export health data functionality
- [ ] Notification system for reminders
- [ ] Multi-language support
- [ ] Enhanced ML models

### 🔮 Future Releases (v2.0+)
- [ ] Mobile applications (React Native)
- [ ] Wearable device integration
- [ ] Telemedicine features
- [ ] Community and social features
- [ ] Healthcare provider portal

## 📞 Support

### Getting Help
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check the docs/ folder
- **Email**: support@systelle.com

### Medical Disclaimer
⚠️ **Important**: Systelle is designed for educational and tracking purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers regarding any medical concerns.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern healthcare applications
- **Open Source Libraries**: React, Node.js, MongoDB, Scikit-learn
- **Community**: Contributors and beta testers
- **Medical Guidance**: Healthcare professionals who provided insights

---

<div align="center">

**Made with ❤️ for women's health empowerment**

[Website](https://systelle.com) • [Documentation](docs/) • [Contributing](CONTRIBUTING.md)

*Empowering women through intelligent health tracking*

</div>
