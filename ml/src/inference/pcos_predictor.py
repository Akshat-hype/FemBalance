"""
PCOS Risk Predictor for inference.
"""

import logging
from typing import Dict, Any, Optional
import pandas as pd

from ..models.pcos_risk_model import PCOSRiskModel
from ..utils.validation_utils import data_validator, sanitize_input_data

logger = logging.getLogger(__name__)

class PCOSPredictor:
    """PCOS Risk Predictor wrapper for API inference."""
    
    def __init__(self):
        self.model = PCOSRiskModel()
        self._loaded = False
    
    def load_model(self, model_path: Optional[str] = None):
        """Load the PCOS risk prediction model."""
        try:
            self.model.load_model(model_path)
            self._loaded = True
            logger.info("PCOS predictor loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load PCOS predictor: {str(e)}")
            self._loaded = False
            raise
    
    def is_loaded(self) -> bool:
        """Check if the model is loaded and ready."""
        return self._loaded and self.model.is_trained
    
    def predict(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict PCOS risk for a user."""
        try:
            if not self.is_loaded():
                raise RuntimeError("PCOS predictor is not loaded")
            
            # Sanitize input data
            sanitized_data = sanitize_input_data(user_data)
            
            # Validate input data
            is_valid, errors = data_validator.validate_pcos_input(sanitized_data)
            if not is_valid:
                raise ValueError(f"Invalid input data: {errors}")
            
            # Convert to DataFrame
            df = pd.DataFrame([sanitized_data])
            
            # Make prediction
            prediction = self.model.predict(df)
            
            logger.info(f"PCOS risk prediction completed: {prediction['risk_level']}")
            return prediction
            
        except Exception as e:
            logger.error(f"PCOS prediction failed: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        try:
            if not self.is_loaded():
                return {
                    'loaded': False,
                    'message': 'Model not loaded'
                }
            
            feature_importance = self.model.get_feature_importance()
            
            return {
                'loaded': True,
                'model_version': self.model.model_version,
                'feature_columns': self.model.feature_columns,
                'feature_importance': feature_importance,
                'training_metrics': self.model.training_metrics
            }
            
        except Exception as e:
            logger.error(f"Failed to get model info: {str(e)}")
            return {
                'loaded': False,
                'error': str(e)
            }