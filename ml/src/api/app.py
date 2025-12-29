"""
Flask application for ML service API.
"""

import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS

from .routes.prediction import prediction_bp
from .routes.health import health_bp
from .middleware.auth import setup_auth_middleware
from .middleware.validation import handle_validation_errors
from ..utils.constants import API_CONFIG, LOGGING_CONFIG

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOGGING_CONFIG['level']),
    format=LOGGING_CONFIG['format'],
    handlers=[
        logging.FileHandler(LOGGING_CONFIG['file']),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def create_app(config_name='default'):
    """Create and configure Flask application."""
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, origins=['http://localhost:3000', 'https://fembalance.com'])
    
    # Configure app
    app.config['DEBUG'] = API_CONFIG['debug']
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Setup middleware
    setup_auth_middleware(app)
    handle_validation_errors(app)
    
    # Register blueprints
    app.register_blueprint(health_bp, url_prefix='/health')
    app.register_blueprint(prediction_bp, url_prefix='/api')
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500
    
    @app.route('/')
    def index():
        """Root endpoint."""
        return jsonify({
            'service': 'FEMbalance ML API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/health',
                'models': '/health/models',
                'pcos_prediction': '/api/predict/pcos-risk',
                'cycle_prediction': '/api/predict/next-cycle',
                'symptom_analysis': '/api/analyze/symptoms'
            }
        })
    
    logger.info("Flask application created successfully")
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=API_CONFIG['host'],
        port=API_CONFIG['port'],
        debug=API_CONFIG['debug']
    )