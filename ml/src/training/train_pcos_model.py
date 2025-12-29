"""
Training script for PCOS risk prediction model
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import logging
from pathlib import Path
import json
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PCOSModelTrainer:
    """
    Trainer for PCOS risk prediction model
    """
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.model = None
        self.feature_names = []
        self.model_metadata = {}
    
    def load_data(self, data_path: str = None) -> pd.DataFrame:
        """
        Load training data for PCOS prediction
        
        Args:
            data_path: Path to training data CSV file
            
        Returns:
            DataFrame with training data
        """
        if data_path:
            df = pd.read_csv(data_path)
        else:
            # Generate synthetic training data for demonstration
            df = self._generate_synthetic_data()
        
        logger.info(f"Loaded {len(df)} training samples")
        return df
    
    def _generate_synthetic_data(self, n_samples: int = 5000) -> pd.DataFrame:
        """
        Generate synthetic PCOS training data for demonstration
        
        Args:
            n_samples: Number of samples to generate
            
        Returns:
            Synthetic training DataFrame
        """
        np.random.seed(42)
        
        data = {
            # Menstrual cycle features
            'cycle_length': np.random.normal(28, 5, n_samples).clip(15, 45),
            'irregular_periods': np.random.choice([0, 1], n_samples, p=[0.6, 0.4]),
            'missed_periods': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
            'heavy_bleeding': np.random.choice([0, 1], n_samples, p=[0.65, 0.35]),
            
            # Physical symptoms
            'excess_hair': np.random.choice([0, 1, 2, 3], n_samples, p=[0.4, 0.3, 0.2, 0.1]),
            'acne': np.random.choice([0, 1, 2, 3], n_samples, p=[0.3, 0.4, 0.2, 0.1]),
            'weight_gain': np.random.choice([0, 1], n_samples, p=[0.5, 0.5]),
            'hair_loss': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
            'skin_darkening': np.random.choice([0, 1], n_samples, p=[0.75, 0.25]),
            
            # Metabolic features
            'bmi': np.random.normal(25, 5, n_samples).clip(15, 45),
            'insulin_resistance': np.random.choice([0, 1], n_samples, p=[0.6, 0.4]),
            'difficulty_losing_weight': np.random.choice([0, 1], n_samples, p=[0.55, 0.45]),
            
            # Lifestyle factors
            'exercise_frequency': np.random.choice([0, 1, 2, 3, 4], n_samples, p=[0.2, 0.3, 0.25, 0.15, 0.1]),
            'stress_level': np.random.choice([0, 1, 2, 3, 4, 5], n_samples, p=[0.1, 0.15, 0.25, 0.25, 0.15, 0.1]),
            'sleep_quality': np.random.choice([0, 1, 2, 3], n_samples, p=[0.15, 0.35, 0.35, 0.15]),
            
            # Family history
            'family_history_pcos': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
            'family_history_diabetes': np.random.choice([0, 1], n_samples, p=[0.6, 0.4]),
            
            # Age
            'age': np.random.normal(28, 8, n_samples).clip(16, 45),
            
            # Mood and mental health
            'mood_swings': np.random.choice([0, 1, 2, 3], n_samples, p=[0.3, 0.4, 0.2, 0.1]),
            'anxiety_depression': np.random.choice([0, 1, 2, 3], n_samples, p=[0.4, 0.3, 0.2, 0.1]),
            'fatigue': np.random.choice([0, 1, 2, 3], n_samples, p=[0.25, 0.35, 0.25, 0.15])
        }
        
        df = pd.DataFrame(data)
        
        # Generate PCOS risk labels based on features (simplified logic)
        risk_score = (
            df['irregular_periods'] * 0.15 +
            df['missed_periods'] * 0.12 +
            df['excess_hair'] * 0.08 +
            df['acne'] * 0.06 +
            df['weight_gain'] * 0.10 +
            df['hair_loss'] * 0.08 +
            df['skin_darkening'] * 0.07 +
            (df['bmi'] > 25).astype(int) * 0.10 +
            df['insulin_resistance'] * 0.12 +
            df['family_history_pcos'] * 0.08 +
            df['family_history_diabetes'] * 0.04
        )
        
        # Add some noise
        risk_score += np.random.normal(0, 0.05, n_samples)
        risk_score = risk_score.clip(0, 1)
        
        # Convert to risk categories
        df['pcos_risk'] = pd.cut(risk_score, 
                                bins=[0, 0.3, 0.6, 1.0], 
                                labels=['Low', 'Medium', 'High'])
        
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> tuple:
        """
        Preprocess data for training
        
        Args:
            df: Raw training data
            
        Returns:
            Tuple of (X, y) preprocessed data
        """
        # Separate features and target
        X = df.drop(['pcos_risk'], axis=1)
        y = df['pcos_risk']
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        # Encode categorical target
        if 'pcos_risk_encoder' not in self.label_encoders:
            self.label_encoders['pcos_risk_encoder'] = LabelEncoder()
            y_encoded = self.label_encoders['pcos_risk_encoder'].fit_transform(y)
        else:
            y_encoded = self.label_encoders['pcos_risk_encoder'].transform(y)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        logger.info(f"Preprocessed data shape: {X_scaled.shape}")
        logger.info(f"Target distribution: {pd.Series(y).value_counts().to_dict()}")
        
        return X_scaled, y_encoded
    
    def train_model(self, X: np.ndarray, y: np.ndarray) -> dict:
        """
        Train PCOS risk prediction model
        
        Args:
            X: Feature matrix
            y: Target vector
            
        Returns:
            Training results dictionary
        """
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Define models to try
        models = {
            'random_forest': RandomForestClassifier(random_state=42),
            'gradient_boosting': GradientBoostingClassifier(random_state=42),
            'logistic_regression': LogisticRegression(random_state=42, max_iter=1000)
        }
        
        best_model = None
        best_score = 0
        results = {}
        
        # Train and evaluate each model
        for name, model in models.items():
            logger.info(f"Training {name}...")
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
            
            # Fit model
            model.fit(X_train, y_train)
            
            # Evaluate
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            
            # Predictions for detailed metrics
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test) if hasattr(model, 'predict_proba') else None
            
            # Calculate AUC for multiclass
            auc_score = None
            if y_pred_proba is not None:
                try:
                    auc_score = roc_auc_score(y_test, y_pred_proba, multi_class='ovr', average='weighted')
                except:
                    pass
            
            results[name] = {
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std(),
                'train_score': train_score,
                'test_score': test_score,
                'auc_score': auc_score,
                'classification_report': classification_report(y_test, y_pred, output_dict=True),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            logger.info(f"{name} - CV: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
            logger.info(f"{name} - Test Score: {test_score:.3f}")
            
            if test_score > best_score:
                best_score = test_score
                best_model = model
                self.model = model
        
        # Hyperparameter tuning for best model
        if isinstance(best_model, RandomForestClassifier):
            logger.info("Performing hyperparameter tuning for Random Forest...")
            param_grid = {
                'n_estimators': [100, 200],
                'max_depth': [10, 20, None],
                'min_samples_split': [2, 5],
                'min_samples_leaf': [1, 2]
            }
            
            grid_search = GridSearchCV(
                RandomForestClassifier(random_state=42),
                param_grid,
                cv=3,
                scoring='accuracy',
                n_jobs=-1
            )
            
            grid_search.fit(X_train, y_train)
            self.model = grid_search.best_estimator_
            
            logger.info(f"Best parameters: {grid_search.best_params_}")
            logger.info(f"Best CV score: {grid_search.best_score_:.3f}")
        
        # Final evaluation
        final_test_score = self.model.score(X_test, y_test)
        logger.info(f"Final model test score: {final_test_score:.3f}")
        
        # Store model metadata
        self.model_metadata = {
            'model_type': type(self.model).__name__,
            'feature_names': self.feature_names,
            'training_date': datetime.now().isoformat(),
            'test_score': final_test_score,
            'n_features': len(self.feature_names),
            'n_samples': len(X),
            'class_labels': self.label_encoders['pcos_risk_encoder'].classes_.tolist()
        }
        
        return results
    
    def save_model(self, model_name: str = "pcos_risk_model"):
        """
        Save trained model and preprocessing components
        
        Args:
            model_name: Name for the saved model files
        """
        if self.model is None:
            raise ValueError("No model trained yet. Call train_model() first.")
        
        # Save model
        model_path = self.model_dir / f"{model_name}.joblib"
        joblib.dump(self.model, model_path)
        
        # Save scaler
        scaler_path = self.model_dir / f"{model_name}_scaler.joblib"
        joblib.dump(self.scaler, scaler_path)
        
        # Save label encoders
        encoders_path = self.model_dir / f"{model_name}_encoders.joblib"
        joblib.dump(self.label_encoders, encoders_path)
        
        # Save metadata
        metadata_path = self.model_dir / f"{model_name}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(self.model_metadata, f, indent=2)
        
        logger.info(f"Model saved to {model_path}")
        logger.info(f"Scaler saved to {scaler_path}")
        logger.info(f"Encoders saved to {encoders_path}")
        logger.info(f"Metadata saved to {metadata_path}")
    
    def get_feature_importance(self) -> dict:
        """
        Get feature importance from trained model
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if self.model is None:
            raise ValueError("No model trained yet.")
        
        if hasattr(self.model, 'feature_importances_'):
            importance_dict = dict(zip(self.feature_names, self.model.feature_importances_))
            # Sort by importance
            return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        else:
            logger.warning("Model does not have feature_importances_ attribute")
            return {}

def main():
    """Main training script"""
    logger.info("Starting PCOS model training...")
    
    # Initialize trainer
    trainer = PCOSModelTrainer()
    
    # Load data
    df = trainer.load_data()
    
    # Preprocess data
    X, y = trainer.preprocess_data(df)
    
    # Train model
    results = trainer.train_model(X, y)
    
    # Print results
    logger.info("\nTraining Results:")
    for model_name, metrics in results.items():
        logger.info(f"\n{model_name.upper()}:")
        logger.info(f"  CV Score: {metrics['cv_mean']:.3f} (+/- {metrics['cv_std'] * 2:.3f})")
        logger.info(f"  Test Score: {metrics['test_score']:.3f}")
        if metrics['auc_score']:
            logger.info(f"  AUC Score: {metrics['auc_score']:.3f}")
    
    # Get feature importance
    feature_importance = trainer.get_feature_importance()
    if feature_importance:
        logger.info("\nTop 10 Most Important Features:")
        for i, (feature, importance) in enumerate(list(feature_importance.items())[:10]):
            logger.info(f"  {i+1}. {feature}: {importance:.3f}")
    
    # Save model
    trainer.save_model()
    
    logger.info("Training completed successfully!")

if __name__ == "__main__":
    main()