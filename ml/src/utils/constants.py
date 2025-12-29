"""
Constants and configuration values for the ML service.
"""

import os
from typing import Dict, List

# Model versions and paths
MODEL_VERSIONS = {
    'pcos_risk': '1.0.0',
    'cycle_prediction': '1.0.0',
    'symptom_analysis': '1.0.0'
}

MODEL_PATHS = {
    'pcos_risk': 'models/pcos_risk_model.pkl',
    'cycle_prediction': 'models/cycle_prediction_model.pkl',
    'symptom_analysis': 'models/symptom_analysis_model.pkl'
}

# Data preprocessing constants
FEATURE_COLUMNS = {
    'pcos_risk': [
        'age', 'bmi', 'cycle_length', 'period_length', 'exercise_frequency',
        'stress_level', 'sleep_quality', 'family_history', 'symptom_count'
    ],
    'cycle_prediction': [
        'previous_cycle_length', 'previous_period_length', 'age', 'bmi',
        'stress_level', 'exercise_frequency', 'season', 'cycle_regularity'
    ],
    'symptom_analysis': [
        'symptom_type_encoded', 'severity', 'cycle_day', 'age', 'bmi',
        'stress_level', 'exercise_frequency', 'season'
    ]
}

# Categorical mappings
SYMPTOM_TYPES = {
    'cramps': 0,
    'bloating': 1,
    'mood_swings': 2,
    'headache': 3,
    'fatigue': 4,
    'acne': 5,
    'breast_tenderness': 6,
    'back_pain': 7,
    'nausea': 8,
    'other': 9
}

EXERCISE_TYPES = {
    'cardio': 0,
    'strength': 1,
    'flexibility': 2,
    'sports': 3,
    'mixed': 4
}

INTENSITY_LEVELS = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'very-high': 4
}

STRESS_LEVELS = {
    'low': 1,
    'moderate': 2,
    'high': 3,
    'very-high': 4
}

SLEEP_QUALITY = {
    'poor': 1,
    'fair': 2,
    'good': 3,
    'excellent': 4
}

DIET_QUALITY = {
    'poor': 1,
    'fair': 2,
    'good': 3,
    'excellent': 4
}

# PCOS risk levels
PCOS_RISK_LEVELS = {
    'low': (0.0, 0.3),
    'moderate': (0.3, 0.6),
    'high': (0.6, 0.8),
    'very_high': (0.8, 1.0)
}

# Cycle phases
CYCLE_PHASES = {
    'menstrual': (1, 5),
    'follicular': (6, 13),
    'ovulation': (14, 16),
    'luteal': (17, 28)
}

# Data validation ranges
VALIDATION_RANGES = {
    'age': (12, 60),
    'bmi': (10, 50),
    'cycle_length': (21, 45),
    'period_length': (1, 10),
    'severity': (1, 10),
    'exercise_frequency': (0, 7),  # days per week
    'cycle_day': (1, 50)
}

# Model hyperparameters
DEFAULT_HYPERPARAMETERS = {
    'pcos_risk': {
        'random_forest': {
            'n_estimators': 100,
            'max_depth': 10,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42
        },
        'gradient_boosting': {
            'n_estimators': 100,
            'learning_rate': 0.1,
            'max_depth': 6,
            'random_state': 42
        }
    },
    'cycle_prediction': {
        'linear_regression': {
            'fit_intercept': True,
            'normalize': False
        },
        'random_forest': {
            'n_estimators': 50,
            'max_depth': 8,
            'min_samples_split': 5,
            'random_state': 42
        }
    },
    'symptom_analysis': {
        'kmeans': {
            'n_clusters': 5,
            'random_state': 42,
            'max_iter': 300
        },
        'dbscan': {
            'eps': 0.5,
            'min_samples': 5
        }
    }
}

# API configuration
API_CONFIG = {
    'host': os.getenv('ML_API_HOST', '0.0.0.0'),
    'port': int(os.getenv('ML_API_PORT', 8000)),
    'debug': os.getenv('ML_API_DEBUG', 'False').lower() == 'true',
    'workers': int(os.getenv('ML_API_WORKERS', 4)),
    'timeout': int(os.getenv('ML_API_TIMEOUT', 30))
}

# Database configuration
DATABASE_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'name': os.getenv('DB_NAME', 'fembalance_ml'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
    'pool_size': int(os.getenv('DB_POOL_SIZE', 10))
}

# Logging configuration
LOGGING_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': os.getenv('LOG_FILE', 'ml_service.log'),
    'max_bytes': int(os.getenv('LOG_MAX_BYTES', 10485760)),  # 10MB
    'backup_count': int(os.getenv('LOG_BACKUP_COUNT', 5))
}

# Feature engineering constants
FEATURE_ENGINEERING = {
    'cycle_regularity_threshold': 7,  # days of standard deviation
    'symptom_severity_bins': [1, 3, 6, 8, 10],
    'age_bins': [12, 18, 25, 35, 45, 60],
    'bmi_categories': {
        'underweight': (0, 18.5),
        'normal': (18.5, 25),
        'overweight': (25, 30),
        'obese': (30, 50)
    }
}

# Model performance thresholds
PERFORMANCE_THRESHOLDS = {
    'pcos_risk': {
        'min_accuracy': 0.75,
        'min_precision': 0.70,
        'min_recall': 0.70,
        'min_f1_score': 0.70,
        'max_false_positive_rate': 0.25
    },
    'cycle_prediction': {
        'max_mae': 2.0,  # days
        'max_rmse': 3.0,  # days
        'min_r2_score': 0.60,
        'max_mape': 15.0  # percentage
    },
    'symptom_analysis': {
        'min_silhouette_score': 0.3,
        'max_inertia_ratio': 0.8,
        'min_cluster_separation': 0.5
    }
}

# Data preprocessing settings
PREPROCESSING_CONFIG = {
    'missing_value_threshold': 0.3,  # Drop columns with >30% missing values
    'outlier_threshold': 3,  # Z-score threshold for outlier detection
    'correlation_threshold': 0.95,  # Drop highly correlated features
    'variance_threshold': 0.01,  # Drop low variance features
    'test_size': 0.2,  # Train-test split ratio
    'validation_size': 0.2,  # Validation split ratio
    'random_state': 42
}

# Prediction confidence levels
CONFIDENCE_LEVELS = {
    'high': 0.8,
    'medium': 0.6,
    'low': 0.4
}

# Recommendation templates
RECOMMENDATION_TEMPLATES = {
    'pcos_risk': {
        'low': [
            "Maintain your current healthy lifestyle",
            "Continue regular exercise and balanced nutrition",
            "Monitor your cycle patterns regularly"
        ],
        'moderate': [
            "Consider consulting with a healthcare provider",
            "Focus on stress management and regular exercise",
            "Monitor symptoms and cycle irregularities"
        ],
        'high': [
            "Consult with a healthcare provider for evaluation",
            "Implement lifestyle changes including diet and exercise",
            "Consider tracking symptoms more closely"
        ],
        'very_high': [
            "Seek immediate consultation with a healthcare provider",
            "Implement comprehensive lifestyle modifications",
            "Consider medical evaluation and testing"
        ]
    },
    'cycle_prediction': {
        'irregular': [
            "Track your cycle more consistently",
            "Consider lifestyle factors affecting regularity",
            "Consult healthcare provider if irregularity persists"
        ],
        'regular': [
            "Continue current healthy habits",
            "Use predictions for family planning if desired",
            "Monitor for any changes in patterns"
        ]
    }
}

# File paths and directories
PATHS = {
    'data_dir': os.path.join(os.path.dirname(__file__), '..', 'data'),
    'models_dir': os.path.join(os.path.dirname(__file__), '..', 'models'),
    'logs_dir': os.path.join(os.path.dirname(__file__), '..', '..', 'logs'),
    'temp_dir': os.path.join(os.path.dirname(__file__), '..', '..', 'temp')
}

# Ensure directories exist
for path in PATHS.values():
    os.makedirs(path, exist_ok=True)

# Export commonly used constants
__all__ = [
    'MODEL_VERSIONS',
    'MODEL_PATHS',
    'FEATURE_COLUMNS',
    'SYMPTOM_TYPES',
    'PCOS_RISK_LEVELS',
    'CYCLE_PHASES',
    'VALIDATION_RANGES',
    'DEFAULT_HYPERPARAMETERS',
    'API_CONFIG',
    'PERFORMANCE_THRESHOLDS',
    'RECOMMENDATION_TEMPLATES'
]