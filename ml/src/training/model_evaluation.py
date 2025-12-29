"""
Model evaluation utilities for FEMbalance ML models
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import logging
from typing import Dict, List, Optional, Tuple, Any
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, classification_report, mean_absolute_error, 
    mean_squared_error, r2_score, mean_absolute_percentage_error
)
from sklearn.model_selection import cross_val_score, learning_curve
import joblib
from pathlib import Path

logger = logging.getLogger(__name__)

class ModelEvaluator:
    """
    Comprehensive model evaluation for different types of ML models
    """
    
    def __init__(self):
        self.evaluation_results = {}
        
    def evaluate_classification_model(self, y_true: np.ndarray, y_pred: np.ndarray, 
                                    y_pred_proba: Optional[np.ndarray] = None,
                                    class_names: Optional[List[str]] = None) -> Dict:
        """
        Evaluate classification model performance
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            y_pred_proba: Predicted probabilities (optional)
            class_names: Names of classes (optional)
            
        Returns:
            Dictionary with evaluation metrics
        """
        try:
            logger.info("Evaluating classification model...")
            
            results = {
                'model_type': 'classification',
                'n_samples': len(y_true),
                'n_classes': len(np.unique(y_true))
            }
            
            # Basic metrics
            results['accuracy'] = accuracy_score(y_true, y_pred)
            results['precision'] = precision_score(y_true, y_pred, average='weighted', zero_division=0)
            results['recall'] = recall_score(y_true, y_pred, average='weighted', zero_division=0)
            results['f1_score'] = f1_score(y_true, y_pred, average='weighted', zero_division=0)
            
            # Per-class metrics
            if class_names:
                class_report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)
                results['per_class_metrics'] = class_report
            
            # Confusion matrix
            cm = confusion_matrix(y_true, y_pred)
            results['confusion_matrix'] = cm.tolist()
            
            # ROC AUC (for binary or multiclass with probabilities)
            if y_pred_proba is not None:
                try:
                    if len(np.unique(y_true)) == 2:
                        # Binary classification
                        results['roc_auc'] = roc_auc_score(y_true, y_pred_proba[:, 1])
                    else:
                        # Multiclass
                        results['roc_auc'] = roc_auc_score(y_true, y_pred_proba, multi_class='ovr', average='weighted')
                except Exception as e:
                    logger.warning(f"Could not calculate ROC AUC: {str(e)}")
            
            # Class distribution
            unique, counts = np.unique(y_true, return_counts=True)
            results['class_distribution'] = dict(zip(unique.tolist(), counts.tolist()))
            
            logger.info(f"Classification evaluation completed - Accuracy: {results['accuracy']:.3f}")
            return results
            
        except Exception as e:
            logger.error(f"Error evaluating classification model: {str(e)}")
            return {'error': str(e)}
    
    def evaluate_regression_model(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
        """
        Evaluate regression model performance
        
        Args:
            y_true: True values
            y_pred: Predicted values
            
        Returns:
            Dictionary with evaluation metrics
        """
        try:
            logger.info("Evaluating regression model...")
            
            results = {
                'model_type': 'regression',
                'n_samples': len(y_true)
            }
            
            # Basic regression metrics
            results['mae'] = mean_absolute_error(y_true, y_pred)
            results['mse'] = mean_squared_error(y_true, y_pred)
            results['rmse'] = np.sqrt(results['mse'])
            results['r2'] = r2_score(y_true, y_pred)
            
            # MAPE (Mean Absolute Percentage Error)
            try:
                results['mape'] = mean_absolute_percentage_error(y_true, y_pred)
            except:
                # Calculate manually if sklearn version doesn't have MAPE
                results['mape'] = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
            
            # Residual statistics
            residuals = y_true - y_pred
            results['residual_stats'] = {
                'mean': float(np.mean(residuals)),
                'std': float(np.std(residuals)),
                'min': float(np.min(residuals)),
                'max': float(np.max(residuals)),
                'median': float(np.median(residuals))
            }
            
            # Prediction statistics
            results['prediction_stats'] = {
                'mean': float(np.mean(y_pred)),
                'std': float(np.std(y_pred)),
                'min': float(np.min(y_pred)),
                'max': float(np.max(y_pred)),
                'median': float(np.median(y_pred))
            }
            
            # True values statistics
            results['true_stats'] = {
                'mean': float(np.mean(y_true)),
                'std': float(np.std(y_true)),
                'min': float(np.min(y_true)),
                'max': float(np.max(y_true)),
                'median': float(np.median(y_true))
            }
            
            logger.info(f"Regression evaluation completed - MAE: {results['mae']:.3f}, R²: {results['r2']:.3f}")
            return results
            
        except Exception as e:
            logger.error(f"Error evaluating regression model: {str(e)}")
            return {'error': str(e)}
    
    def evaluate_pcos_model(self, y_true: np.ndarray, y_pred: np.ndarray, 
                           y_pred_proba: Optional[np.ndarray] = None) -> Dict:
        """
        Evaluate PCOS risk prediction model with domain-specific metrics
        
        Args:
            y_true: True PCOS risk labels
            y_pred: Predicted PCOS risk labels
            y_pred_proba: Predicted probabilities (optional)
            
        Returns:
            Dictionary with evaluation metrics
        """
        try:
            logger.info("Evaluating PCOS model...")
            
            # Get basic classification metrics
            results = self.evaluate_classification_model(
                y_true, y_pred, y_pred_proba, 
                class_names=['Low Risk', 'High Risk']
            )
            
            # PCOS-specific metrics
            tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
            
            results['pcos_specific'] = {
                'sensitivity': tp / (tp + fn) if (tp + fn) > 0 else 0,  # True positive rate
                'specificity': tn / (tn + fp) if (tn + fp) > 0 else 0,  # True negative rate
                'positive_predictive_value': tp / (tp + fp) if (tp + fp) > 0 else 0,
                'negative_predictive_value': tn / (tn + fn) if (tn + fn) > 0 else 0,
                'false_positive_rate': fp / (fp + tn) if (fp + tn) > 0 else 0,
                'false_negative_rate': fn / (fn + tp) if (fn + tp) > 0 else 0
            }
            
            # Risk stratification analysis
            if y_pred_proba is not None:
                risk_analysis = self._analyze_risk_stratification(y_true, y_pred_proba)
                results['risk_stratification'] = risk_analysis
            
            logger.info(f"PCOS evaluation completed - Sensitivity: {results['pcos_specific']['sensitivity']:.3f}")
            return results
            
        except Exception as e:
            logger.error(f"Error evaluating PCOS model: {str(e)}")
            return {'error': str(e)}
    
    def evaluate_cycle_model(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
        """
        Evaluate cycle prediction model with domain-specific metrics
        
        Args:
            y_true: True cycle lengths
            y_pred: Predicted cycle lengths
            
        Returns:
            Dictionary with evaluation metrics
        """
        try:
            logger.info("Evaluating cycle model...")
            
            # Get basic regression metrics
            results = self.evaluate_regression_model(y_true, y_pred)
            
            # Cycle-specific metrics
            diff = np.abs(y_true - y_pred)
            
            results['cycle_specific'] = {
                'accuracy_within_1_day': float(np.mean(diff <= 1)),
                'accuracy_within_2_days': float(np.mean(diff <= 2)),
                'accuracy_within_3_days': float(np.mean(diff <= 3)),
                'accuracy_within_5_days': float(np.mean(diff <= 5)),
                'mean_absolute_difference': float(np.mean(diff)),
                'median_absolute_difference': float(np.median(diff)),
                'max_absolute_difference': float(np.max(diff))
            }
            
            # Cycle length distribution analysis
            results['cycle_distribution'] = {
                'short_cycles_true': int(np.sum(y_true < 25)),
                'normal_cycles_true': int(np.sum((y_true >= 25) & (y_true <= 32))),
                'long_cycles_true': int(np.sum(y_true > 32)),
                'short_cycles_pred': int(np.sum(y_pred < 25)),
                'normal_cycles_pred': int(np.sum((y_pred >= 25) & (y_pred <= 32))),
                'long_cycles_pred': int(np.sum(y_pred > 32))
            }
            
            logger.info(f"Cycle evaluation completed - Accuracy within 2 days: {results['cycle_specific']['accuracy_within_2_days']:.3f}")
            return results
            
        except Exception as e:
            logger.error(f"Error evaluating cycle model: {str(e)}")
            return {'error': str(e)}
    
    def _analyze_risk_stratification(self, y_true: np.ndarray, y_pred_proba: np.ndarray) -> Dict:
        """Analyze risk stratification performance"""
        try:
            # Assuming binary classification with probabilities for positive class
            if y_pred_proba.ndim > 1:
                proba_positive = y_pred_proba[:, 1]
            else:
                proba_positive = y_pred_proba
            
            # Define risk thresholds
            thresholds = [0.3, 0.5, 0.7, 0.9]
            stratification = {}
            
            for threshold in thresholds:
                high_risk_pred = proba_positive >= threshold
                
                if np.sum(high_risk_pred) > 0:
                    precision = np.sum(y_true[high_risk_pred]) / np.sum(high_risk_pred)
                    recall = np.sum(y_true[high_risk_pred]) / np.sum(y_true) if np.sum(y_true) > 0 else 0
                else:
                    precision = 0
                    recall = 0
                
                stratification[f'threshold_{threshold}'] = {
                    'precision': float(precision),
                    'recall': float(recall),
                    'n_predicted_high_risk': int(np.sum(high_risk_pred)),
                    'percentage_high_risk': float(np.mean(high_risk_pred))
                }
            
            return stratification
            
        except Exception as e:
            logger.error(f"Error in risk stratification analysis: {str(e)}")
            return {}
    
    def cross_validate_model(self, model, X: np.ndarray, y: np.ndarray, 
                           cv: int = 5, scoring: str = 'accuracy') -> Dict:
        """
        Perform cross-validation evaluation
        
        Args:
            model: Trained model
            X: Feature matrix
            y: Target vector
            cv: Number of cross-validation folds
            scoring: Scoring metric
            
        Returns:
            Dictionary with cross-validation results
        """
        try:
            logger.info(f"Performing {cv}-fold cross-validation...")
            
            cv_scores = cross_val_score(model, X, y, cv=cv, scoring=scoring)
            
            results = {
                'cv_scores': cv_scores.tolist(),
                'cv_mean': float(cv_scores.mean()),
                'cv_std': float(cv_scores.std()),
                'cv_min': float(cv_scores.min()),
                'cv_max': float(cv_scores.max()),
                'scoring_metric': scoring,
                'n_folds': cv
            }
            
            logger.info(f"Cross-validation completed - Mean {scoring}: {results['cv_mean']:.3f} ± {results['cv_std']:.3f}")
            return results
            
        except Exception as e:
            logger.error(f"Error in cross-validation: {str(e)}")
            return {'error': str(e)}
    
    def generate_learning_curves(self, model, X: np.ndarray, y: np.ndarray, 
                                cv: int = 5, scoring: str = 'accuracy') -> Dict:
        """
        Generate learning curves to analyze model performance vs training size
        
        Args:
            model: Model to evaluate
            X: Feature matrix
            y: Target vector
            cv: Number of cross-validation folds
            scoring: Scoring metric
            
        Returns:
            Dictionary with learning curve data
        """
        try:
            logger.info("Generating learning curves...")
            
            train_sizes, train_scores, val_scores = learning_curve(
                model, X, y, cv=cv, scoring=scoring,
                train_sizes=np.linspace(0.1, 1.0, 10),
                random_state=42
            )
            
            results = {
                'train_sizes': train_sizes.tolist(),
                'train_scores_mean': train_scores.mean(axis=1).tolist(),
                'train_scores_std': train_scores.std(axis=1).tolist(),
                'val_scores_mean': val_scores.mean(axis=1).tolist(),
                'val_scores_std': val_scores.std(axis=1).tolist(),
                'scoring_metric': scoring
            }
            
            logger.info("Learning curves generated successfully")
            return results
            
        except Exception as e:
            logger.error(f"Error generating learning curves: {str(e)}")
            return {'error': str(e)}
    
    def compare_models(self, model_results: Dict[str, Dict]) -> Dict:
        """
        Compare multiple model evaluation results
        
        Args:
            model_results: Dictionary with model names as keys and evaluation results as values
            
        Returns:
            Dictionary with comparison results
        """
        try:
            logger.info(f"Comparing {len(model_results)} models...")
            
            comparison = {
                'models_compared': list(model_results.keys()),
                'comparison_metrics': {}
            }
            
            # Extract common metrics for comparison
            common_metrics = set()
            for results in model_results.values():
                if 'error' not in results:
                    common_metrics.update(results.keys())
            
            # Remove non-numeric metrics
            numeric_metrics = []
            for metric in common_metrics:
                try:
                    # Check if all models have numeric values for this metric
                    values = []
                    for model_name, results in model_results.items():
                        if metric in results and isinstance(results[metric], (int, float)):
                            values.append(results[metric])
                    
                    if len(values) == len(model_results):
                        numeric_metrics.append(metric)
                except:
                    continue
            
            # Compare numeric metrics
            for metric in numeric_metrics:
                metric_values = {}
                for model_name, results in model_results.items():
                    if metric in results:
                        metric_values[model_name] = results[metric]
                
                if metric_values:
                    # Find best model for this metric
                    if metric in ['accuracy', 'precision', 'recall', 'f1_score', 'r2', 'roc_auc']:
                        # Higher is better
                        best_model = max(metric_values, key=metric_values.get)
                        best_value = metric_values[best_model]
                    else:
                        # Lower is better (for error metrics)
                        best_model = min(metric_values, key=metric_values.get)
                        best_value = metric_values[best_model]
                    
                    comparison['comparison_metrics'][metric] = {
                        'values': metric_values,
                        'best_model': best_model,
                        'best_value': best_value
                    }
            
            # Overall ranking (simplified)
            if 'accuracy' in comparison['comparison_metrics']:
                ranking_metric = 'accuracy'
            elif 'r2' in comparison['comparison_metrics']:
                ranking_metric = 'r2'
            elif 'f1_score' in comparison['comparison_metrics']:
                ranking_metric = 'f1_score'
            else:
                ranking_metric = list(comparison['comparison_metrics'].keys())[0] if comparison['comparison_metrics'] else None
            
            if ranking_metric:
                values = comparison['comparison_metrics'][ranking_metric]['values']
                sorted_models = sorted(values.items(), key=lambda x: x[1], reverse=True)
                comparison['overall_ranking'] = {
                    'ranking_metric': ranking_metric,
                    'ranked_models': [{'model': model, 'score': score} for model, score in sorted_models]
                }
            
            logger.info("Model comparison completed")
            return comparison
            
        except Exception as e:
            logger.error(f"Error comparing models: {str(e)}")
            return {'error': str(e)}
    
    def save_evaluation_results(self, results: Dict, filepath: str) -> bool:
        """
        Save evaluation results to file
        
        Args:
            results: Evaluation results dictionary
            filepath: Path to save results
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Create directory if it doesn't exist
            Path(filepath).parent.mkdir(parents=True, exist_ok=True)
            
            # Save results
            joblib.dump(results, filepath)
            
            logger.info(f"Evaluation results saved to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving evaluation results: {str(e)}")
            return False
    
    def load_evaluation_results(self, filepath: str) -> Dict:
        """
        Load evaluation results from file
        
        Args:
            filepath: Path to load results from
            
        Returns:
            Dictionary with evaluation results
        """
        try:
            results = joblib.load(filepath)
            logger.info(f"Evaluation results loaded from {filepath}")
            return results
            
        except Exception as e:
            logger.error(f"Error loading evaluation results: {str(e)}")
            return {'error': str(e)}
    
    def generate_evaluation_report(self, results: Dict, model_name: str = "Model") -> str:
        """
        Generate a human-readable evaluation report
        
        Args:
            results: Evaluation results dictionary
            model_name: Name of the model
            
        Returns:
            String with formatted report
        """
        try:
            report = f"\n{'='*60}\n"
            report += f"EVALUATION REPORT: {model_name.upper()}\n"
            report += f"{'='*60}\n\n"
            
            if 'error' in results:
                report += f"❌ Evaluation failed: {results['error']}\n"
                return report
            
            # Basic info
            report += f"Model Type: {results.get('model_type', 'Unknown')}\n"
            report += f"Samples: {results.get('n_samples', 'Unknown')}\n\n"
            
            # Classification metrics
            if results.get('model_type') == 'classification':
                report += "CLASSIFICATION METRICS:\n"
                report += f"  Accuracy:  {results.get('accuracy', 0):.3f}\n"
                report += f"  Precision: {results.get('precision', 0):.3f}\n"
                report += f"  Recall:    {results.get('recall', 0):.3f}\n"
                report += f"  F1-Score:  {results.get('f1_score', 0):.3f}\n"
                
                if 'roc_auc' in results:
                    report += f"  ROC AUC:   {results['roc_auc']:.3f}\n"
                
                report += "\n"
            
            # Regression metrics
            elif results.get('model_type') == 'regression':
                report += "REGRESSION METRICS:\n"
                report += f"  MAE:  {results.get('mae', 0):.3f}\n"
                report += f"  MSE:  {results.get('mse', 0):.3f}\n"
                report += f"  RMSE: {results.get('rmse', 0):.3f}\n"
                report += f"  R²:   {results.get('r2', 0):.3f}\n"
                
                if 'mape' in results:
                    report += f"  MAPE: {results['mape']:.2f}%\n"
                
                report += "\n"
            
            # Domain-specific metrics
            if 'pcos_specific' in results:
                pcos = results['pcos_specific']
                report += "PCOS-SPECIFIC METRICS:\n"
                report += f"  Sensitivity: {pcos.get('sensitivity', 0):.3f}\n"
                report += f"  Specificity: {pcos.get('specificity', 0):.3f}\n"
                report += f"  PPV:         {pcos.get('positive_predictive_value', 0):.3f}\n"
                report += f"  NPV:         {pcos.get('negative_predictive_value', 0):.3f}\n\n"
            
            if 'cycle_specific' in results:
                cycle = results['cycle_specific']
                report += "CYCLE-SPECIFIC METRICS:\n"
                report += f"  Accuracy within 1 day:  {cycle.get('accuracy_within_1_day', 0):.3f}\n"
                report += f"  Accuracy within 2 days: {cycle.get('accuracy_within_2_days', 0):.3f}\n"
                report += f"  Accuracy within 3 days: {cycle.get('accuracy_within_3_days', 0):.3f}\n"
                report += f"  Mean absolute diff:     {cycle.get('mean_absolute_difference', 0):.2f} days\n\n"
            
            # Cross-validation results
            if 'cv_mean' in results:
                report += "CROSS-VALIDATION:\n"
                report += f"  CV Mean: {results['cv_mean']:.3f} ± {results.get('cv_std', 0):.3f}\n"
                report += f"  CV Range: [{results.get('cv_min', 0):.3f}, {results.get('cv_max', 0):.3f}]\n\n"
            
            report += f"{'='*60}\n"
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating evaluation report: {str(e)}")
            return f"Error generating report: {str(e)}"