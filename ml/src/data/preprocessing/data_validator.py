"""
Data validation utilities for FEMbalance ML pipeline
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class DataValidator:
    """
    Comprehensive data validation for health tracking data
    """
    
    def __init__(self):
        self.validation_results = {}
        self.schema_definitions = self._load_schema_definitions()
        
    def _load_schema_definitions(self) -> Dict:
        """Load schema definitions for different data types"""
        return {
            'cycle_data': {
                'required_columns': ['userId', 'startDate'],
                'optional_columns': ['endDate', 'cycleLength', 'periodLength'],
                'data_types': {
                    'userId': 'object',
                    'startDate': 'datetime64[ns]',
                    'endDate': 'datetime64[ns]',
                    'cycleLength': 'float64',
                    'periodLength': 'float64'
                },
                'value_ranges': {
                    'cycleLength': (21, 45),
                    'periodLength': (1, 10)
                }
            },
            'symptom_data': {
                'required_columns': ['userId', 'type', 'date'],
                'optional_columns': ['severity', 'cycleDay', 'notes'],
                'data_types': {
                    'userId': 'object',
                    'type': 'object',
                    'date': 'datetime64[ns]',
                    'severity': 'float64',
                    'cycleDay': 'float64'
                },
                'value_ranges': {
                    'severity': (1, 10),
                    'cycleDay': (1, 50)
                },
                'categorical_values': {
                    'type': ['cramps', 'bloating', 'mood_swings', 'headache', 'fatigue', 
                            'acne', 'breast_tenderness', 'back_pain', 'nausea', 'other']
                }
            },
            'user_data': {
                'required_columns': ['userId'],
                'optional_columns': ['age', 'height', 'weight', 'email', 'activityLevel'],
                'data_types': {
                    'userId': 'object',
                    'age': 'float64',
                    'height': 'float64',
                    'weight': 'float64',
                    'email': 'object',
                    'activityLevel': 'object'
                },
                'value_ranges': {
                    'age': (12, 60),
                    'height': (120, 220),
                    'weight': (30, 200)
                },
                'categorical_values': {
                    'activityLevel': ['sedentary', 'light', 'moderate', 'active', 'very_active']
                }
            },
            'workout_data': {
                'required_columns': ['userId', 'date', 'type', 'duration'],
                'optional_columns': ['intensity', 'totalCaloriesBurned', 'cycleDay'],
                'data_types': {
                    'userId': 'object',
                    'date': 'datetime64[ns]',
                    'type': 'object',
                    'duration': 'float64',
                    'intensity': 'object',
                    'totalCaloriesBurned': 'float64',
                    'cycleDay': 'float64'
                },
                'value_ranges': {
                    'duration': (1, 300),
                    'totalCaloriesBurned': (10, 2000),
                    'cycleDay': (1, 50)
                },
                'categorical_values': {
                    'type': ['cardio', 'strength', 'flexibility', 'sports', 'mixed'],
                    'intensity': ['low', 'medium', 'high', 'very-high']
                }
            },
            'meal_data': {
                'required_columns': ['userId', 'date', 'type'],
                'optional_columns': ['totalCalories', 'protein', 'carbs', 'fat', 'fiber'],
                'data_types': {
                    'userId': 'object',
                    'date': 'datetime64[ns]',
                    'type': 'object',
                    'totalCalories': 'float64',
                    'protein': 'float64',
                    'carbs': 'float64',
                    'fat': 'float64',
                    'fiber': 'float64'
                },
                'value_ranges': {
                    'totalCalories': (10, 3000),
                    'protein': (0, 200),
                    'carbs': (0, 500),
                    'fat': (0, 200),
                    'fiber': (0, 100)
                },
                'categorical_values': {
                    'type': ['breakfast', 'lunch', 'dinner', 'snack']
                }
            }
        }
    
    def validate_dataframe(self, df: pd.DataFrame, data_type: str) -> Dict:
        """
        Validate a DataFrame against schema
        
        Args:
            df: DataFrame to validate
            data_type: Type of data ('cycle_data', 'symptom_data', etc.)
            
        Returns:
            Dictionary with validation results
        """
        try:
            logger.info(f"Validating {data_type} with {len(df)} records")
            
            if data_type not in self.schema_definitions:
                return {'valid': False, 'error': f'Unknown data type: {data_type}'}
            
            schema = self.schema_definitions[data_type]
            validation_result = {
                'data_type': data_type,
                'total_records': len(df),
                'valid': True,
                'errors': [],
                'warnings': [],
                'statistics': {}
            }
            
            # Check if DataFrame is empty
            if df.empty:
                validation_result['valid'] = False
                validation_result['errors'].append('DataFrame is empty')
                return validation_result
            
            # Validate required columns
            missing_required = set(schema['required_columns']) - set(df.columns)
            if missing_required:
                validation_result['valid'] = False
                validation_result['errors'].append(f'Missing required columns: {list(missing_required)}')
            
            # Validate data types
            type_errors = self._validate_data_types(df, schema.get('data_types', {}))
            validation_result['errors'].extend(type_errors)
            
            # Validate value ranges
            range_errors = self._validate_value_ranges(df, schema.get('value_ranges', {}))
            validation_result['errors'].extend(range_errors)
            
            # Validate categorical values
            categorical_errors = self._validate_categorical_values(df, schema.get('categorical_values', {}))
            validation_result['errors'].extend(categorical_errors)
            
            # Check for duplicates
            duplicate_info = self._check_duplicates(df, data_type)
            validation_result['warnings'].extend(duplicate_info['warnings'])
            validation_result['statistics']['duplicates'] = duplicate_info['count']
            
            # Check for missing values
            missing_info = self._check_missing_values(df)
            validation_result['statistics']['missing_values'] = missing_info
            
            # Data quality checks
            quality_checks = self._perform_quality_checks(df, data_type)
            validation_result['warnings'].extend(quality_checks['warnings'])
            validation_result['statistics']['quality_metrics'] = quality_checks['metrics']
            
            # Temporal consistency checks
            if data_type in ['cycle_data', 'symptom_data', 'workout_data', 'meal_data']:
                temporal_checks = self._check_temporal_consistency(df, data_type)
                validation_result['warnings'].extend(temporal_checks['warnings'])
                validation_result['statistics']['temporal_metrics'] = temporal_checks['metrics']
            
            # Set overall validity
            if validation_result['errors']:
                validation_result['valid'] = False
            
            # Store results
            self.validation_results[data_type] = validation_result
            
            logger.info(f"Validation completed for {data_type}: {'PASSED' if validation_result['valid'] else 'FAILED'}")
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating {data_type}: {str(e)}")
            return {
                'data_type': data_type,
                'valid': False,
                'error': str(e),
                'errors': [str(e)],
                'warnings': [],
                'statistics': {}
            }
    
    def _validate_data_types(self, df: pd.DataFrame, expected_types: Dict) -> List[str]:
        """Validate data types of columns"""
        errors = []
        
        for column, expected_type in expected_types.items():
            if column not in df.columns:
                continue
                
            actual_type = str(df[column].dtype)
            
            # Handle datetime conversion
            if expected_type == 'datetime64[ns]' and actual_type != 'datetime64[ns]':
                try:
                    pd.to_datetime(df[column])
                except:
                    errors.append(f'Column {column} cannot be converted to datetime')
            
            # Handle numeric types
            elif expected_type in ['float64', 'int64'] and not pd.api.types.is_numeric_dtype(df[column]):
                try:
                    pd.to_numeric(df[column])
                except:
                    errors.append(f'Column {column} cannot be converted to numeric')
        
        return errors
    
    def _validate_value_ranges(self, df: pd.DataFrame, value_ranges: Dict) -> List[str]:
        """Validate value ranges for numeric columns"""
        errors = []
        
        for column, (min_val, max_val) in value_ranges.items():
            if column not in df.columns:
                continue
            
            # Convert to numeric if needed
            try:
                numeric_col = pd.to_numeric(df[column], errors='coerce')
                
                # Check for values outside range
                out_of_range = numeric_col[(numeric_col < min_val) | (numeric_col > max_val)]
                if not out_of_range.empty:
                    errors.append(f'Column {column} has {len(out_of_range)} values outside range [{min_val}, {max_val}]')
                    
            except Exception as e:
                errors.append(f'Error validating range for column {column}: {str(e)}')
        
        return errors
    
    def _validate_categorical_values(self, df: pd.DataFrame, categorical_values: Dict) -> List[str]:
        """Validate categorical column values"""
        errors = []
        
        for column, valid_values in categorical_values.items():
            if column not in df.columns:
                continue
            
            # Check for invalid categorical values
            invalid_values = set(df[column].dropna().unique()) - set(valid_values)
            if invalid_values:
                errors.append(f'Column {column} has invalid values: {list(invalid_values)}')
        
        return errors
    
    def _check_duplicates(self, df: pd.DataFrame, data_type: str) -> Dict:
        """Check for duplicate records"""
        duplicate_info = {'count': 0, 'warnings': []}
        
        # Define duplicate check columns based on data type
        duplicate_columns = {
            'cycle_data': ['userId', 'startDate'],
            'symptom_data': ['userId', 'date', 'type'],
            'user_data': ['userId'],
            'workout_data': ['userId', 'date', 'startTime'],
            'meal_data': ['userId', 'date', 'type']
        }
        
        if data_type in duplicate_columns:
            check_cols = [col for col in duplicate_columns[data_type] if col in df.columns]
            
            if check_cols:
                duplicates = df.duplicated(subset=check_cols, keep=False)
                duplicate_count = duplicates.sum()
                
                if duplicate_count > 0:
                    duplicate_info['count'] = duplicate_count
                    duplicate_info['warnings'].append(f'Found {duplicate_count} duplicate records based on {check_cols}')
        
        return duplicate_info
    
    def _check_missing_values(self, df: pd.DataFrame) -> Dict:
        """Check for missing values in each column"""
        missing_info = {}
        
        for column in df.columns:
            missing_count = df[column].isnull().sum()
            missing_percentage = (missing_count / len(df)) * 100
            
            missing_info[column] = {
                'count': int(missing_count),
                'percentage': round(missing_percentage, 2)
            }
        
        return missing_info
    
    def _perform_quality_checks(self, df: pd.DataFrame, data_type: str) -> Dict:
        """Perform data quality checks"""
        quality_info = {'warnings': [], 'metrics': {}}
        
        # Check for extremely skewed distributions
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        for column in numeric_columns:
            if df[column].nunique() > 1:  # Skip columns with single value
                skewness = df[column].skew()
                if abs(skewness) > 3:
                    quality_info['warnings'].append(f'Column {column} is highly skewed (skewness: {skewness:.2f})')
                
                quality_info['metrics'][f'{column}_skewness'] = round(skewness, 2)
        
        # Check for constant columns
        constant_columns = [col for col in df.columns if df[col].nunique() <= 1]
        if constant_columns:
            quality_info['warnings'].append(f'Constant columns found: {constant_columns}')
        
        # Check data freshness (for time-series data)
        date_columns = ['date', 'startDate', 'endDate']
        for date_col in date_columns:
            if date_col in df.columns:
                try:
                    date_series = pd.to_datetime(df[date_col])
                    latest_date = date_series.max()
                    days_old = (datetime.now() - latest_date).days
                    
                    quality_info['metrics'][f'{date_col}_days_old'] = days_old
                    
                    if days_old > 30:
                        quality_info['warnings'].append(f'Data in {date_col} is {days_old} days old')
                        
                except Exception:
                    pass
        
        return quality_info
    
    def _check_temporal_consistency(self, df: pd.DataFrame, data_type: str) -> Dict:
        """Check temporal consistency in time-series data"""
        temporal_info = {'warnings': [], 'metrics': {}}
        
        try:
            if data_type == 'cycle_data' and all(col in df.columns for col in ['startDate', 'endDate']):
                # Check if end date is after start date
                df_temp = df.dropna(subset=['startDate', 'endDate'])
                if not df_temp.empty:
                    invalid_dates = df_temp[df_temp['endDate'] <= df_temp['startDate']]
                    if not invalid_dates.empty:
                        temporal_info['warnings'].append(f'{len(invalid_dates)} records have end date before or equal to start date')
            
            # Check for future dates
            date_columns = ['date', 'startDate', 'endDate']
            for date_col in date_columns:
                if date_col in df.columns:
                    try:
                        date_series = pd.to_datetime(df[date_col])
                        future_dates = date_series[date_series > datetime.now()]
                        
                        if not future_dates.empty:
                            temporal_info['warnings'].append(f'{len(future_dates)} records have future dates in {date_col}')
                            
                    except Exception:
                        pass
            
            # Check for reasonable date ranges
            if 'date' in df.columns or 'startDate' in df.columns:
                date_col = 'date' if 'date' in df.columns else 'startDate'
                try:
                    date_series = pd.to_datetime(df[date_col])
                    min_date = date_series.min()
                    max_date = date_series.max()
                    
                    # Check if dates are too old (more than 10 years)
                    if (datetime.now() - min_date).days > 3650:
                        temporal_info['warnings'].append(f'Data contains very old dates (oldest: {min_date.date()})')
                    
                    temporal_info['metrics']['date_range_days'] = (max_date - min_date).days
                    temporal_info['metrics']['min_date'] = min_date.isoformat()
                    temporal_info['metrics']['max_date'] = max_date.isoformat()
                    
                except Exception:
                    pass
        
        except Exception as e:
            temporal_info['warnings'].append(f'Error in temporal consistency check: {str(e)}')
        
        return temporal_info
    
    def validate_model_input(self, X: pd.DataFrame, feature_names: List[str]) -> Dict:
        """
        Validate input data for ML model
        
        Args:
            X: Input feature matrix
            feature_names: Expected feature names
            
        Returns:
            Dictionary with validation results
        """
        try:
            validation_result = {
                'valid': True,
                'errors': [],
                'warnings': [],
                'statistics': {}
            }
            
            # Check if all required features are present
            missing_features = set(feature_names) - set(X.columns)
            if missing_features:
                validation_result['valid'] = False
                validation_result['errors'].append(f'Missing features: {list(missing_features)}')
            
            # Check for extra features
            extra_features = set(X.columns) - set(feature_names)
            if extra_features:
                validation_result['warnings'].append(f'Extra features found: {list(extra_features)}')
            
            # Check for missing values
            missing_counts = X.isnull().sum()
            features_with_missing = missing_counts[missing_counts > 0]
            
            if not features_with_missing.empty:
                validation_result['warnings'].append(f'Features with missing values: {features_with_missing.to_dict()}')
            
            # Check for infinite values
            numeric_cols = X.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                if np.isinf(X[col]).any():
                    validation_result['errors'].append(f'Feature {col} contains infinite values')
                    validation_result['valid'] = False
            
            # Check data types
            for col in X.columns:
                if not pd.api.types.is_numeric_dtype(X[col]):
                    validation_result['errors'].append(f'Feature {col} is not numeric')
                    validation_result['valid'] = False
            
            # Statistics
            validation_result['statistics'] = {
                'n_samples': len(X),
                'n_features': len(X.columns),
                'missing_value_percentage': (X.isnull().sum().sum() / (len(X) * len(X.columns))) * 100
            }
            
            return validation_result
            
        except Exception as e:
            return {
                'valid': False,
                'error': str(e),
                'errors': [str(e)],
                'warnings': [],
                'statistics': {}
            }
    
    def generate_validation_report(self) -> Dict:
        """
        Generate comprehensive validation report
        
        Returns:
            Dictionary with validation report
        """
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_datasets_validated': len(self.validation_results),
            'overall_status': 'PASSED',
            'datasets': {}
        }
        
        for data_type, results in self.validation_results.items():
            report['datasets'][data_type] = {
                'status': 'PASSED' if results['valid'] else 'FAILED',
                'total_records': results.get('total_records', 0),
                'error_count': len(results.get('errors', [])),
                'warning_count': len(results.get('warnings', [])),
                'key_statistics': results.get('statistics', {})
            }
            
            if not results['valid']:
                report['overall_status'] = 'FAILED'
        
        return report
    
    def save_validation_report(self, filepath: str) -> bool:
        """
        Save validation report to file
        
        Args:
            filepath: Path to save the report
            
        Returns:
            True if successful, False otherwise
        """
        try:
            report = self.generate_validation_report()
            
            with open(filepath, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            logger.info(f"Validation report saved to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving validation report: {str(e)}")
            return False