"""
API handler for ML inference requests.
Coordinates between API endpoints and ML models.
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

from .pcos_predictor import PCOSPredictor
from .cycle_predictor import CyclePredictor
from ..utils.constants import RECOMMENDATION_TEMPLATES, CONFIDENCE_LEVELS
from ..utils.validation_utils import model_validator

logger = logging.getLogger(__name__)

class MLAPIHandler:
    """Main handler for ML API requests."""
    
    def __init__(self):
        self.pcos_predictor = PCOSPredictor()
        self.cycle_predictor = CyclePredictor()
        self.models_loaded = False
        self._load_models()
    
    def _load_models(self):
        """Load all ML models."""
        try:
            logger.info("Loading ML models...")
            
            # Load PCOS risk model
            self.pcos_predictor.load_model()
            logger.info("PCOS risk model loaded successfully")
            
            # Load cycle prediction model
            self.cycle_predictor.load_model()
            logger.info("Cycle prediction model loaded successfully")
            
            self.models_loaded = True
            logger.info("All ML models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load ML models: {str(e)}")
            self.models_loaded = False
            raise
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check on ML service."""
        try:
            status = {
                'status': 'healthy' if self.models_loaded else 'unhealthy',
                'timestamp': datetime.utcnow().isoformat(),
                'models': {
                    'pcos_risk': self.pcos_predictor.is_loaded(),
                    'cycle_prediction': self.cycle_predictor.is_loaded()
                },
                'version': '1.0.0'
            }
            
            if not self.models_loaded:
                status['message'] = 'One or more models failed to load'
            
            return status
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'timestamp': datetime.utcnow().isoformat(),
                'error': str(e),
                'version': '1.0.0'
            }
    
    def predict_pcos_risk(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict PCOS risk for a user."""
        try:
            if not self.pcos_predictor.is_loaded():
                raise RuntimeError("PCOS risk model is not loaded")
            
            logger.info(f"Predicting PCOS risk for user data")
            
            # Make prediction
            prediction_result = self.pcos_predictor.predict(user_data)
            
            # Validate prediction output
            is_valid, errors = model_validator.validate_model_output(
                prediction_result, 'pcos_risk'
            )
            
            if not is_valid:
                logger.error(f"Invalid PCOS prediction output: {errors}")
                raise ValueError("Model produced invalid output")
            
            # Add recommendations
            risk_level = prediction_result['risk_level']
            recommendations = RECOMMENDATION_TEMPLATES['pcos_risk'].get(
                risk_level, RECOMMENDATION_TEMPLATES['pcos_risk']['moderate']
            )
            
            result = {
                **prediction_result,
                'recommendations': recommendations,
                'timestamp': datetime.utcnow().isoformat(),
                'model_version': '1.0.0'
            }
            
            logger.info(f"PCOS risk prediction completed: {risk_level} risk")
            return result
            
        except Exception as e:
            logger.error(f"PCOS risk prediction failed: {str(e)}")
            raise
    
    def predict_next_cycle(self, cycle_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict next menstrual cycle."""
        try:
            if not self.cycle_predictor.is_loaded():
                raise RuntimeError("Cycle prediction model is not loaded")
            
            logger.info(f"Predicting next cycle based on {len(cycle_history)} cycles")
            
            # Make prediction
            prediction_result = self.cycle_predictor.predict(cycle_history)
            
            # Validate prediction output
            is_valid, errors = model_validator.validate_model_output(
                prediction_result, 'cycle_prediction'
            )
            
            if not is_valid:
                logger.error(f"Invalid cycle prediction output: {errors}")
                raise ValueError("Model produced invalid output")
            
            # Add additional insights
            result = {
                **prediction_result,
                'insights': self._generate_cycle_insights(cycle_history, prediction_result),
                'timestamp': datetime.utcnow().isoformat(),
                'model_version': '1.0.0'
            }
            
            logger.info(f"Cycle prediction completed: {prediction_result['predicted_cycle_length']} days")
            return result
            
        except Exception as e:
            logger.error(f"Cycle prediction failed: {str(e)}")
            raise
    
    def analyze_symptoms(self, symptoms_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze symptom patterns."""
        try:
            logger.info(f"Analyzing {len(symptoms_data)} symptoms")
            
            # Convert to DataFrame for analysis
            df = pd.DataFrame(symptoms_data)
            
            # Basic symptom analysis
            analysis_result = self._analyze_symptom_patterns(df)
            
            result = {
                **analysis_result,
                'timestamp': datetime.utcnow().isoformat(),
                'model_version': '1.0.0'
            }
            
            logger.info("Symptom analysis completed")
            return result
            
        except Exception as e:
            logger.error(f"Symptom analysis failed: {str(e)}")
            raise
    
    def get_personalized_recommendations(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized recommendations."""
        try:
            logger.info("Generating personalized recommendations")
            
            recommendations = {
                'exercise_recommendations': self._generate_exercise_recommendations(user_profile),
                'nutrition_recommendations': self._generate_nutrition_recommendations(user_profile),
                'lifestyle_recommendations': self._generate_lifestyle_recommendations(user_profile),
                'cycle_specific_tips': self._generate_cycle_tips(user_profile),
                'priority_level': self._determine_priority_level(user_profile),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            logger.info("Personalized recommendations generated")
            return recommendations
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {str(e)}")
            raise
    
    def analyze_workout_effectiveness(self, workout_data: List[Dict[str, Any]], 
                                   health_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze workout effectiveness."""
        try:
            logger.info(f"Analyzing effectiveness of {len(workout_data)} workouts")
            
            # Convert to DataFrame
            df = pd.DataFrame(workout_data)
            
            # Calculate effectiveness metrics
            effectiveness_result = self._calculate_workout_effectiveness(df, health_metrics)
            
            result = {
                **effectiveness_result,
                'timestamp': datetime.utcnow().isoformat(),
                'model_version': '1.0.0'
            }
            
            logger.info("Workout effectiveness analysis completed")
            return result
            
        except Exception as e:
            logger.error(f"Workout effectiveness analysis failed: {str(e)}")
            raise
    
    def analyze_nutrition_patterns(self, nutrition_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze nutrition patterns."""
        try:
            logger.info(f"Analyzing nutrition patterns from {len(nutrition_data)} meals")
            
            # Convert to DataFrame
            df = pd.DataFrame(nutrition_data)
            
            # Analyze nutrition patterns
            nutrition_result = self._analyze_nutrition_patterns(df)
            
            result = {
                **nutrition_result,
                'timestamp': datetime.utcnow().isoformat(),
                'model_version': '1.0.0'
            }
            
            logger.info("Nutrition pattern analysis completed")
            return result
            
        except Exception as e:
            logger.error(f"Nutrition pattern analysis failed: {str(e)}")
            raise
    
    def _generate_cycle_insights(self, cycle_history: List[Dict], prediction: Dict) -> List[str]:
        """Generate insights about cycle patterns."""
        insights = []
        
        if len(cycle_history) >= 3:
            # Calculate cycle regularity
            lengths = [c.get('cycle_length', 28) for c in cycle_history[-6:]]
            std_dev = np.std(lengths)
            
            if std_dev <= 2:
                insights.append("Your cycles are very regular")
            elif std_dev <= 5:
                insights.append("Your cycles show moderate regularity")
            else:
                insights.append("Your cycles show some irregularity")
            
            # Trend analysis
            if len(lengths) >= 4:
                recent_avg = np.mean(lengths[-3:])
                older_avg = np.mean(lengths[:-3])
                
                if recent_avg > older_avg + 1:
                    insights.append("Your recent cycles have been getting longer")
                elif recent_avg < older_avg - 1:
                    insights.append("Your recent cycles have been getting shorter")
        
        return insights
    
    def _analyze_symptom_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze symptom patterns from DataFrame."""
        analysis = {
            'total_symptoms': len(df),
            'unique_types': df['type'].nunique() if 'type' in df.columns else 0,
            'patterns': {},
            'correlations': {},
            'trends': {},
            'insights': []
        }
        
        if 'type' in df.columns:
            # Most common symptoms
            symptom_counts = df['type'].value_counts()
            analysis['patterns']['most_common'] = symptom_counts.head(5).to_dict()
            
            # Severity analysis
            if 'severity' in df.columns:
                avg_severity = df.groupby('type')['severity'].mean()
                analysis['patterns']['average_severity'] = avg_severity.to_dict()
        
        if 'cycle_day' in df.columns and 'type' in df.columns:
            # Cycle phase correlations
            phase_symptoms = df.groupby(['type', 'cycle_day']).size().unstack(fill_value=0)
            analysis['correlations']['cycle_phase'] = "Available"
        
        return analysis
    
    def _generate_exercise_recommendations(self, user_profile: Dict) -> List[str]:
        """Generate exercise recommendations based on user profile."""
        recommendations = []
        
        activity_level = user_profile.get('activityLevel', 'moderate')
        health_goals = user_profile.get('healthGoals', [])
        
        if activity_level == 'low':
            recommendations.extend([
                "Start with 15-20 minutes of light walking daily",
                "Try gentle yoga or stretching exercises",
                "Gradually increase activity duration as you build stamina"
            ])
        elif activity_level == 'moderate':
            recommendations.extend([
                "Aim for 30 minutes of moderate exercise 5 days per week",
                "Include both cardio and strength training",
                "Consider activities you enjoy to maintain consistency"
            ])
        else:
            recommendations.extend([
                "Maintain your current high activity level",
                "Focus on variety to prevent overuse injuries",
                "Include adequate rest and recovery time"
            ])
        
        if 'pcos-management' in health_goals:
            recommendations.extend([
                "Include resistance training to improve insulin sensitivity",
                "Try high-intensity interval training (HIIT) 2-3 times per week"
            ])
        
        return recommendations
    
    def _generate_nutrition_recommendations(self, user_profile: Dict) -> List[str]:
        """Generate nutrition recommendations."""
        recommendations = []
        
        health_goals = user_profile.get('healthGoals', [])
        
        recommendations.extend([
            "Focus on whole, unprocessed foods",
            "Include lean proteins with each meal",
            "Eat plenty of vegetables and fruits"
        ])
        
        if 'pcos-management' in health_goals:
            recommendations.extend([
                "Choose low glycemic index foods",
                "Include omega-3 rich foods like fish and nuts",
                "Consider reducing refined carbohydrates"
            ])
        
        if 'weight-management' in health_goals:
            recommendations.extend([
                "Practice portion control",
                "Stay hydrated throughout the day",
                "Plan meals and snacks in advance"
            ])
        
        return recommendations
    
    def _generate_lifestyle_recommendations(self, user_profile: Dict) -> List[str]:
        """Generate lifestyle recommendations."""
        return [
            "Maintain a consistent sleep schedule",
            "Practice stress management techniques",
            "Stay hydrated throughout the day",
            "Take time for relaxation and self-care"
        ]
    
    def _generate_cycle_tips(self, user_profile: Dict) -> List[str]:
        """Generate cycle-specific tips."""
        return [
            "Track your cycle consistently for better predictions",
            "Note any symptoms or changes in your cycle",
            "Adjust exercise intensity based on cycle phase",
            "Stay hydrated, especially during menstruation"
        ]
    
    def _determine_priority_level(self, user_profile: Dict) -> str:
        """Determine priority level for recommendations."""
        health_goals = user_profile.get('healthGoals', [])
        
        if 'pcos-management' in health_goals:
            return 'high'
        elif len(health_goals) > 2:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_workout_effectiveness(self, df: pd.DataFrame, health_metrics: Dict) -> Dict[str, Any]:
        """Calculate workout effectiveness metrics."""
        effectiveness = {
            'effectiveness_score': 0.75,  # Placeholder
            'suggested_improvements': [
                "Consider increasing workout frequency",
                "Add more variety to your routine"
            ],
            'optimal_timing': "Morning workouts may be most effective for you",
            'cycle_based_recommendations': [
                "Focus on strength training during follicular phase",
                "Try gentler exercises during menstrual phase"
            ]
        }
        
        return effectiveness
    
    def _analyze_nutrition_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze nutrition patterns from meal data."""
        analysis = {
            'nutritional_balance': {
                'protein': 'adequate',
                'carbohydrates': 'adequate',
                'fats': 'adequate'
            },
            'potential_deficiencies': [],
            'recommendations': [
                "Maintain current balanced approach",
                "Consider adding more fiber-rich foods"
            ],
            'cycle_based_nutrition': [
                "Increase iron-rich foods during menstruation",
                "Focus on complex carbs during luteal phase"
            ],
            'trends': {
                'calorie_consistency': 'good',
                'meal_timing': 'regular'
            }
        }
        
        return analysis

# Global handler instance
ml_handler = MLAPIHandler()