"""
Request validation middleware for ML API.
"""

import json
from functools import wraps
from flask import request, jsonify
from typing import Dict, Any, List, Optional, Callable
import logging
from datetime import datetime

from ...utils.validation_utils import data_validator, sanitize_input_data

logger = logging.getLogger(__name__)

class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass

def validate_json_request(f):
    """Decorator to validate that request contains valid JSON."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'error': 'Invalid request format',
                'message': 'Request must contain valid JSON'
            }), 400
        
        try:
            request.get_json()
        except Exception as e:
            logger.error(f"JSON parsing error: {str(e)}")
            return jsonify({
                'error': 'Invalid JSON',
                'message': 'Request contains malformed JSON'
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function

def validate_content_type(allowed_types: List[str] = ['application/json']):
    """Decorator to validate request content type."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            content_type = request.content_type
            if content_type not in allowed_types:
                return jsonify({
                    'error': 'Invalid content type',
                    'message': f'Content-Type must be one of: {", ".join(allowed_types)}'
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def validate_request_size(max_size_mb: int = 10):
    """Decorator to validate request size."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            content_length = request.content_length
            if content_length and content_length > max_size_mb * 1024 * 1024:
                return jsonify({
                    'error': 'Request too large',
                    'message': f'Request size cannot exceed {max_size_mb}MB'
                }), 413
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def validate_pcos_prediction_request(f):
    """Decorator to validate PCOS prediction request data."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            data = request.get_json()
            if not data:
                return jsonify({
                    'error': 'Missing request data',
                    'message': 'Request body cannot be empty'
                }), 400
            
            # Sanitize input data
            sanitized_data = sanitize_input_data(data)
            
            # Validate using data validator
            is_valid, errors = data_validator.validate_pcos_input(sanitized_data)
            
            if not is_valid:
                logger.warning(f"PCOS prediction validation failed: {errors}")
                return jsonify({
                    'error': 'Validation failed',
                    'message': 'Invalid input data',
                    'details': errors
                }), 400
            
            # Add sanitized data to request
            request.validated_data = sanitized_data
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"PCOS validation error: {str(e)}")
            return jsonify({
                'error': 'Validation error',
                'message': 'Failed to validate request data'
            }), 500
    
    return decorated_function

def validate_cycle_prediction_request(f):
    """Decorator to validate cycle prediction request data."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            data = request.get_json()
            if not data:
                return jsonify({
                    'error': 'Missing request data',
                    'message': 'Request body cannot be empty'
                }), 400
            
            cycles = data.get('cycles', [])
            if not cycles:
                return jsonify({
                    'error': 'Missing cycles data',
                    'message': 'At least one cycle is required'
                }), 400
            
            # Validate using data validator
            is_valid, errors = data_validator.validate_cycle_input(cycles)
            
            if not is_valid:
                logger.warning(f"Cycle prediction validation failed: {errors}")
                return jsonify({
                    'error': 'Validation failed',
                    'message': 'Invalid cycle data',
                    'details': errors
                }), 400
            
            # Add validated data to request
            request.validated_data = data
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Cycle validation error: {str(e)}")
            return jsonify({
                'error': 'Validation error',
                'message': 'Failed to validate request data'
            }), 500
    
    return decorated_function

def validate_symptom_analysis_request(f):
    """Decorator to validate symptom analysis request data."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            data = request.get_json()
            if not data:
                return jsonify({
                    'error': 'Missing request data',
                    'message': 'Request body cannot be empty'
                }), 400
            
            symptoms = data.get('symptoms', [])
            if not symptoms:
                return jsonify({
                    'error': 'Missing symptoms data',
                    'message': 'At least one symptom is required'
                }), 400
            
            # Validate using data validator
            is_valid, errors = data_validator.validate_symptom_input(symptoms)
            
            if not is_valid:
                logger.warning(f"Symptom analysis validation failed: {errors}")
                return jsonify({
                    'error': 'Validation failed',
                    'message': 'Invalid symptom data',
                    'details': errors
                }), 400
            
            # Add validated data to request
            request.validated_data = data
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Symptom validation error: {str(e)}")
            return jsonify({
                'error': 'Validation error',
                'message': 'Failed to validate request data'
            }), 500
    
    return decorated_function

def validate_query_parameters(required_params: List[str] = None, optional_params: List[str] = None):
    """Decorator to validate query parameters."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            errors = []
            
            # Check required parameters
            if required_params:
                for param in required_params:
                    if param not in request.args:
                        errors.append(f"Missing required parameter: {param}")
            
            # Validate parameter values
            for param, value in request.args.items():
                if param == 'limit':
                    try:
                        limit = int(value)
                        if limit < 1 or limit > 1000:
                            errors.append("Limit must be between 1 and 1000")
                    except ValueError:
                        errors.append("Limit must be a valid integer")
                
                elif param == 'offset':
                    try:
                        offset = int(value)
                        if offset < 0:
                            errors.append("Offset must be non-negative")
                    except ValueError:
                        errors.append("Offset must be a valid integer")
                
                elif param in ['start_date', 'end_date']:
                    try:
                        datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except ValueError:
                        errors.append(f"{param} must be a valid ISO date")
            
            if errors:
                return jsonify({
                    'error': 'Invalid query parameters',
                    'message': 'One or more query parameters are invalid',
                    'details': errors
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def sanitize_request_data(f):
    """Decorator to sanitize request data."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.is_json:
            try:
                data = request.get_json()
                if data:
                    sanitized_data = sanitize_input_data(data)
                    request.sanitized_data = sanitized_data
                    logger.debug(f"Request data sanitized for endpoint {request.endpoint}")
            except Exception as e:
                logger.error(f"Data sanitization error: {str(e)}")
        
        return f(*args, **kwargs)
    
    return decorated_function

def log_validation_metrics(f):
    """Decorator to log validation metrics."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = datetime.utcnow()
        
        try:
            result = f(*args, **kwargs)
            
            # Log successful validation
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.info(f"Validation successful for {request.endpoint} in {duration:.3f}s")
            
            return result
            
        except ValidationError as e:
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.warning(f"Validation failed for {request.endpoint} in {duration:.3f}s: {str(e)}")
            raise
        except Exception as e:
            duration = (datetime.utcnow() - start_time).total_seconds()
            logger.error(f"Validation error for {request.endpoint} in {duration:.3f}s: {str(e)}")
            raise
    
    return decorated_function

def validate_model_type(valid_types: List[str]):
    """Decorator to validate model type parameter."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            model_type = kwargs.get('model_type') or request.args.get('model_type')
            
            if not model_type:
                return jsonify({
                    'error': 'Missing model type',
                    'message': 'Model type parameter is required'
                }), 400
            
            if model_type not in valid_types:
                return jsonify({
                    'error': 'Invalid model type',
                    'message': f'Model type must be one of: {", ".join(valid_types)}'
                }), 400
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def handle_validation_errors(app):
    """Setup validation error handlers for Flask app."""
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return jsonify({
            'error': 'Validation failed',
            'message': str(error)
        }), 400
    
    @app.errorhandler(400)
    def handle_bad_request(error):
        return jsonify({
            'error': 'Bad request',
            'message': 'The request could not be processed'
        }), 400
    
    @app.errorhandler(413)
    def handle_request_too_large(error):
        return jsonify({
            'error': 'Request too large',
            'message': 'The request payload is too large'
        }), 413
    
    @app.errorhandler(422)
    def handle_unprocessable_entity(error):
        return jsonify({
            'error': 'Unprocessable entity',
            'message': 'The request data could not be processed'
        }), 422

# Common validation decorators
def validate_ml_request(request_type: str):
    """Generic ML request validation decorator."""
    validators = {
        'pcos_prediction': validate_pcos_prediction_request,
        'cycle_prediction': validate_cycle_prediction_request,
        'symptom_analysis': validate_symptom_analysis_request
    }
    
    validator = validators.get(request_type)
    if not validator:
        raise ValueError(f"Unknown request type: {request_type}")
    
    return validator

# Export main decorators
__all__ = [
    'validate_json_request',
    'validate_content_type',
    'validate_request_size',
    'validate_pcos_prediction_request',
    'validate_cycle_prediction_request',
    'validate_symptom_analysis_request',
    'validate_query_parameters',
    'sanitize_request_data',
    'log_validation_metrics',
    'validate_model_type',
    'handle_validation_errors',
    'validate_ml_request'
]