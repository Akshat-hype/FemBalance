# FEMbalance

**Intelligent menstrual health, PCOS awareness & lifestyle guidance**

FEMbalance is a comprehensive digital health platform focused on holistic menstrual wellness. It combines menstrual cycle tracking, lifestyle monitoring (diet & exercise), and machine-learning–based PCOS risk detection to enable early awareness, preventive care, and data-driven health decisions.

## 🌟 Features

### Core Features
- **Intelligent Cycle Tracking**: Period start/end dates, cycle length calculation, irregularity detection
- **Symptoms & Lifestyle Monitoring**: PMS symptoms, lifestyle inputs (sleep, stress, activity)
- **PCOS Risk Detection**: ML-based risk assessment with educational disclaimers
- **Smart Predictions**: Period reminders, ovulation & cycle phase predictions
- **Personalized Wellness**: Cycle-phase based workouts and nutrition guidance
- **Health Education**: Comprehensive blog with menstrual health and PCOS awareness content

### Technology Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Machine Learning**: Python, Scikit-learn, FastAPI
- **Authentication**: JWT
- **Deployment**: Docker, Cloud hosting ready

## 🏗️ Project Structure

```
FEMbalance/
├── frontend/          # React.js frontend application
├── backend/           # Node.js/Express.js API server
├── ml/               # Python ML models and API
├── shared/           # Shared utilities and types
├── docs/             # Documentation
└── docker-compose.yml # Development environment setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB
- Docker & Docker Compose (optional)

### Option 1: Docker Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FEMbalance
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - ML API: http://localhost:8000
   - Database Admin: http://localhost:8081

### Option 2: Manual Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd FEMbalance
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Setup ML API**
   ```bash
   cd ml
   pip install -r requirements.txt
   python src/api/app.py
   ```

## 📚 Documentation

- [API Documentation](docs/api/)
- [Development Setup](docs/development/setup.md)
- [Deployment Guide](docs/deployment/)
- [Contributing Guidelines](docs/development/contributing.md)

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
```

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon
npm test           # Run tests
npm run lint       # Run ESLint
```

### ML Development
```bash
cd ml
python src/api/app.py              # Start ML API
jupyter notebook notebooks/       # Open Jupyter notebooks
pytest tests/                     # Run tests
```

## 🧪 Testing

Each component has its own test suite:

- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **ML**: Pytest

Run all tests:
```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test

# ML
cd ml && pytest
```

## 🚀 Deployment

The application is containerized and ready for deployment on various platforms:

- **Docker**: Use the provided `docker-compose.yml`
- **Cloud Platforms**: AWS, Google Cloud, Azure
- **Container Orchestration**: Kubernetes manifests available

See [Deployment Documentation](docs/deployment/) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/development/contributing.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy & Security

FEMbalance takes user privacy seriously:
- All health data is encrypted
- GDPR compliant
- No data sharing without explicit consent
- Secure authentication and authorization

## 📞 Support

- **Documentation**: Check our [docs](docs/)
- **Issues**: Create an issue on GitHub
- **Email**: support@fembalance.com

## 🎯 Roadmap

### MVP (Current)
- [x] Basic cycle tracking
- [x] Symptom logging
- [x] PCOS risk assessment
- [x] Wellness recommendations
- [x] Health blog

### Future Features
- [ ] Doctor consultations
- [ ] Wearable device integration
- [ ] Advanced analytics dashboard
- [ ] Community features
- [ ] Mobile app (React Native)

---

**Disclaimer**: FEMbalance is designed for educational and informational purposes. It is not intended to replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.




FEMbalance/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header/
│   │   │   │   ├── Footer/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── LoadingSpinner/
│   │   │   ├── auth/
│   │   │   │   ├── Login/
│   │   │   │   ├── Register/
│   │   │   │   └── ForgotPassword/
│   │   │   ├── dashboard/
│   │   │   │   ├── CycleOverview/
│   │   │   │   ├── PCOSRiskCard/
│   │   │   │   └── QuickActions/
│   │   │   ├── cycle/
│   │   │   │   ├── CycleTracker/
│   │   │   │   ├── CalendarView/
│   │   │   │   ├── CycleChart/
│   │   │   │   └── PeriodLogger/
│   │   │   ├── symptoms/
│   │   │   │   ├── SymptomLogger/
│   │   │   │   ├── SymptomHistory/
│   │   │   │   └── LifestyleForm/
│   │   │   ├── pcos/
│   │   │   │   ├── RiskAssessment/
│   │   │   │   ├── RiskScore/
│   │   │   │   └── PCOSEducation/
│   │   │   ├── wellness/
│   │   │   │   ├── ExercisePlans/
│   │   │   │   ├── DietPlans/
│   │   │   │   └── WorkoutTracker/
│   │   │   └── blog/
│   │   │       ├── BlogList/
│   │   │       ├── BlogPost/
│   │   │       └── BlogCategories/
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── CycleTracking/
│   │   │   ├── Symptoms/
│   │   │   ├── PCOSRisk/
│   │   │   ├── Exercise/
│   │   │   ├── Diet/
│   │   │   ├── Blog/
│   │   │   ├── Profile/
│   │   │   └── Settings/
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCycle.js
│   │   │   ├── useSymptoms.js
│   │   │   └── useNotifications.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── cycle.js
│   │   │   ├── symptoms.js
│   │   │   ├── pcos.js
│   │   │   └── wellness.js
│   │   ├── utils/
│   │   │   ├── dateHelpers.js
│   │   │   ├── cycleCalculations.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── CycleContext.js
│   │   │   └── ThemeContext.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── components.css
│   │   │   └── tailwind.config.js
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── cycleController.js
│   │   │   ├── symptomController.js
│   │   │   ├── pcosController.js
│   │   │   ├── exerciseController.js
│   │   │   ├── dietController.js
│   │   │   └── blogController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Cycle.js
│   │   │   ├── Symptom.js
│   │   │   ├── PCOSRisk.js
│   │   │   ├── Exercise.js
│   │   │   ├── Diet.js
│   │   │   └── Blog.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── cycles.js
│   │   │   ├── symptoms.js
│   │   │   ├── pcos.js
│   │   │   ├── wellness.js
│   │   │   └── blog.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── cycleService.js
│   │   │   ├── symptomService.js
│   │   │   ├── pcosService.js
│   │   │   ├── notificationService.js
│   │   │   └── mlService.js
│   │   ├── utils/
│   │   │   ├── database.js
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   ├── dateHelpers.js
│   │   │   └── constants.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── environment.js
│   │   └── app.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── ml/
│   ├── src/
│   │   ├── models/
│   │   │   ├── pcos_risk_model.py
│   │   │   ├── cycle_prediction_model.py
│   │   │   └── symptom_analysis_model.py
│   │   ├── data/
│   │   │   ├── preprocessing/
│   │   │   │   ├── data_cleaner.py
│   │   │   │   ├── feature_engineer.py
│   │   │   │   └── data_validator.py
│   │   │   ├── raw/
│   │   │   ├── processed/
│   │   │   └── datasets/
│   │   ├── training/
│   │   │   ├── train_pcos_model.py
│   │   │   ├── train_cycle_model.py
│   │   │   ├── model_evaluation.py
│   │   │   └── hyperparameter_tuning.py
│   │   ├── inference/
│   │   │   ├── pcos_predictor.py
│   │   │   ├── cycle_predictor.py
│   │   │   └── api_handler.py
│   │   ├── utils/
│   │   │   ├── data_utils.py
│   │   │   ├── model_utils.py
│   │   │   ├── validation_utils.py
│   │   │   └── constants.py
│   │   └── api/
│   │       ├── app.py
│   │       ├── routes/
│   │       │   ├── prediction.py
│   │       │   └── health.py
│   │       └── middleware/
│   │           ├── auth.py
│   │           └── validation.py
│   ├── notebooks/
│   │   ├── exploratory_analysis.ipynb
│   │   ├── model_development.ipynb
│   │   └── evaluation_metrics.ipynb
│   ├── tests/
│   │   ├── test_models.py
│   │   ├── test_preprocessing.py
│   │   └── test_api.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── shared/
│   ├── types/
│   │   ├── user.js
│   │   ├── cycle.js
│   │   ├── symptom.js
│   │   └── pcos.js
│   ├── constants/
│   │   ├── api.js
│   │   ├── cycles.js
│   │   └── symptoms.js
│   └── utils/
│       ├── dateHelpers.js
│       └── validators.js
│
├── docs/
│   ├── api/
│   │   ├── authentication.md
│   │   ├── cycles.md
│   │   ├── symptoms.md
│   │   └── pcos.md
│   ├── deployment/
│   │   ├── frontend.md
│   │   ├── backend.md
│   │   └── ml.md
│   └── development/
│       ├── setup.md
│       ├── contributing.md
│       └── testing.md
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── LICENSE
