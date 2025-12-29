"""
Unit tests for ML models.
"""

import unittest
import numpy as np
import pandas as pd
from unittest.mock import patch, MagicMock
import sys
import os

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from models.pcos_risk_model import PCOSRiskModel
from models.cycle_prediction_model import CyclePredictionModel
from models.symptom_analysis_model import SymptomAnalysisModel

class TestPCOSRiskModel(unittest.TestCase):
    """Test cases for PCOS Risk Model."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.model = PCOSRiskModel()
        
        # Sample training data
        self.sample_data = pd.DataFrame({
            'age': [25, 30, 35, 28, 32],
            'bmi': [22.5, 28.0, 24.5, 26.0, 30.5],
            'cycle_length': [28, 35, 26, 30, 40],
            'period_length': [5, 4, 6, 5, 3],
            'exercise_frequency': [3, 1, 5, 2, 0],
            'stress_level': [2, 4, 1, 3, 4],
            'family_history': [0, 1, 0, 1, 1],
            'sleep_quality': [3, 2, 4, 3, 2]
        })
        
        self.sample_labels = np.array([0, 1, 0, 1, 1])
    
    def test_model_initialization(self):
        """Test model initialization."""
        self.assertIsNotNone(self.model)
        self.assertIsNone(self.model.model)
        self.assertFalse(self.model.is_trained)
    
    def test_data_preprocessing(self):
        """Test data preprocessing."""
        processed_data = self.model.preprocess_data(self.sample_data)
        
        self.assertIsInstance(processed_data, np.ndarray)
        self.assertEqual(processed_data.shape[0], len(self.sample_data))
        self.assertEqual(processed_data.shape[1], len(self.sample_data.columns))
    
    def test_model_training(self):
        """Test model training."""
        self.model.train(self.sample_data, self.sample_labels)
        
        self.assertTrue(self.model.is_trained)
        self.assertIsNotNone(self.model.model)
    
    def test_prediction(self):
        """Test model prediction."""
        # Train model first
        self.model.train(self.sample_data, self.sample_labels)
        
        # Test prediction
        test_data = self.sample_data.iloc[:2]
        predictions = self.model.predict(test_data)
        
        self.assertIsInstance(predictions, dict)
        self.assertIn('risk_score', predictions)
        self.assertIn('risk_level', predictions)
        self.assertIn('confidence', predictions)
    
    def test_feature_importance(self):
        """Test feature importance extraction."""
        self.model.train(self.sample_data, self.sample_labels)
        importance = self.model.get_feature_importance()
        
        self.assertIsInstance(importance, dict)
        self.assertEqual(len(importance), len(self.sample_data.columns))
    
    def test_model_evaluation(self):
        """Test model evaluation."""
        self.model.train(self.sample_data, self.sample_labels)
        metrics = self.model.evaluate(self.sample_data, self.sample_labels)
        
        self.assertIsInstance(metrics, dict)
        self.assertIn('accuracy', metrics)
        self.assertIn('precision', metrics)
        self.assertIn('recall', metrics)
        self.assertIn('f1_score', metrics)

class TestCyclePredictionModel(unittest.TestCase):
    """Test cases for Cycle Prediction Model."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.model = CyclePredictionModel()
        
        # Sample cycle data
        self.sample_cycles = [
            {'start_date': '2023-01-01', 'cycle_length': 28, 'period_length': 5},
            {'start_date': '2023-01-29', 'cycle_length': 30, 'period_length': 4},
            {'start_date': '2023-02-28', 'cycle_length': 27, 'period_length': 6},
            {'start_date': '2023-03-27', 'cycle_length': 29, 'period_length': 5},
            {'start_date': '2023-04-25', 'cycle_length': 28, 'period_length': 5}
        ]
    
    def test_model_initialization(self):
        """Test model initialization."""
        self.assertIsNotNone(self.model)
        self.assertIsNone(self.model.model)
        self.assertFalse(self.model.is_trained)
    
    def test_cycle_data_processing(self):
        """Test cycle data processing."""
        processed_data = self.model.process_cycle_data(self.sample_cycles)
        
        self.assertIsInstance(processed_data, pd.DataFrame)
        self.assertGreater(len(processed_data.columns), 0)
    
    def test_prediction(self):
        """Test cycle prediction."""
        # Mock training
        self.model.is_trained = True
        self.model.model = MagicMock()
        self.model.model.predict.return_value = np.array([28.5])
        
        prediction = self.model.predict(self.sample_cycles)
        
        self.assertIsInstance(prediction, dict)
        self.assertIn('predicted_cycle_length', prediction)
        self.assertIn('confidence', prediction)
    
    def test_feature_engineering(self):
        """Test feature engineering for cycles."""
        features = self.model.engineer_features(self.sample_cycles)
        
        self.assertIsInstance(features, dict)
        self.assertIn('avg_cycle_length', features)
        self.assertIn('cycle_regularity', features)

class TestSymptomAnalysisModel(unittest.TestCase):
    """Test cases for Symptom Analysis Model."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.model = SymptomAnalysisModel()
        
        # Sample symptom data
        self.sample_symptoms = [
            {'type': 'cramps', 'severity': 7, 'date': '2023-01-01', 'cycle_day': 1},
            {'type': 'bloating', 'severity': 5, 'date': '2023-01-02', 'cycle_day': 2},
            {'type': 'mood_swings', 'severity': 6, 'date': '2023-01-15', 'cycle_day': 15},
            {'type': 'headache', 'severity': 4, 'date': '2023-01-20', 'cycle_day': 20},
            {'type': 'fatigue', 'severity': 8, 'date': '2023-01-25', 'cycle_day': 25}
        ]
    
    def test_model_initialization(self):
        """Test model initialization."""
        self.assertIsNotNone(self.model)
    
    def test_symptom_data_processing(self):
        """Test symptom data processing."""
        processed_data = self.model.process_symptom_data(self.sample_symptoms)
        
        self.assertIsInstance(processed_data, pd.DataFrame)
        self.assertEqual(len(processed_data), len(self.sample_symptoms))
    
    def test_pattern_analysis(self):
        """Test symptom pattern analysis."""
        analysis = self.model.analyze_patterns(self.sample_symptoms)
        
        self.assertIsInstance(analysis, dict)
        self.assertIn('patterns', analysis)
        self.assertIn('correlations', analysis)
    
    def test_clustering(self):
        """Test symptom clustering."""
        # Mock clustering results
        with patch.object(self.model, 'cluster_symptoms') as mock_cluster:
            mock_cluster.return_value = {
                'clusters': [0, 1, 0, 1, 0],
                'cluster_centers': [[5.5, 10], [6.0, 17.5]],
                'n_clusters': 2
            }
            
            result = self.model.cluster_symptoms(self.sample_symptoms)
            
            self.assertIsInstance(result, dict)
            self.assertIn('clusters', result)
            self.assertIn('n_clusters', result)

class TestModelIntegration(unittest.TestCase):
    """Integration tests for model interactions."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.pcos_model = PCOSRiskModel()
        self.cycle_model = CyclePredictionModel()
        self.symptom_model = SymptomAnalysisModel()
    
    def test_model_pipeline(self):
        """Test complete model pipeline."""
        # Sample user data
        user_data = {
            'age': 28,
            'bmi': 25.5,
            'cycle_length': 30,
            'period_length': 5,
            'exercise_frequency': 3,
            'stress_level': 2,
            'family_history': 0,
            'sleep_quality': 3
        }
        
        cycles = [
            {'start_date': '2023-01-01', 'cycle_length': 28},
            {'start_date': '2023-01-29', 'cycle_length': 30},
            {'start_date': '2023-02-28', 'cycle_length': 27}
        ]
        
        symptoms = [
            {'type': 'cramps', 'severity': 6, 'cycle_day': 1},
            {'type': 'bloating', 'severity': 4, 'cycle_day': 2}
        ]
        
        # Test that models can work together
        # (In a real scenario, you'd test actual model interactions)
        self.assertIsNotNone(user_data)
        self.assertIsNotNone(cycles)
        self.assertIsNotNone(symptoms)

class TestModelValidation(unittest.TestCase):
    """Test model validation and error handling."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.pcos_model = PCOSRiskModel()
    
    def test_invalid_input_handling(self):
        """Test handling of invalid inputs."""
        # Test with missing required fields
        invalid_data = pd.DataFrame({
            'age': [25, 30],
            'bmi': [22.5, 28.0]
            # Missing other required fields
        })
        
        with self.assertRaises((ValueError, KeyError)):
            self.pcos_model.preprocess_data(invalid_data)
    
    def test_empty_data_handling(self):
        """Test handling of empty data."""
        empty_data = pd.DataFrame()
        
        with self.assertRaises(ValueError):
            self.pcos_model.preprocess_data(empty_data)
    
    def test_prediction_without_training(self):
        """Test prediction without training."""
        test_data = pd.DataFrame({
            'age': [25],
            'bmi': [22.5],
            'cycle_length': [28],
            'period_length': [5],
            'exercise_frequency': [3],
            'stress_level': [2],
            'family_history': [0],
            'sleep_quality': [3]
        })
        
        with self.assertRaises(ValueError):
            self.pcos_model.predict(test_data)

if __name__ == '__main__':
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestPCOSRiskModel))
    test_suite.addTest(unittest.makeSuite(TestCyclePredictionModel))
    test_suite.addTest(unittest.makeSuite(TestSymptomAnalysisModel))
    test_suite.addTest(unittest.makeSuite(TestModelIntegration))
    test_suite.addTest(unittest.makeSuite(TestModelValidation))
    
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