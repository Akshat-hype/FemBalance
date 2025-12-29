# FEMbalance ML API

Python/FastAPI machine learning service for PCOS risk prediction and cycle analysis.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip or conda

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Activate (Windows)
   venv\Scripts\activate
   
   # Activate (macOS/Linux)
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the ML API server**
   ```bash
   python src/api/app.py
   ```

4. **API is ready**
   - API: [http://localhost:8000](http://localhost:8000)
   - Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 📁 Project Structure

```
src/
├── api/                # FastAPI application
│   ├── app.py         # Main application
│   ├── routes/        # API route handlers
│   └── middleware/    # Custom middleware
├── models/            # ML model implementations
├── data/              # Data processing modules
├── training/          # Model training scripts
├── inference/         # Prediction services
└── utils/             # Utility functions

notebooks/             # Jupyter notebooks for analysis
tests/                # Test files
models/               # Trained model files
data/                 # Data storage
```

## 🤖 Machine Learning Models

### PCOS Risk Prediction Model
- **Algorithm**: Random Forest Classifier
- **Features**: Cycle patterns, symptoms, lifestyle factors
- **Output**: Risk score (0-1), risk level (low/medium/high)
- **Accuracy**: ~85% on validation data

### Cycle Prediction Model
- **Algorithm**: Time series analysis
- **Features**: Historical cycle data
- **Output**: Next period date, ovulation prediction
- **Accuracy**: ±2 days for regular cycles

## 🔌 API Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system metrics
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Predictions
- `POST /api/v1/predictions/pcos-risk` - PCOS risk assessment
- `POST /api/v1/predictions/cycle-prediction` - Cycle predictions
- `GET /api/v1/predictions/models/status` - Model status

### Example Request/Response

#### PCOS Risk Prediction
```bash
curl -X POST "http://localhost:8000/api/v1/predictions/pcos-risk" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "cycles": [
      {
        "cycle_length": 35,
        "period_length": 6,
        "flow_intensity": "heavy",
        "start_date": "2024-01-01"
      }
    ],
    "symptoms": {
      "acne": 3,
      "weight_gain": true,
      "excessive_hair_growth": false,
      "mood_changes": 2
    },
    "lifestyle": {
      "bmi": 26.5,
      "exercise_frequency": 2,
      "stress_level": 7,
      "sleep_hours": 6.5
    },
    "age": 28
  }'
```

Response:
```json
{
  "user_id": "user123",
  "risk_score": 0.65,
  "risk_level": "medium",
  "confidence": 0.82,
  "contributing_factors": [
    "Irregular cycle patterns",
    "Elevated BMI",
    "Moderate acne severity"
  ],
  "recommendations": [
    "Consider consulting with healthcare provider",
    "Maintain regular exercise routine",
    "Monitor cycle patterns closely"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🧪 Model Training

### Training Data
- **Sources**: Anonymized medical datasets, synthetic data
- **Size**: 10,000+ samples for PCOS model
- **Features**: 20+ engineered features
- **Validation**: 5-fold cross-validation

### Training Process
```bash
# Train PCOS model
python src/training/train_pcos_model.py

# Train cycle prediction model
python src/training/train_cycle_model.py

# Evaluate models
python src/training/model_evaluation.py
```

### Model Evaluation Metrics
- **Accuracy**: Overall prediction accuracy
- **Precision**: True positive rate
- **Recall**: Sensitivity
- **F1-Score**: Harmonic mean of precision and recall
- **AUC-ROC**: Area under the ROC curve

## 📊 Data Processing

### Feature Engineering
```python
# Example feature extraction
def extract_cycle_features(cycles):
    cycle_lengths = [c['cycle_length'] for c in cycles]
    return {
        'avg_cycle_length': np.mean(cycle_lengths),
        'cycle_variability': np.std(cycle_lengths),
        'irregular_cycles': sum(1 for l in cycle_lengths if l > 35),
        'short_cycles': sum(1 for l in cycle_lengths if l < 21)
    }
```

### Data Validation
- Input validation using Pydantic models
- Range checks for all numeric values
- Required field validation
- Data type validation

## 🔒 Security & Privacy

### Data Protection
- **No Data Storage**: API doesn't store user data
- **Input Validation**: All inputs validated and sanitized
- **Authentication**: JWT token validation
- **Rate Limiting**: Prevent abuse

### Privacy Compliance
- **GDPR Compliant**: No personal data retention
- **Anonymization**: All data processed anonymously
- **Audit Logging**: Prediction requests logged (without PII)

## 🧪 Testing

### Test Structure
```
tests/
├── test_models.py         # Model unit tests
├── test_preprocessing.py  # Data processing tests
├── test_api.py           # API endpoint tests
└── fixtures/             # Test data
```

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_models.py

# Run with verbose output
pytest -v
```

### Test Examples
```python
def test_pcos_prediction():
    """Test PCOS risk prediction"""
    input_data = {
        "user_id": "test_user",
        "cycles": [{"cycle_length": 35, "period_length": 5}],
        "symptoms": {"acne": 3, "weight_gain": True},
        "lifestyle": {"bmi": 25, "exercise_frequency": 3},
        "age": 25
    }
    
    result = pcos_predictor.predict(input_data)
    
    assert 0 <= result['risk_score'] <= 1
    assert result['risk_level'] in ['low', 'medium', 'high']
    assert len(result['recommendations']) > 0
```

## 📈 Monitoring & Observability

### Metrics Collection
- **Prediction Latency**: Response time tracking
- **Model Performance**: Accuracy monitoring
- **Error Rates**: Failed prediction tracking
- **Resource Usage**: CPU, memory monitoring

### Logging
```python
import logging

logger = logging.getLogger(__name__)

# Log prediction requests
logger.info(f"PCOS prediction request for user: {user_id}")

# Log errors
logger.error(f"Prediction failed: {error_message}")
```

### Health Monitoring
- System resource monitoring
- Model availability checks
- Dependency health checks
- Performance metrics

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t fembalance-ml .

# Run container
docker run -p 8000:8000 fembalance-ml
```

### Production Configuration
```python
# Production settings
ENVIRONMENT = "production"
LOG_LEVEL = "INFO"
WORKERS = 4
HOST = "0.0.0.0"
PORT = 8000
```

### Scaling Considerations
- **Horizontal Scaling**: Multiple API instances
- **Load Balancing**: Distribute prediction requests
- **Model Caching**: Cache frequently used models
- **GPU Support**: For deep learning models

## 🔧 Configuration

### Environment Variables
```env
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=INFO
MODEL_PATH=/app/models
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Model Configuration
```python
# Model hyperparameters
PCOS_MODEL_CONFIG = {
    'n_estimators': 100,
    'max_depth': 10,
    'min_samples_split': 5,
    'random_state': 42
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Code Style
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Add unit tests for new code

### Model Development
- Document model architecture
- Include evaluation metrics
- Provide training instructions
- Add model versioning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.