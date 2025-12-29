import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.model_selection import cross_val_score
from typing import Dict, Any, Tuple, Optional
import logging
import os

logger = logging.getLogger(__name__)

def load_model_safely(model_path: str) -> Optional[Any]:
    """
    Safely load a model from file
    
    Args:
        model_path: Path to the model file
        
    Returns:
        Loaded model or None if loading fails
    """
    try:
        if not os.path.exists(model_path):
            logger.warning(f"Model file not found: {model_path}")
            return None
        
        model = joblib.load(model_path)
        logger.info(f"Model loaded successfully from {model_path}")
        return model
    except Exception as e:
        logger.error(f"Failed to load model from {model_path}: {str(e)}")
        return None

def save_model_safely(model: Any, model_path: str) -> bool:
    """
    Safely save a model to file
    
    Args:
        model: Model object to save
        model_path: Path where to save the model
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        joblib.dump(model, model_path)
        logger.info(f"Model saved successfully to {model_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to save model to {model_path}: {str(e)}")
        return False

def evaluate_classification_model(model: Any, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
    """
    Evaluate a classification model and return metrics
    
    Args:
        model: Trained classification model
        X_test: Test features
        y_test: Test labels
        
    Returns:
        Dictionary of evaluation metrics
    """
    try:
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_test, y_pred, average='weighted', zero_division=0)
        }
        
        # Add AUC if probabilities are available
        if y_pred_proba is not None:
            try:
                metrics['roc_auc'] = roc_auc_score(y_test, y_pred_proba)
            except ValueError:
                # Handle case where only one class is present
                metrics['roc_auc'] = 0.5
        
        return metrics
    except Exception as e:
        logger.error(f"Error evaluating model: {str(e)}")
        return {}

def cross_validate_model(model: Any, X: np.ndarray, y: np.ndarray, cv: int = 5) -> Dict[str, float]:
    """
    Perform cross-validation on a model
    
    Args:
        model: Model to validate
        X: Features
        y: Labels
        cv: Number of cross-validation folds
        
    Returns:
        Dictionary of cross-validation metrics
    """
    try:
        # Perform cross-validation
        cv_scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
        
        metrics = {
            'cv_accuracy_mean': cv_scores.mean(),
            'cv_accuracy_std': cv_scores.std(),
            'cv_scores': cv_scores.tolist()
        }
        
        # Additional scoring metrics
        for scoring in ['precision_weighted', 'recall_weighted', 'f1_weighted']:
            try:
                scores = cross_val_score(model, X, y, cv=cv, scoring=scoring)
                metrics[f'cv_{scoring}_mean'] = scores.mean()
                metrics[f'cv_{scoring}_std'] = scores.std()
            except Exception:
                continue
        
        return metrics
    except Exception as e:
        logger.error(f"Error in cross-validation: {str(e)}")
        return {}

def calculate_feature_importance(model: Any, feature_names: list) -> Dict[str, float]:
    """
    Calculate and return feature importance
    
    Args:
        model: Trained model with feature_importances_ attribute
        feature_names: List of feature names
        
    Returns:
        Dictionary mapping feature names to importance scores
    """
    try:
        if not hasattr(model, 'feature_importances_'):
            logger.warning("Model does not have feature_importances_ attribute")
            return {}
        
        importance_dict = {}
        for name, importance in zip(feature_names, model.feature_importances_):
            importance_dict[name] = float(importance)
        
        # Sort by importance
        return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
    except Exception as e:
        logger.error(f"Error calculating feature importance: {str(e)}")
        return {}

def validate_model_input(X: np.ndarray, expected_features: int) -> bool:
    """
    Validate model input dimensions
    
    Args:
        X: Input features
        expected_features: Expected number of features
        
    Returns:
        True if valid, False otherwise
    """
    try:
        if not isinstance(X, np.ndarray):
            logger.error("Input must be a numpy array")
            return False
        
        if len(X.shape) != 2:
            logger.error(f"Input must be 2D array, got shape: {X.shape}")
            return False
        
        if X.shape[1] != expected_features:
            logger.error(f"Expected {expected_features} features, got {X.shape[1]}")
            return False
        
        # Check for NaN or infinite values
        if np.isnan(X).any() or np.isinf(X).any():
            logger.error("Input contains NaN or infinite values")
            return False
        
        return True
    except Exception as e:
        logger.error(f"Error validating input: {str(e)}")
        return False

def create_model_metadata(model: Any, training_data_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create metadata for a trained model
    
    Args:
        model: Trained model
        training_data_info: Information about training data
        
    Returns:
        Model metadata dictionary
    """
    metadata = {
        'model_type': type(model).__name__,
        'training_timestamp': pd.Timestamp.now().isoformat(),
        'training_samples': training_data_info.get('n_samples', 0),
        'feature_count': training_data_info.get('n_features', 0),
        'target_classes': training_data_info.get('classes', []),
        'hyperparameters': {}
    }
    
    # Extract hyperparameters if available
    try:
        if hasattr(model, 'get_params'):
            metadata['hyperparameters'] = model.get_params()
    except Exception:
        pass
    
    return metadata

def check_model_drift(current_predictions: np.ndarray, 
                     reference_predictions: np.ndarray,
                     threshold: float = 0.1) -> Dict[str, Any]:
    """
    Check for model drift by comparing prediction distributions
    
    Args:
        current_predictions: Recent model predictions
        reference_predictions: Reference predictions (e.g., from validation set)
        threshold: Drift detection threshold
        
    Returns:
        Drift detection results
    """
    try:
        from scipy import stats
        
        # Calculate KL divergence or other drift metrics
        # This is a simplified implementation
        current_mean = np.mean(current_predictions)
        reference_mean = np.mean(reference_predictions)
        
        drift_score = abs(current_mean - reference_mean)
        has_drift = drift_score > threshold
        
        # Statistical test
        statistic, p_value = stats.ks_2samp(current_predictions, reference_predictions)
        
        return {
            'has_drift': has_drift,
            'drift_score': float(drift_score),
            'threshold': threshold,
            'ks_statistic': float(statistic),
            'ks_p_value': float(p_value),
            'current_mean': float(current_mean),
            'reference_mean': float(reference_mean)
        }
    except Exception as e:
        logger.error(f"Error checking model drift: {str(e)}")
        return {'has_drift': False, 'error': str(e)}

def optimize_prediction_threshold(y_true: np.ndarray, 
                                y_pred_proba: np.ndarray,
                                metric: str = 'f1') -> Tuple[float, float]:
    """
    Optimize prediction threshold for binary classification
    
    Args:
        y_true: True labels
        y_pred_proba: Prediction probabilities
        metric: Metric to optimize ('f1', 'precision', 'recall')
        
    Returns:
        Tuple of (optimal_threshold, best_score)
    """
    try:
        from sklearn.metrics import precision_recall_curve, f1_score
        
        if metric == 'f1':
            # Find threshold that maximizes F1 score
            thresholds = np.arange(0.1, 1.0, 0.01)
            best_threshold = 0.5
            best_score = 0.0
            
            for threshold in thresholds:
                y_pred = (y_pred_proba >= threshold).astype(int)
                score = f1_score(y_true, y_pred)
                
                if score > best_score:
                    best_score = score
                    best_threshold = threshold
            
            return best_threshold, best_score
        
        elif metric in ['precision', 'recall']:
            precision, recall, thresholds = precision_recall_curve(y_true, y_pred_proba)
            
            if metric == 'precision':
                idx = np.argmax(precision)
                return thresholds[idx], precision[idx]
            else:  # recall
                idx = np.argmax(recall)
                return thresholds[idx], recall[idx]
        
        else:
            raise ValueError(f"Unsupported metric: {metric}")
    
    except Exception as e:
        logger.error(f"Error optimizing threshold: {str(e)}")
        return 0.5, 0.0