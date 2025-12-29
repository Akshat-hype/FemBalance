"""
Cycle Predictor for inference.
"""

import logging
from typing import Dict, Any, List, Optional

from ..models.cycle_prediction_model import CyclePredictionModel
from ..utils.validation_utils import data_validator

logger = logging.getLogger(__name__)

class CyclePredictor:
    """Cycle Predictor wrapper for API inference."""
    
    def __init__(self):
        self.model = CyclePredictionModel()
        self._loaded = False
    
    def load_model(self, model_path: Optional[str] = None):
        """Load the cycle prediction model."""
        try:
            self.model.load_model(model_path)
            self._loaded = True
            logger.info("Cycle predictor loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load cycle predictor: {str(e)}")
            self._loaded = False
            raise
    
    def is_loaded(self) -> bool:
        """Check if the model is loaded and ready."""
        return self._loaded and self.model.is_trained
    
    def predict(self, cycle_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict next menstrual cycle."""
        try:
            if not self.is_loaded():
                raise RuntimeError("Cycle predictor is not loaded")
            
            # Validate input data
            is_valid, errors = data_validator.validate_cycle_input(cycle_history)
            if not is_valid:
                raise ValueError(f"Invalid cycle data: {errors}")
            
            # Make prediction
            prediction = self.model.predict(cycle_history)
            
            logger.info(f"Cycle prediction completed: {prediction['predicted_cycle_length']} days")
            return prediction
            
        except Exception as e:
            logger.error(f"Cycle prediction failed: {str(e)}")
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