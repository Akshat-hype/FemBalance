import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

def validate_input_data(data: Dict[str, Any], prediction_type: str) -> Dict[str, Any]:
    """
    Validate input data for ML predictions
    
    Args:
        data: Input data dictionary
        prediction_type: Type of prediction ('pcos_prediction', 'cycle_prediction')
        
    Returns:
        Validation result with 'valid' boolean and 'errors' list
    """
    errors = []
    
    # Common validations
    if not isinstance(data, dict):
        errors.append("Input data must be a dictionary")
        return {'valid': False, 'errors': errors}
    
    if 'user_id' not in data:
        errors.append("user_id is required")
    
    # Prediction-specific validations
    if prediction_type == 'pcos_prediction':
        errors.extend(_validate_pcos_data(data))
    elif prediction_type == 'cycle_prediction':
        errors.extend(_validate_cycle_data(data))
    
    return {
        'valid': len(errors) == 0,
        'errors': errors
    }

def _validate_pcos_data(data: Dict[str, Any]) -> List[str]:
    """Validate PCOS prediction input data"""
    errors = []
    
    # Validate cycles
    cycles = data.get('cycles', [])
    if not isinstance(cycles, list):
        errors.append("cycles must be a list")
    elif len(cycles) == 0:
        errors.append("At least one cycle is required")
    else:
        for i, cycle in enumerate(cycles):
            if not isinstance(cycle, dict):
                errors.append(f"cycle[{i}] must be a dictionary")
                continue
            
            if 'cycle_length' not in cycle:
                errors.append(f"cycle[{i}] missing cycle_length")
            elif not isinstance(cycle['cycle_length'], (int, float)) or cycle['cycle_length'] < 15 or cycle['cycle_length'] > 45:
                errors.append(f"cycle[{i}] cycle_length must be between 15-45 days")
    
    # Validate symptoms
    symptoms = data.get('symptoms', {})
    if not isinstance(symptoms, dict):
        errors.append("symptoms must be a dictionary")
    else:
        # Validate symptom ranges
        for symptom, value in symptoms.items():
            if symptom in ['acne', 'mood_changes', 'fatigue', 'cramps']:
                if not isinstance(value, (int, float)) or value < 0 or value > 5:
                    errors.append(f"symptoms.{symptom} must be between 0-5")
            elif symptom in ['weight_gain', 'hair_loss', 'excessive_hair_growth']:
                if not isinstance(value, bool):
                    errors.append(f"symptoms.{symptom} must be a boolean")
    
    # Validate lifestyle
    lifestyle = data.get('lifestyle', {})
    if not isinstance(lifestyle, dict):
        errors.append("lifestyle must be a dictionary")
    else:
        if 'bmi' in lifestyle:
            bmi = lifestyle['bmi']
            if not isinstance(bmi, (int, float)) or bmi < 10 or bmi > 50:
                errors.append("lifestyle.bmi must be between 10-50")
        
        if 'exercise_frequency' in lifestyle:
            freq = lifestyle['exercise_frequency']
            if not isinstance(freq, (int, float)) or freq < 0 or freq > 7:
                errors.append("lifestyle.exercise_frequency must be between 0-7")
    
    # Validate age
    age = data.get('age')
    if age is not None:
        if not isinstance(age, (int, float)) or age < 12 or age > 50:
            errors.append("age must be between 12-50")
    
    return errors

def _validate_cycle_data(data: Dict[str, Any]) -> List[str]:
    """Validate cycle prediction input data"""
    errors = []
    
    cycles = data.get('cycles', [])
    if not isinstance(cycles, list):
        errors.append("cycles must be a list")
    elif len(cycles) < 3:
        errors.append("At least 3 cycles are required for prediction")
    
    current_date = data.get('current_date')
    if not current_date:
        errors.append("current_date is required")
    else:
        try:
            if isinstance(current_date, str):
                datetime.fromisoformat(current_date.replace('Z', '+00:00'))
        except ValueError:
            errors.append("current_date must be a valid ISO date string")
    
    return errors

def preprocess_features(data: Dict[str, Any], feature_type: str) -> np.ndarray:
    """
    Preprocess input data into feature array for ML models
    
    Args:
        data: Input data dictionary
        feature_type: Type of features ('pcos', 'cycle')
        
    Returns:
        Preprocessed feature array
    """
    if feature_type == 'pcos':
        return _preprocess_pcos_features(data)
    elif feature_type == 'cycle':
        return _preprocess_cycle_features(data)
    else:
        raise ValueError(f"Unknown feature type: {feature_type}")

def _preprocess_pcos_features(data: Dict[str, Any]) -> np.ndarray:
    """Preprocess PCOS prediction features"""
    features = []
    
    # Cycle features
    cycles = data.get('cycles', [])
    if cycles:
        cycle_lengths = [c.get('cycle_length', 28) for c in cycles]
        period_lengths = [c.get('period_length', 5) for c in cycles if c.get('period_length')]
        
        features.extend([
            np.mean(cycle_lengths),
            np.std(cycle_lengths) if len(cycle_lengths) > 1 else 0,
            np.min(cycle_lengths),
            np.max(cycle_lengths),
            np.mean(period_lengths) if period_lengths else 5,
            np.std(period_lengths) if len(period_lengths) > 1 else 0,
            sum(1 for length in cycle_lengths if length > 35),  # Long cycles
            sum(1 for length in cycle_lengths if length < 21),  # Short cycles
        ])
    else:
        features.extend([28, 0, 28, 28, 5, 0, 0, 0])  # Default values
    
    # Symptom features
    symptoms = data.get('symptoms', {})
    features.extend([
        symptoms.get('acne', 0),
        int(symptoms.get('weight_gain', False)),
        int(symptoms.get('hair_loss', False)),
        int(symptoms.get('excessive_hair_growth', False)),
        symptoms.get('mood_changes', 0),
        symptoms.get('fatigue', 0),
        symptoms.get('cramps', 0),
    ])
    
    # Lifestyle features
    lifestyle = data.get('lifestyle', {})
    features.extend([
        lifestyle.get('bmi', 22.0),
        lifestyle.get('exercise_frequency', 3),
        lifestyle.get('stress_level', 5),
        lifestyle.get('sleep_hours', 7.0),
        lifestyle.get('diet_quality', 3),
    ])
    
    # Age
    features.append(data.get('age', 25))
    
    return np.array(features).reshape(1, -1)

def _preprocess_cycle_features(data: Dict[str, Any]) -> np.ndarray:
    """Preprocess cycle prediction features"""
    features = []
    
    cycles = data.get('cycles', [])
    if cycles:
        cycle_lengths = [c.get('cycle_length', 28) for c in cycles]
        
        # Statistical features
        features.extend([
            np.mean(cycle_lengths),
            np.std(cycle_lengths) if len(cycle_lengths) > 1 else 0,
            np.median(cycle_lengths),
            len(cycle_lengths),
        ])
        
        # Recent cycle features (last 3 cycles)
        recent_cycles = cycle_lengths[:3]
        features.extend(recent_cycles + [28] * (3 - len(recent_cycles)))  # Pad with average
        
        # Trend features
        if len(cycle_lengths) >= 3:
            # Simple trend: difference between recent and older cycles
            recent_avg = np.mean(cycle_lengths[:3])
            older_avg = np.mean(cycle_lengths[3:6]) if len(cycle_lengths) > 3 else recent_avg
            features.append(recent_avg - older_avg)
        else:
            features.append(0)
    else:
        features.extend([28, 0, 28, 0, 28, 28, 28, 0])  # Default values
    
    return np.array(features).reshape(1, -1)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and preprocess training data
    
    Args:
        df: Raw training data DataFrame
        
    Returns:
        Cleaned DataFrame
    """
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Handle missing values
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())
    
    # Handle categorical columns
    categorical_columns = df.select_dtypes(include=['object']).columns
    for col in categorical_columns:
        df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'unknown')
    
    # Remove outliers using IQR method
    for col in numeric_columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
    
    return df

def create_synthetic_data(n_samples: int = 1000) -> pd.DataFrame:
    """
    Create synthetic training data for PCOS prediction
    This is a placeholder - in production, use real anonymized data
    """
    np.random.seed(42)
    
    data = []
    for i in range(n_samples):
        # Generate base features
        age = np.random.normal(25, 5)
        age = max(16, min(40, age))
        
        bmi = np.random.normal(24, 4)
        bmi = max(18, min(40, bmi))
        
        # Generate cycle features
        has_pcos = np.random.random() < 0.15  # 15% prevalence
        
        if has_pcos:
            avg_cycle_length = np.random.normal(38, 8)
            cycle_variability = np.random.normal(10, 3)
        else:
            avg_cycle_length = np.random.normal(28, 3)
            cycle_variability = np.random.normal(3, 1)
        
        avg_cycle_length = max(21, min(45, avg_cycle_length))
        cycle_variability = max(0, cycle_variability)
        
        # Generate symptoms based on PCOS status
        if has_pcos:
            acne = np.random.choice([2, 3, 4, 5], p=[0.3, 0.3, 0.3, 0.1])
            excessive_hair = np.random.choice([0, 1], p=[0.4, 0.6])
            hair_loss = np.random.choice([0, 1], p=[0.6, 0.4])
            weight_gain = np.random.choice([0, 1], p=[0.3, 0.7])
        else:
            acne = np.random.choice([0, 1, 2, 3], p=[0.4, 0.3, 0.2, 0.1])
            excessive_hair = np.random.choice([0, 1], p=[0.9, 0.1])
            hair_loss = np.random.choice([0, 1], p=[0.95, 0.05])
            weight_gain = np.random.choice([0, 1], p=[0.8, 0.2])
        
        data.append({
            'age': age,
            'bmi': bmi,
            'avg_cycle_length': avg_cycle_length,
            'cycle_variability': cycle_variability,
            'acne': acne,
            'excessive_hair_growth': excessive_hair,
            'hair_loss': hair_loss,
            'weight_gain': weight_gain,
            'exercise_frequency': np.random.randint(0, 8),
            'stress_level': np.random.randint(0, 11),
            'has_pcos': int(has_pcos)
        })
    
    return pd.DataFrame(data)