"""
Data cleaning utilities for ML preprocessing.
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Any, Optional, Tuple
from scipy import stats

logger = logging.getLogger(__name__)

class DataCleaner:
    """Data cleaning utilities for ML preprocessing."""
    
    def __init__(self):
        self.cleaning_stats = {}
    
    def clean_data(self, data: pd.DataFrame, 
                   remove_duplicates: bool = True,
                   handle_missing: bool = True,
                   remove_outliers: bool = True,
                   handle_infinite: bool = True) -> pd.DataFrame:
        """Complete data cleaning pipeline."""
        try:
            logger.info(f"Starting data cleaning for {len(data)} records")
            
            original_shape = data.shape
            cleaned_data = data.copy()
            
            # Remove duplicates
            if remove_duplicates:
                cleaned_data = self.remove_duplicates(cleaned_data)
            
            # Handle infinite values
            if handle_infinite:
                cleaned_data = self.handle_infinite_values(cleaned_data)
            
            # Handle missing values
            if handle_missing:
                cleaned_data = self.handle_missing_values(cleaned_data)
            
            # Remove outliers
            if remove_outliers:
                numeric_columns = cleaned_data.select_dtypes(include=[np.number]).columns
                cleaned_data = self.remove_outliers(cleaned_data, numeric_columns.tolist())
            
            # Store cleaning statistics
            self.cleaning_stats = {
                'original_shape': original_shape,
                'final_shape': cleaned_data.shape,
                'rows_removed': original_shape[0] - cleaned_data.shape[0],
                'columns_removed': original_shape[1] - cleaned_data.shape[1],
                'cleaning_rate': (original_shape[0] - cleaned_data.shape[0]) / original_shape[0]
            }
            
            logger.info(f"Data cleaning completed. Shape: {original_shape} -> {cleaned_data.shape}")
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Data cleaning failed: {str(e)}")
            raise ValueError(f"Data cleaning failed: {str(e)}")
    
    def remove_duplicates(self, data: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate rows from the dataset."""
        try:
            initial_count = len(data)
            cleaned_data = data.drop_duplicates()
            duplicates_removed = initial_count - len(cleaned_data)
            
            if duplicates_removed > 0:
                logger.info(f"Removed {duplicates_removed} duplicate rows")
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Duplicate removal failed: {str(e)}")
            return data
    
    def handle_missing_values(self, data: pd.DataFrame, 
                            strategy: str = 'auto') -> pd.DataFrame:
        """Handle missing values in the dataset."""
        try:
            cleaned_data = data.copy()
            missing_info = {}
            
            for column in cleaned_data.columns:
                missing_count = cleaned_data[column].isnull().sum()
                missing_percentage = missing_count / len(cleaned_data)
                
                if missing_count > 0:
                    missing_info[column] = {
                        'count': missing_count,
                        'percentage': missing_percentage
                    }
                    
                    # Drop columns with too many missing values (>50%)
                    if missing_percentage > 0.5:
                        cleaned_data = cleaned_data.drop(column, axis=1)
                        logger.info(f"Dropped column '{column}' with {missing_percentage:.1%} missing values")
                        continue
                    
                    # Handle missing values based on data type and strategy
                    if cleaned_data[column].dtype in ['int64', 'float64']:
                        # Numeric columns
                        if strategy == 'auto':
                            if missing_percentage < 0.1:
                                # Use median for small amounts of missing data
                                fill_value = cleaned_data[column].median()
                            else:
                                # Use mean for larger amounts
                                fill_value = cleaned_data[column].mean()
                        elif strategy == 'median':
                            fill_value = cleaned_data[column].median()
                        elif strategy == 'mean':
                            fill_value = cleaned_data[column].mean()
                        else:
                            fill_value = 0
                        
                        cleaned_data[column] = cleaned_data[column].fillna(fill_value)
                        
                    elif cleaned_data[column].dtype == 'object':
                        # Categorical columns
                        if strategy == 'auto':
                            # Use mode (most frequent value)
                            mode_value = cleaned_data[column].mode()
                            fill_value = mode_value.iloc[0] if not mode_value.empty else 'unknown'
                        else:
                            fill_value = 'unknown'
                        
                        cleaned_data[column] = cleaned_data[column].fillna(fill_value)
                    
                    elif cleaned_data[column].dtype == 'bool':
                        # Boolean columns
                        fill_value = cleaned_data[column].mode().iloc[0] if not cleaned_data[column].mode().empty else False
                        cleaned_data[column] = cleaned_data[column].fillna(fill_value)
            
            if missing_info:
                logger.info(f"Handled missing values in {len(missing_info)} columns")
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Missing value handling failed: {str(e)}")
            return data
    
    def remove_outliers(self, data: pd.DataFrame, 
                       columns: List[str],
                       method: str = 'iqr',
                       threshold: float = 1.5) -> pd.DataFrame:
        """Remove outliers from specified columns."""
        try:
            cleaned_data = data.copy()
            outliers_removed = 0
            
            for column in columns:
                if column not in cleaned_data.columns:
                    continue
                
                if cleaned_data[column].dtype not in ['int64', 'float64']:
                    continue
                
                initial_count = len(cleaned_data)
                
                if method == 'iqr':
                    # Interquartile Range method
                    Q1 = cleaned_data[column].quantile(0.25)
                    Q3 = cleaned_data[column].quantile(0.75)
                    IQR = Q3 - Q1
                    
                    lower_bound = Q1 - threshold * IQR
                    upper_bound = Q3 + threshold * IQR
                    
                    cleaned_data = cleaned_data[
                        (cleaned_data[column] >= lower_bound) & 
                        (cleaned_data[column] <= upper_bound)
                    ]
                
                elif method == 'zscore':
                    # Z-score method
                    z_scores = np.abs(stats.zscore(cleaned_data[column]))
                    cleaned_data = cleaned_data[z_scores < threshold]
                
                elif method == 'percentile':
                    # Percentile method
                    lower_percentile = (100 - threshold * 100) / 2
                    upper_percentile = 100 - lower_percentile
                    
                    lower_bound = cleaned_data[column].quantile(lower_percentile / 100)
                    upper_bound = cleaned_data[column].quantile(upper_percentile / 100)
                    
                    cleaned_data = cleaned_data[
                        (cleaned_data[column] >= lower_bound) & 
                        (cleaned_data[column] <= upper_bound)
                    ]
                
                column_outliers = initial_count - len(cleaned_data)
                outliers_removed += column_outliers
                
                if column_outliers > 0:
                    logger.info(f"Removed {column_outliers} outliers from column '{column}'")
            
            if outliers_removed > 0:
                logger.info(f"Total outliers removed: {outliers_removed}")
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Outlier removal failed: {str(e)}")
            return data
    
    def handle_infinite_values(self, data: pd.DataFrame) -> pd.DataFrame:
        """Handle infinite values in the dataset."""
        try:
            cleaned_data = data.copy()
            
            # Replace infinite values with NaN
            cleaned_data = cleaned_data.replace([np.inf, -np.inf], np.nan)
            
            # Count infinite values
            infinite_count = 0
            for column in cleaned_data.select_dtypes(include=[np.number]).columns:
                col_infinite = data[column].isin([np.inf, -np.inf]).sum()
                infinite_count += col_infinite
                
                if col_infinite > 0:
                    logger.info(f"Found {col_infinite} infinite values in column '{column}'")
            
            if infinite_count > 0:
                # Handle the NaN values created from infinite values
                cleaned_data = self.handle_missing_values(cleaned_data)
                logger.info(f"Handled {infinite_count} infinite values")
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Infinite value handling failed: {str(e)}")
            return data
    
    def remove_invalid_ranges(self, data: pd.DataFrame, 
                            ranges: Dict[str, Tuple[float, float]]) -> pd.DataFrame:
        """Remove rows with values outside valid ranges."""
        try:
            cleaned_data = data.copy()
            initial_count = len(cleaned_data)
            
            for column, (min_val, max_val) in ranges.items():
                if column not in cleaned_data.columns:
                    continue
                
                # Remove rows outside valid range
                valid_mask = (
                    (cleaned_data[column] >= min_val) & 
                    (cleaned_data[column] <= max_val)
                )
                
                invalid_count = (~valid_mask).sum()
                if invalid_count > 0:
                    cleaned_data = cleaned_data[valid_mask]
                    logger.info(f"Removed {invalid_count} rows with invalid '{column}' values")
            
            total_removed = initial_count - len(cleaned_data)
            if total_removed > 0:
                logger.info(f"Total rows removed for invalid ranges: {total_removed}")
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Invalid range removal failed: {str(e)}")
            return data
    
    def standardize_text_columns(self, data: pd.DataFrame, 
                                columns: List[str]) -> pd.DataFrame:
        """Standardize text columns (lowercase, strip whitespace)."""
        try:
            cleaned_data = data.copy()
            
            for column in columns:
                if column not in cleaned_data.columns:
                    continue
                
                if cleaned_data[column].dtype == 'object':
                    # Convert to string, lowercase, and strip whitespace
                    cleaned_data[column] = (
                        cleaned_data[column]
                        .astype(str)
                        .str.lower()
                        .str.strip()
                    )
                    
                    logger.info(f"Standardized text column '{column}'")
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Text standardization failed: {str(e)}")
            return data
    
    def remove_constant_columns(self, data: pd.DataFrame, 
                              threshold: float = 0.95) -> pd.DataFrame:
        """Remove columns with constant or near-constant values."""
        try:
            cleaned_data = data.copy()
            columns_to_drop = []
            
            for column in cleaned_data.columns:
                # Calculate the frequency of the most common value
                if len(cleaned_data[column]) > 0:
                    most_common_freq = cleaned_data[column].value_counts().iloc[0]
                    constant_ratio = most_common_freq / len(cleaned_data[column])
                    
                    if constant_ratio >= threshold:
                        columns_to_drop.append(column)
            
            if columns_to_drop:
                cleaned_data = cleaned_data.drop(columns_to_drop, axis=1)
                logger.info(f"Removed {len(columns_to_drop)} constant columns: {columns_to_drop}")
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Constant column removal failed: {str(e)}")
            return data
    
    def get_cleaning_summary(self) -> Dict[str, Any]:
        """Get summary of the last cleaning operation."""
        return self.cleaning_stats.copy() if self.cleaning_stats else {}
    
    def validate_cleaned_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Validate the cleaned data quality."""
        try:
            validation_results = {
                'total_rows': len(data),
                'total_columns': len(data.columns),
                'missing_values': data.isnull().sum().sum(),
                'duplicate_rows': data.duplicated().sum(),
                'infinite_values': 0,
                'data_types': data.dtypes.to_dict(),
                'memory_usage_mb': data.memory_usage(deep=True).sum() / 1024 / 1024
            }
            
            # Check for infinite values in numeric columns
            for column in data.select_dtypes(include=[np.number]).columns:
                infinite_count = data[column].isin([np.inf, -np.inf]).sum()
                validation_results['infinite_values'] += infinite_count
            
            # Calculate data quality score
            quality_score = 1.0
            if validation_results['total_rows'] > 0:
                missing_ratio = validation_results['missing_values'] / (
                    validation_results['total_rows'] * validation_results['total_columns']
                )
                duplicate_ratio = validation_results['duplicate_rows'] / validation_results['total_rows']
                infinite_ratio = validation_results['infinite_values'] / (
                    validation_results['total_rows'] * validation_results['total_columns']
                )
                
                quality_score = max(0, 1 - missing_ratio - duplicate_ratio - infinite_ratio)
            
            validation_results['quality_score'] = quality_score
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Data validation failed: {str(e)}")
            return {'error': str(e)}