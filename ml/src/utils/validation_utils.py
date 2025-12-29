"""
Validation utilities for ML models and data processing.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple, Optional
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DataValidator:
    """Validates input data for ML models."""
    
    def __init__(self):
        self.required_fields = {
            'pcos_risk': ['age', 'bmi', 'cycle_length', 'period_length'],
            'cycle_prediction': ['start_date', 'cycle_length'],
            'symptom_analysis': ['type', 'severity', 'date']
        }
        
        self.valid_ranges = {
            'age': (12, 60),
            'bmi': (10, 50),
            'cycle_length': (21, 45),
            'period_length': (1, 10),
            'severity': (1, 10)
        }
        
        self.valid_categories = {
            'symptom_types': [
                'cramps', 'bloating', 'mood_swings', 'headache', 'fatigue',
                'acne', 'breast_tenderness', 'back_pain', 'nausea', 'other'
            ],
            'exercise_types': ['cardio', 'strength', 'flexibility', 'sports', 'mixed'],
            'meal_types': ['breakfast', 'lunch', 'dinner', 'snack'],
            'intensity_levels': ['low', 'medium', 'high', 'very-high']
        }
    
    def validate_pcos_input(self, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate input data for PCOS risk prediction."""
        errors = []
        
        # Check required fields
        for field in self.required_fields['pcos_risk']:
            if field not in data or data[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Validate ranges
        for field, (min_val, max_val) in self.valid_ranges.items():
            if field in data and data[field] is not None:
                try:
                    value = float(data[field])
                    if not min_val <= value <= max_val:
                        errors.append(f"{field} must be between {min_val} and {max_val}")
                except (ValueError, TypeError):
                    errors.append(f"{field} must be a valid number")
        
        # Validate symptoms if provided
        if 'symptoms' in data and data['symptoms']:
            for symptom in data['symptoms']:
                if symptom not in self.valid_categories['symptom_types']:
                    errors.append(f"Invalid symptom type: {symptom}")
        
        return len(errors) == 0, errors
    
    def validate_cycle_input(self, data: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
        """Validate input data for cycle prediction."""
        errors = []
        
        if not data or len(data) == 0:
            errors.append("At least one cycle is required")
            return False, errors
        
        for i, cycle in enumerate(data):
            # Check required fields
            for field in self.required_fields['cycle_prediction']:
                if field not in cycle or cycle[field] is None:
                    errors.append(f"Cycle {i+1}: Missing required field: {field}")
            
            # Validate date format
            if 'start_date' in cycle:
                try:
                    datetime.fromisoformat(cycle['start_date'].replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    errors.append(f"Cycle {i+1}: Invalid date format for start_date")
            
            # Validate cycle length
            if 'cycle_length' in cycle and cycle['cycle_length'] is not None:
                try:
                    length = int(cycle['cycle_length'])
                    min_val, max_val = self.valid_ranges['cycle_length']
                    if not min_val <= length <= max_val:
                        errors.append(f"Cycle {i+1}: cycle_length must be between {min_val} and {max_val}")
                except (ValueError, TypeError):
                    errors.append(f"Cycle {i+1}: cycle_length must be a valid integer")
        
        return len(errors) == 0, errors
    
    def validate_symptom_input(self, data: List[Dict[str, Any]]) -> Tuple[bool, List[str]]:
        """Validate input data for symptom analysis."""
        errors = []
        
        if not data or len(data) == 0:
            errors.append("At least one symptom is required")
            return False, errors
        
        for i, symptom in enumerate(data):
            # Check required fields
            for field in self.required_fields['symptom_analysis']:
                if field not in symptom or symptom[field] is None:
                    errors.append(f"Symptom {i+1}: Missing required field: {field}")
            
            # Validate symptom type
            if 'type' in symptom and symptom['type'] not in self.valid_categories['symptom_types']:
                errors.append(f"Symptom {i+1}: Invalid symptom type: {symptom['type']}")
            
            # Validate severity
            if 'severity' in symptom and symptom['severity'] is not None:
                try:
                    severity = float(symptom['severity'])
                    min_val, max_val = self.valid_ranges['severity']
                    if not min_val <= severity <= max_val:
                        errors.append(f"Symptom {i+1}: severity must be between {min_val} and {max_val}")
                except (ValueError, TypeError):
                    errors.append(f"Symptom {i+1}: severity must be a valid number")
            
            # Validate date
            if 'date' in symptom:
                try:
                    datetime.fromisoformat(symptom['date'].replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    errors.append(f"Symptom {i+1}: Invalid date format")
        
        return len(errors) == 0, errors
    
    def validate_model_output(self, output: Dict[str, Any], model_type: str) -> Tuple[bool, List[str]]:
        """Validate model output format."""
        errors = []
        
        if model_type == 'pcos_risk':
            required_fields = ['risk_score', 'risk_level', 'confidence']
            for field in required_fields:
                if field not in output:
                    errors.append(f"Missing required output field: {field}")
            
            # Validate risk score range
            if 'risk_score' in output:
                try:
                    score = float(output['risk_score'])
                    if not 0 <= score <= 1:
                        errors.append("risk_score must be between 0 and 1")
                except (ValueError, TypeError):
                    errors.append("risk_score must be a valid number")
        
        elif model_type == 'cycle_prediction':
            required_fields = ['predicted_start_date', 'predicted_cycle_length', 'confidence']
            for field in required_fields:
                if field not in output:
                    errors.append(f"Missing required output field: {field}")
        
        return len(errors) == 0, errors

class ModelValidator:
    """Validates ML model performance and outputs."""
    
    def __init__(self):
        self.performance_thresholds = {
            'pcos_risk': {
                'min_accuracy': 0.75,
                'min_precision': 0.70,
                'min_recall': 0.70,
                'min_f1': 0.70
            },
            'cycle_prediction': {
                'max_mae': 2.0,  # Maximum Mean Absolute Error in days
                'max_rmse': 3.0,  # Maximum Root Mean Square Error
                'min_r2': 0.60   # Minimum R-squared score
            }
        }
    
    def validate_model_performance(self, metrics: Dict[str, float], model_type: str) -> Tuple[bool, List[str]]:
        """Validate model performance against thresholds."""
        errors = []
        
        if model_type not in self.performance_thresholds:
            errors.append(f"Unknown model type: {model_type}")
            return False, errors
        
        thresholds = self.performance_thresholds[model_type]
        
        for metric, threshold in thresholds.items():
            if metric not in metrics:
                errors.append(f"Missing performance metric: {metric}")
                continue
            
            value = metrics[metric]
            
            if metric.startswith('min_') and value < threshold:
                metric_name = metric.replace('min_', '')
                errors.append(f"{metric_name} ({value:.3f}) is below minimum threshold ({threshold})")
            elif metric.startswith('max_') and value > threshold:
                metric_name = metric.replace('max_', '')
                errors.append(f"{metric_name} ({value:.3f}) exceeds maximum threshold ({threshold})")
        
        return len(errors) == 0, errors
    
    def validate_prediction_consistency(self, predictions: List[Any]) -> Tuple[bool, List[str]]:
        """Validate consistency of model predictions."""
        errors = []
        
        if not predictions:
            errors.append("No predictions to validate")
            return False, errors
        
        # Check for NaN or infinite values
        for i, pred in enumerate(predictions):
            if isinstance(pred, (int, float)):
                if np.isnan(pred) or np.isinf(pred):
                    errors.append(f"Prediction {i+1} contains invalid value: {pred}")
            elif isinstance(pred, dict):
                for key, value in pred.items():
                    if isinstance(value, (int, float)) and (np.isnan(value) or np.isinf(value)):
                        errors.append(f"Prediction {i+1}, field '{key}' contains invalid value: {value}")
        
        return len(errors) == 0, errors

def sanitize_input_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize input data by removing invalid values and normalizing."""
    sanitized = {}
    
    for key, value in data.items():
        if value is None:
            continue
        
        # Handle numeric values
        if isinstance(value, (int, float)):
            if np.isnan(value) or np.isinf(value):
                continue
            sanitized[key] = float(value)
        
        # Handle strings
        elif isinstance(value, str):
            cleaned = value.strip().lower()
            if cleaned:
                sanitized[key] = cleaned
        
        # Handle lists
        elif isinstance(value, list):
            cleaned_list = [item for item in value if item is not None and str(item).strip()]
            if cleaned_list:
                sanitized[key] = cleaned_list
        
        # Handle dictionaries
        elif isinstance(value, dict):
            cleaned_dict = sanitize_input_data(value)
            if cleaned_dict:
                sanitized[key] = cleaned_dict
        
        else:
            sanitized[key] = value
    
    return sanitized

def validate_date_range(start_date: str, end_date: str, max_days: int = 365) -> Tuple[bool, str]:
    """Validate date range for data queries."""
    try:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        if start >= end:
            return False, "Start date must be before end date"
        
        if (end - start).days > max_days:
            return False, f"Date range cannot exceed {max_days} days"
        
        # Check if dates are not too far in the future
        if start > datetime.now() + timedelta(days=30):
            return False, "Start date cannot be more than 30 days in the future"
        
        return True, ""
    
    except ValueError as e:
        return False, f"Invalid date format: {str(e)}"

def log_validation_error(error_type: str, errors: List[str], data_sample: Optional[Dict] = None):
    """Log validation errors for monitoring and debugging."""
    logger.error(f"Validation failed - {error_type}")
    for error in errors:
        logger.error(f"  - {error}")
    
    if data_sample:
        logger.debug(f"Data sample: {data_sample}")

# Export main validator instances
data_validator = DataValidator()
model_validator = ModelValidator()