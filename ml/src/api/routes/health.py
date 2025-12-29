"""
Health check routes for ML API.
"""

from flask import Blueprint, jsonify
import logging
from datetime import datetime

from ...inference.api_handler import ml_handler

logger = logging.getLogger(__name__)

health_bp = Blueprint('health', __name__)

@health_bp.route('/')
def health_check():
    """Basic health check endpoint."""
    try:
        health_status = ml_handler.health_check()
        
        status_code = 200 if health_status['status'] == 'healthy' else 503
        
        return jsonify(health_status), status_code
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': 'Health check failed',
            'version': '1.0.0'
        }), 503

@health_bp.route('/models')
def model_status():
    """Check status of ML models."""
    try:
        model_status = {
            'timestamp': datetime.utcnow().isoformat(),
            'models': {
                'pcos_risk': {
                    'loaded': ml_handler.pcos_predictor.is_loaded(),
                    'version': '1.0.0',
                    'last_updated': datetime.utcnow().isoformat()
                },
                'cycle_prediction': {
                    'loaded': ml_handler.cycle_predictor.is_loaded(),
                    'version': '1.0.0',
                    'last_updated': datetime.utcnow().isoformat()
                }
            },
            'overall_status': 'healthy' if ml_handler.models_loaded else 'degraded'
        }
        
        status_code = 200 if ml_handler.models_loaded else 503
        
        return jsonify(model_status), status_code
        
    except Exception as e:
        logger.error(f"Model status check failed: {str(e)}")
        return jsonify({
            'error': 'Model status check failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_bp.route('/metrics')
def system_metrics():
    """Get system performance metrics."""
    try:
        import psutil
        import os
        
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        metrics = {
            'timestamp': datetime.utcnow().isoformat(),
            'system': {
                'cpu_usage_percent': cpu_percent,
                'memory': {
                    'total_gb': round(memory.total / (1024**3), 2),
                    'available_gb': round(memory.available / (1024**3), 2),
                    'used_percent': memory.percent
                },
                'disk': {
                    'total_gb': round(disk.total / (1024**3), 2),
                    'free_gb': round(disk.free / (1024**3), 2),
                    'used_percent': round((disk.used / disk.total) * 100, 2)
                }
            },
            'process': {
                'pid': os.getpid(),
                'memory_mb': round(psutil.Process().memory_info().rss / (1024**2), 2)
            }
        }
        
        return jsonify(metrics), 200
        
    except ImportError:
        return jsonify({
            'error': 'System metrics unavailable',
            'message': 'psutil package not installed',
            'timestamp': datetime.utcnow().isoformat()
        }), 503
    except Exception as e:
        logger.error(f"System metrics failed: {str(e)}")
        return jsonify({
            'error': 'System metrics failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@health_bp.route('/ready')
def readiness_check():
    """Kubernetes readiness probe endpoint."""
    try:
        # Check if models are loaded and ready
        if not ml_handler.models_loaded:
            return jsonify({
                'ready': False,
                'message': 'Models not loaded',
                'timestamp': datetime.utcnow().isoformat()
            }), 503
        
        # Perform a quick test prediction to ensure models work
        test_data = {
            'age': 25,
            'bmi': 22.5,
            'cycle_length': 28,
            'period_length': 5,
            'exercise_frequency': 3,
            'stress_level': 2,
            'family_history': False,
            'sleep_quality': 3
        }
        
        # This should not fail if models are properly loaded
        ml_handler.predict_pcos_risk(test_data)
        
        return jsonify({
            'ready': True,
            'message': 'Service is ready',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return jsonify({
            'ready': False,
            'message': f'Service not ready: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 503

@health_bp.route('/live')
def liveness_check():
    """Kubernetes liveness probe endpoint."""
    try:
        # Basic liveness check - just ensure the service is responding
        return jsonify({
            'alive': True,
            'timestamp': datetime.utcnow().isoformat(),
            'uptime_seconds': 0  # Could track actual uptime if needed
        }), 200
        
    except Exception as e:
        logger.error(f"Liveness check failed: {str(e)}")
        return jsonify({
            'alive': False,
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500