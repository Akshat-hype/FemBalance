"""
Training script for cycle prediction model
"""

import pandas as pd
import numpy as np
import logging
import joblib
import argparse
from datetime import datetime
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Add parent directory to path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from models.cycle_prediction_model import CyclePredictionModel
from data.preprocessing.data_cleaner import DataCleaner
from data.preprocessing.feature_engineer import FeatureEngineer
from data.preprocessing.data_validator import DataValidator
from utils.data_utils import load_data, save_model_artifacts
from utils.model_utils import evaluate_regression_model
from utils.constants import MODEL_PATHS, DATA_PATHS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CycleModelTrainer:
    """
    Trainer class for cycle prediction model
    """
    
    def __init__(self, config: dict = None):
        self.config = config or self._get_default_config()
        self.model = CyclePredictionModel()
        self.data_cleaner = DataCleaner()
        self.feature_engineer = FeatureEngineer()
        self.data_validator = DataValidator()
        
        # Create output directories
        Path(MODEL_PATHS['cycle_model']).parent.mkdir(parents=True, exist_ok=True)
        Path(DATA_PATHS['processed']).mkdir(parents=True, exist_ok=True)
    
    def _get_default_config(self) -> dict:
        """Get default training configuration"""
        return {
            'test_size': 0.2,
            'validation_size': 0.2,
            'random_state': 42,
            'cv_folds': 5,
            'feature_selection_k': 20,
            'model_params': {
                'n_estimators': 100,
                'max_depth': 10,
                'min_samples_split': 5,
                'min_samples_leaf': 2,
                'random_state': 42
            }
        }
    
    def load_and_prepare_data(self) -> tuple:
        """
        Load and prepare training data
        
        Returns:
            Tuple of (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        try:
            logger.info("Loading cycle data...")
            
            # Load cycle data
            cycle_data = load_data('cycle_data')
            user_data = load_data('user_data')
            
            if cycle_data.empty:
                raise ValueError("No cycle data available for training")
            
            logger.info(f"Loaded {len(cycle_data)} cycle records")
            
            # Validate data
            cycle_validation = self.data_validator.validate_dataframe(cycle_data, 'cycle_data')
            if not cycle_validation['valid']:
                logger.warning(f"Cycle data validation issues: {cycle_validation['errors']}")
            
            # Clean data
            cycle_data_clean = self.data_cleaner.clean_cycle_data(cycle_data)
            
            # Merge with user data if available
            if not user_data.empty:
                user_data_clean = self.data_cleaner.clean_user_data(user_data)
                cycle_data_clean = cycle_data_clean.merge(
                    user_data_clean[['userId', 'age', 'height', 'weight', 'activityLevel']], 
                    on='userId', 
                    how='left'
                )
            
            # Feature engineering
            features_df = self.feature_engineer.create_cycle_features(cycle_data_clean)
            
            # Prepare features and targets
            X, y = self._prepare_features_and_targets(features_df)
            
            if len(X) < 50:
                raise ValueError(f"Insufficient data for training: {len(X)} samples")
            
            # Split data
            X_temp, X_test, y_temp, y_test = train_test_split(
                X, y, 
                test_size=self.config['test_size'], 
                random_state=self.config['random_state'],
                stratify=None  # Can't stratify continuous target
            )
            
            X_train, X_val, y_train, y_val = train_test_split(
                X_temp, y_temp,
                test_size=self.config['validation_size'] / (1 - self.config['test_size']),
                random_state=self.config['random_state']
            )
            
            logger.info(f"Data split - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
            
            return X_train, X_val, X_test, y_train, y_val, y_test
            
        except Exception as e:
            logger.error(f"Error preparing data: {str(e)}")
            raise
    
    def _prepare_features_and_targets(self, df: pd.DataFrame) -> tuple:
        """
        Prepare features and target variables
        
        Args:
            df: DataFrame with cycle data and features
            
        Returns:
            Tuple of (X, y) where y is cycle length to predict
        """
        try:
            # Remove records without cycle length (our target)
            df_with_target = df.dropna(subset=['cycleLength'])
            
            if df_with_target.empty:
                raise ValueError("No records with cycle length for training")
            
            # Define feature columns (exclude target and non-predictive columns)
            exclude_columns = [
                'cycleLength',  # This is our target
                'userId', 'startDate', 'endDate',  # Non-predictive
                '_id', 'id', 'createdAt', 'updatedAt'  # Database fields
            ]
            
            feature_columns = [col for col in df_with_target.columns 
                             if col not in exclude_columns and 
                             df_with_target[col].dtype in ['int64', 'float64', 'bool']]
            
            if not feature_columns:
                raise ValueError("No suitable feature columns found")
            
            X = df_with_target[feature_columns].copy()
            y = df_with_target['cycleLength'].copy()
            
            # Handle missing values
            X = X.fillna(X.median())
            
            # Remove constant columns
            constant_columns = [col for col in X.columns if X[col].nunique() <= 1]
            if constant_columns:
                logger.info(f"Removing constant columns: {constant_columns}")
                X = X.drop(columns=constant_columns)
            
            logger.info(f"Prepared features: {X.shape[1]} columns, {len(X)} samples")
            logger.info(f"Target statistics - Mean: {y.mean():.2f}, Std: {y.std():.2f}")
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preparing features and targets: {str(e)}")
            raise
    
    def train_model(self, X_train: pd.DataFrame, y_train: pd.Series, 
                   X_val: pd.DataFrame, y_val: pd.Series) -> dict:
        """
        Train the cycle prediction model
        
        Args:
            X_train: Training features
            y_train: Training targets
            X_val: Validation features
            y_val: Validation targets
            
        Returns:
            Dictionary with training results
        """
        try:
            logger.info("Starting model training...")
            
            # Feature selection
            if len(X_train.columns) > self.config['feature_selection_k']:
                selected_features = self.feature_engineer.select_features(
                    X_train, y_train, 
                    method='f_classif',  # Use f_classif for regression
                    k=self.config['feature_selection_k']
                )
                X_train_selected = X_train[selected_features]
                X_val_selected = X_val[selected_features]
                logger.info(f"Selected {len(selected_features)} features")
            else:
                X_train_selected = X_train
                X_val_selected = X_val
                selected_features = X_train.columns.tolist()
            
            # Scale features
            X_train_scaled = self.feature_engineer.scale_features(X_train_selected, 'cycle_model')
            X_val_scaled = self.feature_engineer.scale_features(X_val_selected, 'cycle_model')
            
            # Train model
            training_history = self.model.train(
                X_train_scaled, y_train,
                X_val_scaled, y_val,
                **self.config['model_params']
            )
            
            # Cross-validation
            cv_scores = cross_val_score(
                self.model.model, X_train_scaled, y_train,
                cv=self.config['cv_folds'],
                scoring='neg_mean_absolute_error'
            )
            
            # Validation predictions
            val_predictions = self.model.predict(X_val_scaled)
            
            # Calculate metrics
            val_mae = mean_absolute_error(y_val, val_predictions)
            val_mse = mean_squared_error(y_val, val_predictions)
            val_r2 = r2_score(y_val, val_predictions)
            
            training_results = {
                'training_history': training_history,
                'selected_features': selected_features,
                'validation_metrics': {
                    'mae': val_mae,
                    'mse': val_mse,
                    'rmse': np.sqrt(val_mse),
                    'r2': val_r2
                },
                'cross_validation': {
                    'cv_scores': cv_scores.tolist(),
                    'cv_mean': cv_scores.mean(),
                    'cv_std': cv_scores.std()
                },
                'model_params': self.config['model_params'],
                'training_samples': len(X_train),
                'validation_samples': len(X_val)
            }
            
            logger.info(f"Training completed - Validation MAE: {val_mae:.2f}, R²: {val_r2:.3f}")
            return training_results
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
    
    def evaluate_model(self, X_test: pd.DataFrame, y_test: pd.Series, 
                      selected_features: list) -> dict:
        """
        Evaluate the trained model on test set
        
        Args:
            X_test: Test features
            y_test: Test targets
            selected_features: List of selected feature names
            
        Returns:
            Dictionary with evaluation results
        """
        try:
            logger.info("Evaluating model on test set...")
            
            # Prepare test data
            X_test_selected = X_test[selected_features]
            X_test_scaled = self.feature_engineer.scale_features(X_test_selected, 'cycle_model')
            
            # Make predictions
            test_predictions = self.model.predict(X_test_scaled)
            
            # Calculate comprehensive metrics
            evaluation_results = evaluate_regression_model(y_test, test_predictions)
            
            # Add cycle-specific metrics
            cycle_specific_metrics = self._calculate_cycle_specific_metrics(y_test, test_predictions)
            evaluation_results.update(cycle_specific_metrics)
            
            logger.info(f"Test evaluation - MAE: {evaluation_results['mae']:.2f}, R²: {evaluation_results['r2']:.3f}")
            return evaluation_results
            
        except Exception as e:
            logger.error(f"Error evaluating model: {str(e)}")
            raise
    
    def _calculate_cycle_specific_metrics(self, y_true: pd.Series, y_pred: np.ndarray) -> dict:
        """Calculate cycle-specific evaluation metrics"""
        try:
            # Accuracy within different day ranges
            diff = np.abs(y_true - y_pred)
            
            metrics = {
                'accuracy_within_1_day': (diff <= 1).mean(),
                'accuracy_within_2_days': (diff <= 2).mean(),
                'accuracy_within_3_days': (diff <= 3).mean(),
                'accuracy_within_5_days': (diff <= 5).mean(),
                'mean_absolute_difference': diff.mean(),
                'median_absolute_difference': np.median(diff),
                'max_absolute_difference': diff.max()
            }
            
            # Prediction distribution
            metrics['prediction_stats'] = {
                'mean': float(np.mean(y_pred)),
                'std': float(np.std(y_pred)),
                'min': float(np.min(y_pred)),
                'max': float(np.max(y_pred))
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating cycle-specific metrics: {str(e)}")
            return {}
    
    def save_model(self, training_results: dict, evaluation_results: dict) -> bool:
        """
        Save the trained model and artifacts
        
        Args:
            training_results: Results from training
            evaluation_results: Results from evaluation
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("Saving model and artifacts...")
            
            # Save model
            model_saved = self.model.save_model(MODEL_PATHS['cycle_model'])
            
            if not model_saved:
                return False
            
            # Save feature engineering artifacts
            artifacts = {
                'feature_engineer': self.feature_engineer,
                'selected_features': training_results['selected_features'],
                'training_results': training_results,
                'evaluation_results': evaluation_results,
                'model_version': self.model.model_version,
                'training_timestamp': datetime.now().isoformat(),
                'config': self.config
            }
            
            artifacts_path = MODEL_PATHS['cycle_model'].replace('.joblib', '_artifacts.joblib')
            joblib.dump(artifacts, artifacts_path)
            
            logger.info(f"Model and artifacts saved successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            return False
    
    def run_training_pipeline(self) -> dict:
        """
        Run the complete training pipeline
        
        Returns:
            Dictionary with pipeline results
        """
        try:
            logger.info("Starting cycle model training pipeline...")
            
            # Load and prepare data
            X_train, X_val, X_test, y_train, y_val, y_test = self.load_and_prepare_data()
            
            # Train model
            training_results = self.train_model(X_train, y_train, X_val, y_val)
            
            # Evaluate model
            evaluation_results = self.evaluate_model(X_test, y_test, training_results['selected_features'])
            
            # Save model
            save_success = self.save_model(training_results, evaluation_results)
            
            pipeline_results = {
                'success': save_success,
                'training_results': training_results,
                'evaluation_results': evaluation_results,
                'data_stats': {
                    'train_samples': len(X_train),
                    'val_samples': len(X_val),
                    'test_samples': len(X_test),
                    'features': len(training_results['selected_features'])
                }
            }
            
            logger.info("Training pipeline completed successfully")
            return pipeline_results
            
        except Exception as e:
            logger.error(f"Error in training pipeline: {str(e)}")
            return {'success': False, 'error': str(e)}

def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description='Train cycle prediction model')
    parser.add_argument('--config', type=str, help='Path to config file')
    parser.add_argument('--test-size', type=float, default=0.2, help='Test set size')
    parser.add_argument('--random-state', type=int, default=42, help='Random state')
    
    args = parser.parse_args()
    
    # Load config if provided
    config = None
    if args.config:
        import json
        with open(args.config, 'r') as f:
            config = json.load(f)
    else:
        config = {
            'test_size': args.test_size,
            'random_state': args.random_state
        }
    
    # Initialize trainer
    trainer = CycleModelTrainer(config)
    
    # Run training
    results = trainer.run_training_pipeline()
    
    if results['success']:
        print("✅ Training completed successfully!")
        print(f"📊 Test MAE: {results['evaluation_results']['mae']:.2f} days")
        print(f"📊 Test R²: {results['evaluation_results']['r2']:.3f}")
        print(f"📊 Accuracy within 2 days: {results['evaluation_results']['accuracy_within_2_days']:.1%}")
    else:
        print("❌ Training failed!")
        print(f"Error: {results.get('error', 'Unknown error')}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())