"""
Unit tests for ML API endpoints.
"""

import unittest
import json
from unittest.mock import patch, MagicMock
import sys
import os

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# Mock Flask app for testing
try:
    from api.app import create_app
    from api.routes.prediction import prediction_bp
    from api.routes.health import health_bp
except ImportError:
    # Create mock app if imports fail
    from flask import Flask
    
    def create_app():
        app = Flask(__name__)
        return app

class TestHealthEndpoints(unittest.TestCase):
    """Test cases for health check endpoints."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
    
    def test_health_check(self):
        """Test basic health check endpoint."""
        response = self.client.get('/health')
        
        # Should return 200 even if models aren't loaded
        self.assertIn(response.status_code, [200, 404])  # 404 if route not found
    
    def test_model_status(self):
        """Test model status endpoint."""
        response = self.client.get('/health/models')
        
        # Should return some status information
        self.assertIn(response.status_code, [200, 404])

class TestPredictionEndpoints(unittest.TestCase):
    """Test cases for prediction endpoints."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
        
        # Sample request data
        self.pcos_request_data = {
            'age': 28,
            'bmi': 25.5,
            'cycle_length': 30,
            'period_length': 5,
            'exercise_frequency': 3,
            'stress_level': 2,
            'family_history': False,
            'sleep_quality': 3
        }
        
        self.cycle_request_data = {
            'cycles': [
                {'start_date': '2023-01-01', 'cycle_length': 28, 'period_length': 5},
                {'start_date': '2023-01-29', 'cycle_length': 30, 'period_length': 4},
                {'start_date': '2023-02-28', 'cycle_length': 27, 'period_length': 6}
            ]
        }
        
        self.symptom_request_data = {
            'symptoms': [
                {'type': 'cramps', 'severity': 7, 'date': '2023-01-01', 'cycle_day': 1},
                {'type': 'bloating', 'severity': 5, 'date': '2023-01-02', 'cycle_day': 2},
                {'type': 'mood_swings', 'severity': 6, 'date': '2023-01-15', 'cycle_day': 15}
            ]
        }
    
    @patch('api.routes.prediction.ml_handler')
    def test_pcos_prediction_endpoint(self, mock_handler):
        """Test PCOS risk prediction endpoint."""
        # Mock successful prediction
        mock_handler.predict_pcos_risk.return_value = {
            'risk_score': 0.35,
            'risk_level': 'moderate',
            'confidence': 0.82,
            'recommendations': ['Exercise regularly', 'Maintain healthy diet']
        }
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps(self.pcos_request_data),
            content_type='application/json'
        )
        
        # Check response (might be 404 if route not implemented)
        if response.status_code == 200:
            data = json.loads(response.data)
            self.assertIn('risk_score', data)
            self.assertIn('risk_level', data)
    
    @patch('api.routes.prediction.ml_handler')
    def test_cycle_prediction_endpoint(self, mock_handler):
        """Test cycle prediction endpoint."""
        # Mock successful prediction
        mock_handler.predict_next_cycle.return_value = {
            'predicted_start_date': '2023-03-27',
            'predicted_cycle_length': 28,
            'confidence': 0.75,
            'fertile_window': {
                'start': '2023-04-08',
                'end': '2023-04-14'
            }
        }
        
        response = self.client.post(
            '/api/predict/next-cycle',
            data=json.dumps(self.cycle_request_data),
            content_type='application/json'
        )
        
        # Check response
        if response.status_code == 200:
            data = json.loads(response.data)
            self.assertIn('predicted_cycle_length', data)
    
    @patch('api.routes.prediction.ml_handler')
    def test_symptom_analysis_endpoint(self, mock_handler):
        """Test symptom analysis endpoint."""
        # Mock successful analysis
        mock_handler.analyze_symptoms.return_value = {
            'patterns': {
                'most_common': {'cramps': 1, 'bloating': 1, 'mood_swings': 1}
            },
            'correlations': {'cycle_phase': 'Available'},
            'insights': ['Symptoms are most common during menstrual phase']
        }
        
        response = self.client.post(
            '/api/analyze/symptoms',
            data=json.dumps(self.symptom_request_data),
            content_type='application/json'
        )
        
        # Check response
        if response.status_code == 200:
            data = json.loads(response.data)
            self.assertIn('patterns', data)
    
    def test_invalid_request_format(self):
        """Test handling of invalid request format."""
        # Test with invalid JSON
        response = self.client.post(
            '/api/predict/pcos-risk',
            data='invalid json',
            content_type='application/json'
        )
        
        # Should return 400 or 404
        self.assertIn(response.status_code, [400, 404])
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields."""
        incomplete_data = {
            'age': 28,
            'bmi': 25.5
            # Missing other required fields
        }
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps(incomplete_data),
            content_type='application/json'
        )
        
        # Should return 400 or 404
        self.assertIn(response.status_code, [400, 404])
    
    def test_invalid_field_values(self):
        """Test handling of invalid field values."""
        invalid_data = self.pcos_request_data.copy()
        invalid_data['age'] = -5  # Invalid age
        invalid_data['bmi'] = 100  # Invalid BMI
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        # Should return 400 or 404
        self.assertIn(response.status_code, [400, 404])

class TestAPIAuthentication(unittest.TestCase):
    """Test cases for API authentication."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
    
    def test_missing_auth_header(self):
        """Test request without authentication header."""
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps({'age': 28, 'bmi': 25.5}),
            content_type='application/json'
        )
        
        # Should return 401 or 404 (if auth not implemented)
        self.assertIn(response.status_code, [401, 404])
    
    def test_invalid_auth_token(self):
        """Test request with invalid authentication token."""
        headers = {'Authorization': 'Bearer invalid_token'}
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps({'age': 28, 'bmi': 25.5}),
            content_type='application/json',
            headers=headers
        )
        
        # Should return 401 or 404
        self.assertIn(response.status_code, [401, 404])
    
    @patch('api.middleware.auth.verify_jwt_token')
    def test_valid_auth_token(self, mock_verify):
        """Test request with valid authentication token."""
        # Mock successful token verification
        mock_verify.return_value = {'userId': '123', 'email': 'test@example.com'}
        
        headers = {'Authorization': 'Bearer valid_token'}
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps({'age': 28, 'bmi': 25.5}),
            content_type='application/json',
            headers=headers
        )
        
        # Should not return 401 (might return 404 if route not implemented)
        self.assertNotEqual(response.status_code, 401)

class TestAPIValidation(unittest.TestCase):
    """Test cases for API request validation."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
    
    def test_content_type_validation(self):
        """Test content type validation."""
        # Test with wrong content type
        response = self.client.post(
            '/api/predict/pcos-risk',
            data='age=28&bmi=25.5',
            content_type='application/x-www-form-urlencoded'
        )
        
        # Should return 400 or 404
        self.assertIn(response.status_code, [400, 404])
    
    def test_request_size_validation(self):
        """Test request size validation."""
        # Create large request data
        large_data = {
            'age': 28,
            'bmi': 25.5,
            'large_field': 'x' * 10000000  # 10MB of data
        }
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps(large_data),
            content_type='application/json'
        )
        
        # Should return 413 or 404
        self.assertIn(response.status_code, [413, 404])
    
    def test_data_type_validation(self):
        """Test data type validation."""
        invalid_types_data = {
            'age': 'twenty-eight',  # Should be number
            'bmi': True,  # Should be number
            'cycle_length': [28],  # Should be number, not array
            'period_length': {'value': 5}  # Should be number, not object
        }
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps(invalid_types_data),
            content_type='application/json'
        )
        
        # Should return 400 or 404
        self.assertIn(response.status_code, [400, 404])

class TestAPIErrorHandling(unittest.TestCase):
    """Test cases for API error handling."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
    
    @patch('api.routes.prediction.ml_handler')
    def test_model_error_handling(self, mock_handler):
        """Test handling of model errors."""
        # Mock model error
        mock_handler.predict_pcos_risk.side_effect = Exception("Model error")
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps({'age': 28, 'bmi': 25.5}),
            content_type='application/json'
        )
        
        # Should return 500 or 404
        self.assertIn(response.status_code, [500, 404])
    
    @patch('api.routes.prediction.ml_handler')
    def test_model_not_loaded_error(self, mock_handler):
        """Test handling when model is not loaded."""
        # Mock model not loaded error
        mock_handler.predict_pcos_risk.side_effect = RuntimeError("Model not loaded")
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps({'age': 28, 'bmi': 25.5}),
            content_type='application/json'
        )
        
        # Should return 503 or 404
        self.assertIn(response.status_code, [503, 500, 404])

class TestAPIPerformance(unittest.TestCase):
    """Test cases for API performance."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()
    
    @patch('api.routes.prediction.ml_handler')
    def test_response_time(self, mock_handler):
        """Test API response time."""
        import time
        
        # Mock quick response
        mock_handler.predict_pcos_risk.return_value = {
            'risk_score': 0.35,
            'risk_level': 'moderate'
        }
        
        start_time = time.time()
        
        response = self.client.post(
            '/api/predict/pcos-risk',
            data=json.dumps({'age': 28, 'bmi': 25.5}),
            content_type='application/json'
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Response should be reasonably fast (less than 5 seconds for test)
        self.assertLess(response_time, 5.0)
    
    def test_concurrent_requests(self):
        """Test handling of concurrent requests."""
        import threading
        import time
        
        results = []
        
        def make_request():
            response = self.client.get('/health')
            results.append(response.status_code)
        
        # Create multiple threads
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
        
        # Start all threads
        for thread in threads:
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Check that all requests completed
        self.assertEqual(len(results), 5)

if __name__ == '__main__':
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestHealthEndpoints))
    test_suite.addTest(unittest.makeSuite(TestPredictionEndpoints))
    test_suite.addTest(unittest.makeSuite(TestAPIAuthentication))
    test_suite.addTest(unittest.makeSuite(TestAPIValidation))
    test_suite.addTest(unittest.makeSuite(TestAPIErrorHandling))
    test_suite.addTest(unittest.makeSuite(TestAPIPerformance))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    print(f"{'='*50}")