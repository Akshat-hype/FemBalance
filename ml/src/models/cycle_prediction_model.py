"""
Menstrual Cycle Prediction Model.
"""

import numpy as np
import pandas as pd
import pickle
import logging
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from ..utils.constants import (
    FEATURE_COLUMNS, DEFAULT_HYPERPARAMETERS, CYCLE_PHASES,
    PERFORMANCE_THRESHOLDS, MODEL_PATHS
)

logger = logging.getLogger(__name__)

class CyclePredictionModel:
    """Menstrual Cycle Prediction Model using regression techniques."""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = FEATURE_COLUMNS['cycle_prediction']
        self.is_trained = False
        self.model_version = '1.0.0'
        self.training_metrics = {}
        
    def process_cycle_data(self, cycles: List[Dict[str, Any]]) -> pd.DataFrame:
        """Process raw cycle data into features."""
        try:
            if not cycles:
                raise ValueError("No cycle data provided")
            
            # Convert to DataFrame
            df = pd.DataFrame(cycles)
            
            # Convert dates
            df['start_date'] = pd.to_datetime(df['start_date'])
            
            # Sort by date
            df = df.sort_values('start_date').reset_index(drop=True)
            
            # Calculate cycle lengths if not provided
            if 'cycle_length' not in df.columns:
                df['cycle_length'] = df['start_date'].diff().dt.days
                df['cycle_length'] = df['cycle_length'].fillna(28)  # Default for first cycle
            
            # Fill missing period lengths
            if 'period_length' not in df.columns:
                df['period_length'] = 5  # Default period length
            else:
                df['period_length'] = df['period_length'].fillna(5)
            
            return df
            
        except Exception as e:
            logger.error(f"Cycle data processing failed: {str(e)}")
            raise ValueError(f"Cycle data processing failed: {str(e)}")
    
    def engineer_features(self, cycles: List[Dict[str, Any]]) -> Dict[str, float]:
        """Engineer features from cycle history."""
        try:
            df = self.process_cycle_data(cycles)
            
            if len(df) < 2:
                # Not enough data for meaningful features
                return {
                    'avg_cycle_length': 28.0,
                    'cycle_regularity': 0.5,
                    'avg_period_length': 5.0,
                    'trend_slope': 0.0,
                    'recent_avg': 28.0,
                    'season': self._get_season(datetime.now()),
                    'cycles_count': len(df)
                }
            
            # Basic statistics
            avg_cycle_length = df['cycle_length'].mean()
            avg_period_length = df['period_length'].mean()
            cycle_std = df['cycle_length'].std()
            
            # Regularity score (lower std = more regular)
            cycle_regularity = max(0, 1 - (cycle_std / 7))  # Normalize by 7 days
            
            # Trend analysis (recent vs older cycles)
            if len(df) >= 4:
                recent_cycles = df.tail(3)['cycle_length'].mean()
                older_cycles = df.head(-3)['cycle_length'].mean()
                trend_slope = (recent_cycles - older_cycles) / len(df)
            else:
                recent_cycles = avg_cycle_length
                trend_slope = 0.0
            
            # Seasonal factor
            last_date = df['start_date'].iloc[-1]
            season = self._get_season(last_date)
            
            # Time since last cycle
            days_since_last = (datetime.now() - last_date).days
            
            features = {
                'avg_cycle_length': float(avg_cycle_length),
                'cycle_regularity': float(cycle_regularity),
                'avg_period_length': float(avg_period_length),
                'trend_slope': float(trend_slope),
                'recent_avg': float(recent_cycles),
                'season': float(season),
                'cycles_count': len(df),
                'days_since_last': float(days_since_last),
                'cycle_std': float(cycle_std)
            }
            
            return features
            
        except Exception as e:
            logger.error(f"Feature engineering failed: {str(e)}")
            raise ValueError(f"Feature engineering failed: {str(e)}")
    
    def _get_season(self, date: datetime) -> int:
        """Get season as numeric value (0-3)."""
        month = date.month
        if month in [12, 1, 2]:
            return 0  # Winter
        elif month in [3, 4, 5]:
            return 1  # Spring
        elif month in [6, 7, 8]:
            return 2  # Summer
        else:
            return 3  # Fall
    
    def prepare_training_data(self, user_cycles: List[List[Dict]]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data from multiple users' cycle histories."""
        try:
            X_features = []
            y_targets = []
            
            for cycles in user_cycles:
                if len(cycles) < 3:  # Need at least 3 cycles
                    continue
                
                # Use first n-1 cycles to predict the nth cycle
                for i in range(2, len(cycles)):
                    history = cycles[:i]
                    target_cycle = cycles[i]
                    
                    # Engineer features from history
                    features = self.engineer_features(history)
                    
                    # Target is the next cycle length
                    target_length = target_cycle.get('cycle_length', 28)
                    
                    # Convert features to array
                    feature_array = [
                        features['avg_cycle_length'],
                        features['cycle_regularity'],
                        features['avg_period_length'],
                        features['trend_slope'],
                        features['recent_avg'],
                        features['season'],
                        features['cycles_count'],
                        features['days_since_last'],
                        features['cycle_std']
                    ]
                    
                    X_features.append(feature_array)
                    y_targets.append(target_length)
            
            if not X_features:
                raise ValueError("No training data could be prepared")
            
            return np.array(X_features), np.array(y_targets)
            
        except Exception as e:
            logger.error(f"Training data preparation failed: {str(e)}")
            raise ValueError(f"Training data preparation failed: {str(e)}")
    
    def train(self, user_cycles: List[List[Dict]], validation_split: float = 0.2):
        """Train the cycle prediction model."""
        try:
            logger.info("Starting cycle prediction model training...")
            
            # Prepare training data
            X, y = self.prepare_training_data(user_cycles)
            
            # Split data
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=validation_split, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_val_scaled = self.scaler.transform(X_val)
            
            # Train models
            rf_params = DEFAULT_HYPERPARAMETERS['cycle_prediction']['random_forest']
            lr_params = DEFAULT_HYPERPARAMETERS['cycle_prediction']['linear_regression']
            
            # Random Forest Regressor
            rf_model = RandomForestRegressor(**rf_params)
            rf_model.fit(X_train_scaled, y_train)
            
            # Linear Regression
            lr_model = LinearRegression(**lr_params)
            lr_model.fit(X_train_scaled, y_train)
            
            # Create ensemble
            self.model = {
                'random_forest': rf_model,
                'linear_regression': lr_model,
                'scaler': self.scaler
            }
            
            # Evaluate model
            self.training_metrics = self.evaluate(X_val_scaled, y_val)
            
            self.is_trained = True
            logger.info(f"Cycle prediction model training completed. MAE: {self.training_metrics['mae']:.2f} days")
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            raise RuntimeError(f"Model training failed: {str(e)}")
    
    def predict(self, cycles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict next menstrual cycle."""
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("Model is not trained")
            
            # Engineer features
            features = self.engineer_features(cycles)
            
            # Convert to array
            feature_array = np.array([[
                features['avg_cycle_length'],
                features['cycle_regularity'],
                features['avg_period_length'],
                features['trend_slope'],
                features['recent_avg'],
                features['season'],
                features['cycles_count'],
                features['days_since_last'],
                features['cycle_std']
            ]])
            
            # Scale features
            X_scaled = self.scaler.transform(feature_array)
            
            # Get predictions from both models
            rf_pred = self.model['random_forest'].predict(X_scaled)[0]
            lr_pred = self.model['linear_regression'].predict(X_scaled)[0]
            
            # Ensemble prediction (weighted average)
            # Give more weight to RF for non-linear patterns
            predicted_length = (0.7 * rf_pred + 0.3 * lr_pred)
            predicted_length = max(21, min(45, predicted_length))  # Clamp to reasonable range
            
            # Calculate next cycle start date
            last_cycle = max(cycles, key=lambda x: datetime.fromisoformat(x['start_date'].replace('Z', '+00:00')))
            last_start = datetime.fromisoformat(last_cycle['start_date'].replace('Z', '+00:00'))
            last_length = last_cycle.get('cycle_length', 28)
            
            predicted_start = last_start + timedelta(days=int(last_length))
            
            # Calculate confidence based on model agreement and regularity
            model_agreement = 1 - abs(rf_pred - lr_pred) / max(rf_pred, lr_pred, 1)
            regularity_confidence = features['cycle_regularity']
            confidence = (model_agreement + regularity_confidence) / 2
            
            # Calculate fertile window (ovulation typically 14 days before next period)
            ovulation_date = predicted_start + timedelta(days=int(predicted_length) - 14)
            fertile_start = ovulation_date - timedelta(days=5)
            fertile_end = ovulation_date + timedelta(days=1)
            
            result = {
                'predicted_start_date': predicted_start.isoformat(),
                'predicted_cycle_length': int(round(predicted_length)),
                'confidence': float(np.clip(confidence, 0.0, 1.0)),
                'fertile_window': {
                    'start': fertile_start.isoformat(),
                    'end': fertile_end.isoformat(),
                    'peak': ovulation_date.isoformat()
                },
                'cycle_phase_predictions': self._predict_cycle_phases(predicted_start, int(predicted_length)),
                'model_version': self.model_version,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise RuntimeError(f"Prediction failed: {str(e)}")
    
    def _predict_cycle_phases(self, start_date: datetime, cycle_length: int) -> Dict[str, Dict]:
        """Predict cycle phases for the upcoming cycle."""
        phases = {}
        
        # Menstrual phase (days 1-5)
        phases['menstrual'] = {
            'start': start_date.isoformat(),
            'end': (start_date + timedelta(days=5)).isoformat(),
            'description': 'Menstrual bleeding'
        }
        
        # Follicular phase (days 6-13)
        phases['follicular'] = {
            'start': (start_date + timedelta(days=6)).isoformat(),
            'end': (start_date + timedelta(days=13)).isoformat(),
            'description': 'Follicle development'
        }
        
        # Ovulation phase (around day 14)
        ovulation_day = cycle_length - 14
        phases['ovulation'] = {
            'start': (start_date + timedelta(days=ovulation_day-1)).isoformat(),
            'end': (start_date + timedelta(days=ovulation_day+1)).isoformat(),
            'description': 'Ovulation window'
        }
        
        # Luteal phase (day 15 to end)
        phases['luteal'] = {
            'start': (start_date + timedelta(days=ovulation_day+2)).isoformat(),
            'end': (start_date + timedelta(days=cycle_length)).isoformat(),
            'description': 'Post-ovulation phase'
        }
        
        return phases
    
    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """Evaluate model performance."""
        try:
            if not self.is_trained or self.model is None:
                raise ValueError("Model is not trained")
            
            # Get predictions from both models
            rf_pred = self.model['random_forest'].predict(X)
            lr_pred = self.model['linear_regression'].predict(X)
            
            # Ensemble prediction
            ensemble_pred = 0.7 * rf_pred + 0.3 * lr_pred
            
            # Calculate metrics
            metrics = {
                'mae': mean_absolute_error(y, ensemble_pred),
                'rmse': np.sqrt(mean_squared_error(y, ensemble_pred)),
                'r2_score': r2_score(y, ensemble_pred),
                'mape': np.mean(np.abs((y - ensemble_pred) / y)) * 100
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
            
            # Get importance from Random Forest
            rf_importance = self.model['random_forest'].feature_importances_
            
            feature_names = [
                'avg_cycle_length', 'cycle_regularity', 'avg_period_length',
                'trend_slope', 'recent_avg', 'season', 'cycles_count',
                'days_since_last', 'cycle_std'
            ]
            
            # Map to feature names
            importance_dict = {}
            for i, feature in enumerate(feature_names):
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
                filepath = MODEL_PATHS['cycle_prediction']
            
            model_data = {
                'model': self.model,
                'feature_columns': self.feature_columns,
                'training_metrics': self.training_metrics,
                'model_version': self.model_version,
                'trained_at': datetime.utcnow().isoformat()
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"Cycle prediction model saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Model saving failed: {str(e)}")
            raise RuntimeError(f"Model saving failed: {str(e)}")
    
    def load_model(self, filepath: str = None):
        """Load a trained model from disk."""
        try:
            if filepath is None:
                filepath = MODEL_PATHS['cycle_prediction']
            
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.feature_columns = model_data['feature_columns']
            self.training_metrics = model_data.get('training_metrics', {})
            self.model_version = model_data.get('model_version', '1.0.0')
            self.scaler = model_data['model']['scaler']
            self.is_trained = True
            
            logger.info(f"Cycle prediction model loaded from {filepath}")
            
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
            logger.info("Initializing default cycle prediction model...")
            
            # Create simple mock models
            from sklearn.dummy import DummyRegressor
            
            dummy_rf = DummyRegressor(strategy='mean')
            dummy_lr = DummyRegressor(strategy='mean')
            
            # Fit with dummy data
            X_dummy = np.random.rand(100, 9)  # 9 features
            y_dummy = np.random.normal(28, 3, 100)  # Cycle lengths around 28 days
            
            dummy_rf.fit(X_dummy, y_dummy)
            dummy_lr.fit(X_dummy, y_dummy)
            
            self.scaler.fit(X_dummy)
            
            self.model = {
                'random_forest': dummy_rf,
                'linear_regression': dummy_lr,
                'scaler': self.scaler
            }
            
            self.is_trained = True
            logger.info("Default cycle prediction model initialized")
            
        except Exception as e:
            logger.error(f"Default model initialization failed: {str(e)}")
            raise RuntimeError(f"Default model initialization failed: {str(e)}")