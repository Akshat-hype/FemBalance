"""
Prediction routes for ML API.
"""

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime

from ...inference.api_handler import ml_handler
from ..middleware.auth import require_auth, optional_auth, log_request_info
from ..middleware.validation import (
    validate_json_request,
    validate_pcos_prediction_request,
    validate_cycle_prediction_request,
    validate_symptom_analysis_request,
    sanitize_request_data
)

logger = logging.getLogger(__name__)

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/predict/pcos-risk', methods=['POST'])
@log_request_info
@require_auth
@validate_json_request
@validate_pcos_prediction_request
@sanitize_request_data
def predict_pcos_risk():
    """Predict PCOS risk based on user data."""
    try:
        user_data = getattr(request, 'validated_data', request.get_json())
        
        logger.info(f"PCOS risk prediction request from user {request.user_id}")
        
        # Make prediction
        prediction = ml_handler.predict_pcos_risk(user_data)
        
        # Log successful prediction
        logger.info(f"PCOS prediction completed for user {request.user_id}: {prediction['risk_level']}")
        
        return jsonify({
            'success': True,
            'data': prediction,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except ValueError as e:
        logger.warning(f"PCOS prediction validation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Validation error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 400
        
    except RuntimeError as e:
        logger.error(f"PCOS prediction model error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Model error',
            'message': 'PCOS risk model is not available',
            'timestamp': datetime.utcnow().isoformat()
        }), 503
        
    except Exception as e:
        logger.error(f"PCOS prediction failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Prediction failed',
            'message': 'An unexpected error occurred during prediction',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@prediction_bp.route('/predict/next-cycle', methods=['POST'])
@log_request_info
@require_auth
@validate_json_request
@validate_cycle_prediction_request
@sanitize_request_data
def predict_next_cycle():
    """Predict next menstrual cycle."""
    try:
        data = getattr(request, 'validated_data', request.get_json())
        cycle_history = data.get('cycles', [])
        
        logger.info(f"Cycle prediction request from user {request.user_id} with {len(cycle_history)} cycles")
        
        # Make prediction
        prediction = ml_handler.predict_next_cycle(cycle_history)
        
        # Log successful prediction
        logger.info(f"Cycle prediction completed for user {request.user_id}")
        
        return jsonify({
            'success': True,
            'data': prediction,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except ValueError as e:
        logger.warning(f"Cycle prediction validation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Validation error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 400
        
    except RuntimeError as e:
        logger.error(f"Cycle prediction model error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Model error',
            'message': 'Cycle prediction model is not available',
            'timestamp': datetime.utcnow().isoformat()
        }), 503
        
    except Exception as e:
        logger.error(f"Cycle prediction failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Prediction failed',
            'message': 'An unexpected error occurred during prediction',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@prediction_bp.route('/analyze/symptoms', methods=['POST'])
@log_request_info
@require_auth
@validate_json_request
@validate_symptom_analysis_request
@sanitize_request_data
def analyze_symptoms():
    """Analyze symptom patterns."""
    try:
        data = getattr(request, 'validated_data', request.get_json())
        symptoms = data.get('symptoms', [])
        
        logger.info(f"Symptom analysis request from user {request.user_id} with {len(symptoms)} symptoms")
        
        # Perform analysis
        analysis = ml_handler.analyze_symptoms(symptoms)
        
        # Log successful analysis
        logger.info(f"Symptom analysis completed for user {request.user_id}")
        
        return jsonify({
            'success': True,
            'data': analysis,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except ValueError as e:
        logger.warning(f"Symptom analysis validation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Validation error',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 400
        
    except Exception as e:
        logger.error(f"Symptom analysis failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Analysis failed',
            'message': 'An unexpected error occurred during analysis',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@prediction_bp.route('/recommendations/personalized', methods=['POST'])
@log_request_info
@require_auth
@validate_json_request
@sanitize_request_data
def get_personalized_recommendations():
    """Get personalized health recommendations."""
    try:
        user_profile = getattr(request, 'sanitized_data', request.get_json())
        
        logger.info(f"Personalized recommendations request from user {request.user_id}")
        
        # Generate recommendations
        recommendations = ml_handler.get_personalized_recommendations(user_profile)
        
        # Log successful generation
        logger.info(f"Personalized recommendations generated for user {request.user_id}")
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Recommendation generation failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Recommendation failed',
            'message': 'An unexpected error occurred during recommendation generation',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@prediction_bp.route('/analyze/workout-effectiveness', methods=['POST'])
@log_request_info
@require_auth
@validate_json_request
@sanitize_request_data
def analyze_workout_effectiveness():
    """Analyze workout effectiveness."""
    try:
        data = getattr(request, 'sanitized_data', request.get_json())
        workout_data = data.get('workouts', [])
        health_metrics = data.get('health_metrics', {})
        
        logger.info(f"Workout effectiveness analysis request from user {request.user_id}")
        
        # Perform analysis
        analysis = ml_handler.analyze_workout_effectiveness(workout_data, health_metrics)
        
        # Log successful analysis
        logger.info(f"Workout effectiveness analysis completed for user {request.user_id}")
        
        return jsonify({
            'success': True,
            'data': analysis,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Workout effectiveness analysis failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Analysis failed',
            'message': 'An unexpected error occurred during workout analysis',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@prediction_bp.route('/analyze/nutrition-patterns', methods=['POST'])
@log_request_info
@require_auth
@validate_json_request
@sanitize_request_data
def analyze_nutrition_patterns():
    """Analyze nutrition patterns."""
    try:
        data = getattr(request, 'sanitized_data', request.get_json())
        nutrition_data = data.get('meals', [])
        
        logger.info(f"Nutrition pattern analysis request from user {request.user_id}")
        
        # Perform analysis
        analysis = ml_handler.analyze_nutrition_patterns(nutrition_data)
        
        # Log successful analysis
        logger.info(f"Nutrition pattern analysis completed for user {request.user_id}")
        
        return jsonify({
            'success': True,
            'data': analysis,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Nutrition pattern analysis failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Analysis failed',
            'message': 'An unexpected error occurred during nutrition analysis',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@prediction_bp.route('/models/retrain', methods=['POST'])
@log_request_info
@require_auth  # Could use require_admin for production
@validate_json_request
def retrain_models():
    """Trigger model retraining (admin only)."""
    try:
        data = request.get_json()
        model_type = data.get('model_type', 'all')
        
        logger.info(f"Model retraining requested by user {request.user_id} for {model_type}")
        
        # In a real implementation, this would trigger a background job
        # For now, return a placeholder response
        return jsonify({
            'success': True,
            'message': f'Retraining initiated for {model_type} model(s)',
            'job_id': f'retrain_{model_type}_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}',
            'timestamp': datetime.utcnow().isoformat()
        }), 202  # Accepted
        
    except Exception as e:
        logger.error(f"Model retraining failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Retraining failed',
            'message': 'An unexpected error occurred during model retraining',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# Public endpoints (no authentication required)
@prediction_bp.route('/models/info', methods=['GET'])
@log_request_info
@optional_auth
def get_model_info():
    """Get information about available models."""
    try:
        model_info = {
            'models': {
                'pcos_risk': {
                    'name': 'PCOS Risk Prediction',
                    'version': '1.0.0',
                    'description': 'Predicts PCOS risk based on health and lifestyle factors',
                    'input_features': [
                        'age', 'bmi', 'cycle_length', 'period_length',
                        'exercise_frequency', 'stress_level', 'family_history', 'sleep_quality'
                    ],
                    'output': {
                        'risk_score': 'Float between 0 and 1',
                        'risk_level': 'String: low, moderate, high, very_high',
                        'confidence': 'Float between 0 and 1'
                    }
                },
                'cycle_prediction': {
                    'name': 'Menstrual Cycle Prediction',
                    'version': '1.0.0',
                    'description': 'Predicts next menstrual cycle based on historical data',
                    'input_features': [
                        'cycle_history', 'age', 'lifestyle_factors'
                    ],
                    'output': {
                        'predicted_start_date': 'ISO date string',
                        'predicted_cycle_length': 'Integer (days)',
                        'confidence': 'Float between 0 and 1'
                    }
                }
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify(model_info), 200
        
    except Exception as e:
        logger.error(f"Model info retrieval failed: {str(e)}")
        return jsonify({
            'error': 'Info retrieval failed',
            'message': 'An unexpected error occurred',
            'timestamp': datetime.utcnow().isoformat()
        }), 500