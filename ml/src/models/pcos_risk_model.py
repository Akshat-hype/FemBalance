"""
PCOS Risk Prediction Model.
"""

import numpy as np
import pandas as pd
import pickle
import logging
from typing import Dict, Any, List, Tuple, Optional
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from datetime import datetime

from ..utils.constants import (
    FEATURE_COLUMNS, DEFAULT_HYPERPARAMETERS, PCOS_RISK_LEVELS,
    PERFORMANCE_THRESHOLDS, MODEL_PATHS
)

logger = logging.getLogger(__name__)

class PCOSRiskModel:
    """PCOS Risk Prediction Model using ensemble methods."""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = FEATURE_COLUMNS['pcos_risk']
        self.is_trained = False
        self.model_version = '1.0.0'
        self.training_metrics = {}
        
    def preprocess_data(self, data: pd.DataFrame) -> np.ndarray:
        """Preprocess input data for model training/prediction."""
        try:
            # Ensure all required columns are present
            missing_cols = set(self.feature_columns) - set(data.columns)
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            # Select and order features
            processed_data = data[self.feature_columns].copy()
            
            # Handle missing values
            processed_data = processed_data.fillna(processed_data.median())
            
            # Convert boolean columns to numeric
            bool_columns = processed_data.select_dtypes(include=['bool']).columns
            processed_data[bool_columns] = processed_data[bool_columns].astype(int)
            
            # Ensure all data is numeric
            processed_data = processed_data.select_dtypes(include=[np.number])
            
            return processed_data.values
            
        except Exception as e:
            logger.error(f"Data preprocessing failed: {str(e)}")
            raise ValueError(f"Data preprocessing failed: {str(e)}")
    
    def engineer_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Engineer additional features for PCOS prediction."""
        try:
            engineered_data = data.copy()
            
            # BMI categories
            engineered_data['bmi_category'] = pd.cut(
                engineered_data['bmi'],
                bins=[0, 18.5, 25, 30, 100],
                labels=[0, 1, 2, 3]  # underweight, normal, overweight, obese
            ).astype(float)
            
            # Cycle irregularity indicator
            engineered_data['cycle_irregular'] = (
                (engineered_data['cycle_length'] < 21) | 
                (engineered_data['cycle_length'] > 35)
            ).astype(int)
            
            # Period length category
            engineered_data['period_category'] = pd.cut(
                engineered_data['period_length'],
                bins=[0, 3, 7, 15],
                labels=[0, 1, 2]  # short, normal, long
            ).astype(float)
            
            # Lifestyle risk score
            engineered_data['lifestyle_risk'] = (
                (engineered_data['exercise_frequency'] < 2).astype(int) +
                (engineered_data['stress_level'] > 3).astype(int) +
                (engineered_data['sleep_quality'] < 3).astype(int)
            )
            
            # Age groups
            engineered_data['age_group'] = pd.cut(
                engineered_data['age'],
                bins=[0, 18, 25, 35, 100],
                labels=[0, 1, 2, 3]  # teen, young_adult, adult, mature
            ).astype(float)
            
            # Update feature columns to include engineered features
            new_features = ['bmi_category', 'cycle_irregular', 'period_category', 
                          'lifestyle_risk', 'age_group']
            self.feature_columns = self.feature_columns + new_features
            
            return engineered_data
            
        except Exception as e:
            logger.error(f"Feature engineering failed: {str(e)}")
            return data
    
    def train(self, X: pd.DataFrame, y: np.ndarray, validation_split: float = 0.2):
        """Train the PCOS risk prediction model."""
        try:
            logger.info("Starting PCOS risk model training...")
            
            # Engineer features
            X_engineered = self.engineer_features(X)
            
            # Preprocess data
            X_processed = self.preprocess_data(X_engineered)
            
            # Split data
            X_train, X_val, y_train, y_val = train_test_split(
                X_processed, y, test_size=validation_split, random_state=42, stratify=y
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_val_scaled = self.scaler.transform(X_val)
            
            # Train ensemble model
            rf_params = DEFAULT_HYPERPARAMETERS['pcos_risk']['random_forest']
            gb_params = DEFAULT_HYPERPARAMETERS['pcos_risk']['gradient_boosting']
            
            # Random Forest
            rf_model = RandomForestClassifier(**rf_params)
            rf_model.fit(X_train_scaled, y_train)
            
            # Gradient Boosting
            gb_model = GradientBoostingClassifier(**gb_params)
            gb_model.fit(X_train_scaled, y_train)
            
            # Create ensemble (simple voting)
            self.model = {
                'random_forest': rf_model,
                'gradient_boosting': gb_model,
                'scaler': self.scaler
            }
            
            # Evaluate model
            self.training_metrics = self.evaluate(X_val_scaled, y_val)
            
            self.is_trained = True
            logger.info(f"PCOS risk model training completed. Accuracy: {self.training_metrics['accuracy']:.3f}")
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            raise RuntimeError(f"Model training failed: {str(e)}")
    
    def predict(self, X: pd.DataFrame) -> Dict[str, Any]:
        """Make PCOS risk predictions."""
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("Model is not trained")
            
            # Engineer features
            X_engineered = self.engineer_features(X)
            
            # Preprocess data
            X_processed = self.preprocess_data(X_engineered)
            
            # Scale features
            X_scaled = self.scaler.transform(X_processed)
            
            # Get predictions from both models
            rf_proba = self.model['random_forest'].predict_proba(X_scaled)[:, 1]
            gb_proba = self.model['gradient_boosting'].predict_proba(X_scaled)[:, 1]
            
            # Ensemble prediction (average)
            risk_scores = (rf_proba + gb_proba) / 2
            
            # For single prediction, return scalar values
            if len(risk_scores) == 1:
                risk_score = float(risk_scores[0])
                risk_level = self._get_risk_level(risk_score)
                confidence = self._calculate_confidence(rf_proba[0], gb_proba[0])
                
                return {
                    'risk_score': risk_score,
                    'risk_level': risk_level,
                    'confidence': confidence,
                    'factors': self._get_risk_factors(X_engineered.iloc[0]),
                    'model_version': self.model_version,
                    'timestamp': datetime.utcnow().isoformat()
                }
            
            # For batch predictions
            results = []
            for i, score in enumerate(risk_scores):
                results.append({
                    'risk_score': float(score),
                    'risk_level': self._get_risk_level(score),
                    'confidence': self._calculate_confidence(rf_proba[i], gb_proba[i])
                })
            
            return {'predictions': results}
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise RuntimeError(f"Prediction failed: {str(e)}")
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level."""
        for level, (min_score, max_score) in PCOS_RISK_LEVELS.items():
            if min_score <= risk_score < max_score:
                return level
        return 'very_high'  # Default for scores >= 0.8
    
    def _calculate_confidence(self, rf_proba: float, gb_proba: float) -> float:
        """Calculate prediction confidence based on model agreement."""
        # Higher confidence when models agree
        agreement = 1 - abs(rf_proba - gb_proba)
        # Also consider how far from decision boundary (0.5)
        certainty = abs(((rf_proba + gb_proba) / 2) - 0.5) * 2
        
        confidence = (agreement + certainty) / 2
        return float(np.clip(confidence, 0.0, 1.0))
    
    def _get_risk_factors(self, sample: pd.Series) -> List[str]:
        """Identify key risk factors for a sample."""
        risk_factors = []
        
        if sample.get('bmi', 0) > 25:
            risk_factors.append('elevated_bmi')
        
        if sample.get('cycle_length', 28) > 35 or sample.get('cycle_length', 28) < 21:
            risk_factors.append('irregular_cycles')
        
        if sample.get('family_history', 0) == 1:
            risk_factors.append('family_history')
        
        if sample.get('exercise_frequency', 3) < 2:
            risk_factors.append('low_exercise')
        
        if sample.get('stress_level', 2) > 3:
            risk_factors.append('high_stress')
        
        if sample.get('sleep_quality', 3) < 3:
            risk_factors.append('poor_sleep')
        
        return risk_factors
    
    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """Evaluate model performance."""
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("Model is not trained")
            
            # Get predictions from both models
            rf_pred = self.model['random_forest'].predict(X)
            gb_pred = self.model['gradient_boosting'].predict(X)
            
            # Ensemble prediction (majority vote)
            ensemble_pred = ((rf_pred + gb_pred) >= 1).astype(int)
            
            # Get probabilities for AUC
            rf_proba = self.model['random_forest'].predict_proba(X)[:, 1]
            gb_proba = self.model['gradient_boosting'].predict_proba(X)[:, 1]
            ensemble_proba = (rf_proba + gb_proba) / 2
            
            # Calculate metrics
            metrics = {
                'accuracy': accuracy_score(y, ensemble_pred),
                'precision': precision_score(y, ensemble_pred, average='weighted'),
                'recall': recall_score(y, ensemble_pred, average='weighted'),
                'f1_score': f1_score(y, ensemble_pred, average='weighted'),
                'auc_roc': roc_auc_score(y, ensemble_proba)
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Model evaluation failed: {str(e)}")
            return {}
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from the trained model."""
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("Model is not trained")
            
            # Get importance from Random Forest (more interpretable)
            rf_importance = self.model['random_forest'].feature_importances_
            
            # Map to feature names
            importance_dict = {}
            for i, feature in enumerate(self.feature_columns):
                if i < len(rf_importance):
                    importance_dict[feature] = float(rf_importance[i])
            
            # Sort by importance
            sorted_importance = dict(sorted(importance_dict.items(), 
                                         key=lambda x: x[1], reverse=True))
            
            return sorted_importance
            
        except Exception as e:
            logger.error(f"Feature importance calculation failed: {str(e)}")
            return {}
    
    def save_model(self, filepath: str = None):
        """Save the trained model to disk."""
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("No trained model to save")
            
            if filepath is None:
                filepath = MODEL_PATHS['pcos_risk']
            
            model_data = {
                'model': self.model,
                'feature_columns': self.feature_columns,
                'training_metrics': self.training_metrics,
                'model_version': self.model_version,
                'trained_at': datetime.utcnow().isoformat()
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"PCOS risk model saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Model saving failed: {str(e)}")
            raise RuntimeError(f"Model saving failed: {str(e)}")
    
    def load_model(self, filepath: str = None):
        """Load a trained model from disk."""
        try:
            if filepath is None:
                filepath = MODEL_PATHS['pcos_risk']
            
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.feature_columns = model_data['feature_columns']
            self.training_metrics = model_data.get('training_metrics', {})
            self.model_version = model_data.get('model_version', '1.0.0')
            self.scaler = model_data['model']['scaler']
            self.is_trained = True
            
            logger.info(f"PCOS risk model loaded from {filepath}")
            
        except FileNotFoundError:
            logger.warning(f"Model file not found: {filepath}")
            # Initialize with default model for development
            self._initialize_default_model()
        except Exception as e:
            logger.error(f"Model loading failed: {str(e)}")
            raise RuntimeError(f"Model loading failed: {str(e)}")
    
    def _initialize_default_model(self):
        """Initialize a default model for development/testing."""
        try:
            logger.info("Initializing default PCOS risk model...")
            
            # Create simple mock models
            from sklearn.dummy import DummyClassifier
            
            dummy_rf = DummyClassifier(strategy='stratified', random_state=42)
            dummy_gb = DummyClassifier(strategy='stratified', random_state=42)
            
            # Fit with dummy data
            X_dummy = np.random.rand(100, len(self.feature_columns))
            y_dummy = np.random.randint(0, 2, 100)
            
            dummy_rf.fit(X_dummy, y_dummy)
            dummy_gb.fit(X_dummy, y_dummy)
            
            self.scaler.fit(X_dummy)
            
            self.model = {
                'random_forest': dummy_rf,
                'gradient_boosting': dummy_gb,
                'scaler': self.scaler
            }
            
            self.is_trained = True
            logger.info("Default PCOS risk model initialized")
            
        except Exception as e:
            logger.error(f"Default model initialization failed: {str(e)}")
            raise RuntimeError(f"Default model initialization failed: {str(e)}")