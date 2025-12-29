"""
Authentication middleware for ML API.
"""

import jwt
import os
from functools import wraps
from flask import request, jsonify, current_app
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# JWT configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')

class AuthenticationError(Exception):
    """Custom exception for authentication errors."""
    pass

class AuthorizationError(Exception):
    """Custom exception for authorization errors."""
    pass

def extract_token_from_header(auth_header: str) -> Optional[str]:
    """Extract JWT token from Authorization header."""
    if not auth_header:
        return None
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    
    return parts[1]

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token has expired")
    except jwt.InvalidTokenError:
        raise AuthenticationError("Invalid token")

def require_auth(f):
    """Decorator to require authentication for API endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Get Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({
                    'error': 'Authentication required',
                    'message': 'Authorization header is missing'
                }), 401
            
            # Extract token
            token = extract_token_from_header(auth_header)
            if not token:
                return jsonify({
                    'error': 'Authentication required',
                    'message': 'Invalid authorization header format'
                }), 401
            
            # Verify token
            payload = verify_jwt_token(token)
            
            # Add user info to request context
            request.user_id = payload.get('userId')
            request.user_email = payload.get('email')
            request.user_role = payload.get('role', 'user')
            
            logger.info(f"Authenticated request from user {request.user_id}")
            
            return f(*args, **kwargs)
            
        except AuthenticationError as e:
            logger.warning(f"Authentication failed: {str(e)}")
            return jsonify({
                'error': 'Authentication failed',
                'message': str(e)
            }), 401
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return jsonify({
                'error': 'Authentication error',
                'message': 'Internal authentication error'
            }), 500
    
    return decorated_function

def require_admin(f):
    """Decorator to require admin role for API endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First check authentication
        auth_result = require_auth(f)(*args, **kwargs)
        if isinstance(auth_result, tuple) and auth_result[1] != 200:
            return auth_result
        
        # Check admin role
        user_role = getattr(request, 'user_role', None)
        if user_role != 'admin':
            logger.warning(f"Authorization failed: User {request.user_id} attempted admin action")
            return jsonify({
                'error': 'Authorization failed',
                'message': 'Admin privileges required'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def optional_auth(f):
    """Decorator for optional authentication (doesn't fail if no token)."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header:
                token = extract_token_from_header(auth_header)
                if token:
                    payload = verify_jwt_token(token)
                    request.user_id = payload.get('userId')
                    request.user_email = payload.get('email')
                    request.user_role = payload.get('role', 'user')
                    logger.info(f"Optional auth: Authenticated user {request.user_id}")
                else:
                    request.user_id = None
            else:
                request.user_id = None
                
        except AuthenticationError:
            # For optional auth, we don't fail on auth errors
            request.user_id = None
            logger.info("Optional auth: Invalid token, proceeding as anonymous")
        except Exception as e:
            logger.error(f"Optional auth error: {str(e)}")
            request.user_id = None
        
        return f(*args, **kwargs)
    
    return decorated_function

def create_api_key_auth(valid_api_keys: set):
    """Create API key authentication decorator."""
    def require_api_key(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            api_key = request.headers.get('X-API-Key')
            if not api_key:
                return jsonify({
                    'error': 'API key required',
                    'message': 'X-API-Key header is missing'
                }), 401
            
            if api_key not in valid_api_keys:
                logger.warning(f"Invalid API key attempted: {api_key[:8]}...")
                return jsonify({
                    'error': 'Invalid API key',
                    'message': 'The provided API key is not valid'
                }), 401
            
            logger.info(f"API key authenticated: {api_key[:8]}...")
            return f(*args, **kwargs)
        
        return decorated_function
    return require_api_key

def rate_limit_by_user(max_requests: int = 100, window_minutes: int = 60):
    """Rate limiting decorator based on user ID."""
    from collections import defaultdict
    from datetime import datetime, timedelta
    
    request_counts = defaultdict(list)
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = getattr(request, 'user_id', None)
            if not user_id:
                # For anonymous users, use IP address
                user_id = request.remote_addr
            
            now = datetime.utcnow()
            window_start = now - timedelta(minutes=window_minutes)
            
            # Clean old requests
            request_counts[user_id] = [
                req_time for req_time in request_counts[user_id]
                if req_time > window_start
            ]
            
            # Check rate limit
            if len(request_counts[user_id]) >= max_requests:
                logger.warning(f"Rate limit exceeded for user {user_id}")
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Maximum {max_requests} requests per {window_minutes} minutes'
                }), 429
            
            # Add current request
            request_counts[user_id].append(now)
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def log_request_info(f):
    """Decorator to log request information."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = getattr(request, 'user_id', 'anonymous')
        endpoint = request.endpoint
        method = request.method
        ip = request.remote_addr
        
        logger.info(f"API Request: {method} {endpoint} from user {user_id} (IP: {ip})")
        
        return f(*args, **kwargs)
    
    return decorated_function

# Middleware for Flask app
def setup_auth_middleware(app):
    """Setup authentication middleware for Flask app."""
    
    @app.before_request
    def before_request():
        # Skip auth for health check and public endpoints
        public_endpoints = ['health.health_check', 'health.model_status']
        if request.endpoint in public_endpoints:
            return
        
        # Log all requests
        logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")
    
    @app.after_request
    def after_request(response):
        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        
        # Log response
        logger.info(f"Response: {response.status_code} for {request.method} {request.path}")
        
        return response
    
    @app.errorhandler(AuthenticationError)
    def handle_auth_error(error):
        return jsonify({
            'error': 'Authentication failed',
            'message': str(error)
        }), 401
    
    @app.errorhandler(AuthorizationError)
    def handle_authz_error(error):
        return jsonify({
            'error': 'Authorization failed',
            'message': str(error)
        }), 403

# Export main decorators
__all__ = [
    'require_auth',
    'require_admin',
    'optional_auth',
    'create_api_key_auth',
    'rate_limit_by_user',
    'log_request_info',
    'setup_auth_middleware'
]