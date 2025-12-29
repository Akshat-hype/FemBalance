"""
Unit tests for data preprocessing modules.
"""

import unittest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import sys
import os

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from data.preprocessing.data_cleaner import DataCleaner
from data.preprocessing.feature_engineer import FeatureEngineer
from data.preprocessing.data_validator import DataValidator

class TestDataCleaner(unittest.TestCase):
    """Test cases for DataCleaner."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.cleaner = DataCleaner()
        
        # Sample data with various issues
        self.sample_data = pd.DataFrame({
            'age': [25, 30, np.nan, 28, 200],  # Missing value and outlier
            'bmi': [22.5, 28.0, 24.5, np.inf, 30.5],  # Infinite value
            'cycle_length': [28, 35, 26, 30, -5],  # Negative value
            'period_length': [5, 4, 6, 5, 15],  # Outlier
            'exercise_frequency': [3, 1, 5, 2, 0],
            'stress_level': [2, 4, 1, 3, 4],
            'duplicate_col': [1, 2, 3, 4, 5],
            'duplicate_col_copy': [1, 2, 3, 4, 5]  # Duplicate column
        })
    
    def test_remove_duplicates(self):
        """Test duplicate removal."""
        # Add duplicate rows
        data_with_duplicates = pd.concat([self.sample_data, self.sample_data.iloc[:2]])
        
        cleaned_data = self.cleaner.remove_duplicates(data_with_duplicates)
        
        self.assertEqual(len(cleaned_data), len(self.sample_data))
        self.assertFalse(cleaned_data.duplicated().any())
    
    def test_handle_missing_values(self):
        """Test missing value handling."""
        cleaned_data = self.cleaner.handle_missing_values(self.sample_data)
        
        # Check that missing values are handled
        self.assertFalse(cleaned_data.isnull().any().any())
    
    def test_remove_outliers(self):
        """Test outlier removal."""
        cleaned_data = self.cleaner.remove_outliers(self.sample_data, ['age', 'period_length'])
        
        # Check that extreme outliers are removed
        self.assertTrue(cleaned_data['age'].max() < 200)
        self.assertTrue(cleaned_data['period_length'].max() < 15)
    
    def test_handle_infinite_values(self):
        """Test infinite value handling."""
        cleaned_data = self.cleaner.handle_infinite_values(self.sample_data)
        
        # Check that infinite values are handled
        self.assertFalse(np.isinf(cleaned_data.values).any())
    
    def test_remove_invalid_ranges(self):
        """Test removal of values outside valid ranges."""
        ranges = {
            'age': (12, 60),
            'cycle_length': (21, 45),
            'period_length': (1, 10)
        }
        
        cleaned_data = self.cleaner.remove_invalid_ranges(self.sample_data, ranges)
        
        # Check that values are within valid ranges
        for col, (min_val, max_val) in ranges.items():
            if col in cleaned_data.columns:
                self.assertTrue((cleaned_data[col] >= min_val).all())
                self.assertTrue((cleaned_data[col] <= max_val).all())
    
    def test_clean_pipeline(self):
        """Test complete cleaning pipeline."""
        cleaned_data = self.cleaner.clean_data(self.sample_data)
        
        # Check that data is cleaned
        self.assertFalse(cleaned_data.isnull().any().any())
        self.assertFalse(np.isinf(cleaned_data.select_dtypes(include=[np.number]).values).any())
        self.assertFalse(cleaned_data.duplicated().any())

class TestFeatureEngineer(unittest.TestCase):
    """Test cases for FeatureEngineer."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.engineer = FeatureEngineer()
        
        # Sample cycle data
        self.cycle_data = pd.DataFrame({
            'user_id': [1, 1, 1, 2, 2, 2],
            'start_date': [
                datetime(2023, 1, 1),
                datetime(2023, 1, 29),
                datetime(2023, 2, 26),
                datetime(2023, 1, 5),
                datetime(2023, 2, 2),
                datetime(2023, 3, 2)
            ],
            'cycle_length': [28, 27, 29, 28, 28, 30],
            'period_length': [5, 4, 6, 5, 5, 4]
        })
        
        # Sample user data
        self.user_data = pd.DataFrame({
            'user_id': [1, 2],
            'age': [25, 30],
            'bmi': [22.5, 28.0],
            'exercise_frequency': [3, 1],
            'stress_level': [2, 4]
        })
    
    def test_create_cycle_features(self):
        """Test cycle feature creation."""
        features = self.engineer.create_cycle_features(self.cycle_data)
        
        self.assertIn('avg_cycle_length', features.columns)
        self.assertIn('cycle_regularity', features.columns)
        self.assertIn('avg_period_length', features.columns)
        self.assertEqual(len(features), 2)  # Two users
    
    def test_create_bmi_categories(self):
        """Test BMI categorization."""
        categorized_data = self.engineer.create_bmi_categories(self.user_data)
        
        self.assertIn('bmi_category', categorized_data.columns)
        self.assertIn(categorized_data['bmi_category'].iloc[0], ['underweight', 'normal', 'overweight', 'obese'])
    
    def test_create_age_groups(self):
        """Test age group creation."""
        grouped_data = self.engineer.create_age_groups(self.user_data)
        
        self.assertIn('age_group', grouped_data.columns)
        self.assertTrue(all(isinstance(group, str) for group in grouped_data['age_group']))
    
    def test_encode_categorical_features(self):
        """Test categorical feature encoding."""
        categorical_data = pd.DataFrame({
            'symptom_type': ['cramps', 'bloating', 'mood_swings', 'cramps'],
            'severity': [7, 5, 6, 8]
        })
        
        encoded_data = self.engineer.encode_categorical_features(categorical_data, ['symptom_type'])
        
        # Check that categorical column is encoded
        self.assertTrue('symptom_type' in encoded_data.columns or 
                       any('symptom_type_' in col for col in encoded_data.columns))
    
    def test_create_interaction_features(self):
        """Test interaction feature creation."""
        interactions = [('age', 'bmi'), ('exercise_frequency', 'stress_level')]
        
        interaction_data = self.engineer.create_interaction_features(self.user_data, interactions)
        
        # Check that interaction features are created
        self.assertIn('age_x_bmi', interaction_data.columns)
        self.assertIn('exercise_frequency_x_stress_level', interaction_data.columns)
    
    def test_create_temporal_features(self):
        """Test temporal feature creation."""
        temporal_data = pd.DataFrame({
            'date': [
                datetime(2023, 1, 15),  # Winter
                datetime(2023, 4, 15),  # Spring
                datetime(2023, 7, 15),  # Summer
                datetime(2023, 10, 15)  # Fall
            ],
            'value': [1, 2, 3, 4]
        })
        
        featured_data = self.engineer.create_temporal_features(temporal_data, 'date')
        
        self.assertIn('month', featured_data.columns)
        self.assertIn('season', featured_data.columns)
        self.assertIn('day_of_week', featured_data.columns)
    
    def test_scale_features(self):
        """Test feature scaling."""
        scaled_data = self.engineer.scale_features(self.user_data, ['age', 'bmi'])
        
        # Check that specified columns are scaled
        self.assertAlmostEqual(scaled_data['age'].mean(), 0, places=10)
        self.assertAlmostEqual(scaled_data['age'].std(), 1, places=10)

class TestDataValidator(unittest.TestCase):
    """Test cases for DataValidator."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.validator = DataValidator()
        
        # Valid sample data
        self.valid_data = pd.DataFrame({
            'age': [25, 30, 35],
            'bmi': [22.5, 28.0, 24.5],
            'cycle_length': [28, 30, 26],
            'period_length': [5, 4, 6],
            'exercise_frequency': [3, 1, 5],
            'stress_level': [2, 4, 1]
        })
        
        # Invalid sample data
        self.invalid_data = pd.DataFrame({
            'age': [25, 200, -5],  # Invalid age
            'bmi': [22.5, 100, 5],  # Invalid BMI
            'cycle_length': [28, 50, 10],  # Invalid cycle length
            'period_length': [5, 15, 0],  # Invalid period length
        })
    
    def test_validate_data_types(self):
        """Test data type validation."""
        is_valid, errors = self.validator.validate_data_types(self.valid_data)
        
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)
    
    def test_validate_ranges(self):
        """Test range validation."""
        ranges = {
            'age': (12, 60),
            'bmi': (10, 50),
            'cycle_length': (21, 45),
            'period_length': (1, 10)
        }
        
        # Test valid data
        is_valid, errors = self.validator.validate_ranges(self.valid_data, ranges)
        self.assertTrue(is_valid)
        
        # Test invalid data
        is_valid, errors = self.validator.validate_ranges(self.invalid_data, ranges)
        self.assertFalse(is_valid)
        self.assertGreater(len(errors), 0)
    
    def test_validate_required_columns(self):
        """Test required column validation."""
        required_columns = ['age', 'bmi', 'cycle_length']
        
        # Test with all required columns
        is_valid, errors = self.validator.validate_required_columns(self.valid_data, required_columns)
        self.assertTrue(is_valid)
        
        # Test with missing columns
        incomplete_data = self.valid_data.drop('age', axis=1)
        is_valid, errors = self.validator.validate_required_columns(incomplete_data, required_columns)
        self.assertFalse(is_valid)
        self.assertIn('age', str(errors))
    
    def test_validate_data_quality(self):
        """Test overall data quality validation."""
        # Test with good quality data
        quality_score = self.validator.validate_data_quality(self.valid_data)
        self.assertGreater(quality_score, 0.8)
        
        # Test with poor quality data (add missing values and outliers)
        poor_data = self.valid_data.copy()
        poor_data.loc[0, 'age'] = np.nan
        poor_data.loc[1, 'bmi'] = 1000  # Extreme outlier
        
        quality_score = self.validator.validate_data_quality(poor_data)
        self.assertLess(quality_score, 0.8)
    
    def test_validate_cycle_data(self):
        """Test cycle-specific data validation."""
        cycle_data = pd.DataFrame({
            'start_date': ['2023-01-01', '2023-01-29', '2023-02-26'],
            'cycle_length': [28, 27, 29],
            'period_length': [5, 4, 6]
        })
        
        is_valid, errors = self.validator.validate_cycle_data(cycle_data)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)
    
    def test_validate_symptom_data(self):
        """Test symptom-specific data validation."""
        symptom_data = pd.DataFrame({
            'type': ['cramps', 'bloating', 'mood_swings'],
            'severity': [7, 5, 6],
            'date': ['2023-01-01', '2023-01-02', '2023-01-15'],
            'cycle_day': [1, 2, 15]
        })
        
        is_valid, errors = self.validator.validate_symptom_data(symptom_data)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)

class TestPreprocessingIntegration(unittest.TestCase):
    """Integration tests for preprocessing pipeline."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.cleaner = DataCleaner()
        self.engineer = FeatureEngineer()
        self.validator = DataValidator()
        
        # Sample raw data with issues
        self.raw_data = pd.DataFrame({
            'user_id': [1, 1, 2, 2, 2],
            'age': [25, 25, 30, 30, np.nan],  # Duplicate and missing
            'bmi': [22.5, 22.5, 28.0, np.inf, 24.5],  # Duplicate and infinite
            'cycle_length': [28, 28, 35, 30, 26],
            'period_length': [5, 5, 4, 6, 5],
            'date': [
                datetime(2023, 1, 1),
                datetime(2023, 1, 1),  # Duplicate
                datetime(2023, 1, 5),
                datetime(2023, 2, 2),
                datetime(2023, 3, 2)
            ]
        })
    
    def test_complete_preprocessing_pipeline(self):
        """Test complete preprocessing pipeline."""
        # Step 1: Clean data
        cleaned_data = self.cleaner.clean_data(self.raw_data)
        
        # Step 2: Engineer features
        featured_data = self.engineer.create_temporal_features(cleaned_data, 'date')
        featured_data = self.engineer.create_bmi_categories(featured_data)
        
        # Step 3: Validate processed data
        is_valid, errors = self.validator.validate_data_types(featured_data)
        
        # Assertions
        self.assertTrue(is_valid)
        self.assertFalse(featured_data.isnull().any().any())
        self.assertFalse(featured_data.duplicated().any())
        self.assertIn('bmi_category', featured_data.columns)
        self.assertIn('month', featured_data.columns)
    
    def test_preprocessing_with_validation_feedback(self):
        """Test preprocessing with validation feedback loop."""
        # Initial validation
        is_valid, errors = self.validator.validate_data_quality(self.raw_data)
        self.assertFalse(is_valid)  # Should fail initially
        
        # Clean based on validation feedback
        cleaned_data = self.cleaner.clean_data(self.raw_data)
        
        # Re-validate
        is_valid, errors = self.validator.validate_data_quality(cleaned_data)
        self.assertTrue(is_valid)  # Should pass after cleaning

if __name__ == '__main__':
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test cases
    test_suite.addTest(unittest.makeSuite(TestDataCleaner))
    test_suite.addTest(unittest.makeSuite(TestFeatureEngineer))
    test_suite.addTest(unittest.makeSuite(TestDataValidator))
    test_suite.addTest(unittest.makeSuite(TestPreprocessingIntegration))
    
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