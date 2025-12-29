"""
Feature engineering utilities for ML preprocessing.
"""

import numpy as np
import pandas as pd
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.feature_selection import SelectKBest, f_classif, f_regression

logger = logging.getLogger(__name__)

class FeatureEngineer:
    """Feature engineering utilities for ML preprocessing."""
    
    def __init__(self):
        self.scalers = {}
        self.encoders = {}
        self.feature_st{}
        self.encoders = {}
        self.feature_stats = {}
        
    def create_cycle_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from cycle data
        
        Args:
            df: DataFrame with cycle data
            
        Returns:
            DataFrame with engineered features
        """
        try:
            logger.info("Creating cycle features")
            
            features_df = df.copy()
            
            # Basic cycle features
            if 'cycleLength' in features_df.columns:
                features_df['cycle_length_normalized'] = (features_df['cycleLength'] - 28) / 7  # Normalize around 28 days
                features_df['is_short_cycle'] = (features_df['cycleLength'] < 25).astype(int)
                features_df['is_long_cycle'] = (features_df['cycleLength'] > 32).astype(int)
                features_df['is_regular_cycle'] = ((features_df['cycleLength'] >= 25) & (features_df['cycleLength'] <= 32)).astype(int)
            
            if 'periodLength' in features_df.columns:
                features_df['period_length_normalized'] = (features_df['periodLength'] - 5) / 2  # Normalize around 5 days
                features_df['is_short_period'] = (features_df['periodLength'] < 3).astype(int)
                features_df['is_long_period'] = (features_df['periodLength'] > 7).astype(int)
            
            # Temporal features
            if 'startDate' in features_df.columns:
                features_df['startDate'] = pd.to_datetime(features_df['startDate'])
                features_df['month'] = features_df['startDate'].dt.month
                features_df['season'] = features_df['month'].apply(self._get_season)
                features_df['day_of_year'] = features_df['startDate'].dt.dayofyear
                features_df['year'] = features_df['startDate'].dt.year
                
                # Cyclical encoding for month
                features_df['month_sin'] = np.sin(2 * np.pi * features_df['month'] / 12)
                features_df['month_cos'] = np.cos(2 * np.pi * features_df['month'] / 12)
            
            # User-specific aggregated features
            if 'userId' in features_df.columns:
                user_stats = self._calculate_user_cycle_stats(features_df)
                features_df = features_df.merge(user_stats, on='userId', how='left')
            
            # Cycle regularity features
            if all(col in features_df.columns for col in ['userId', 'cycleLength']):
                regularity_features = self._calculate_cycle_regularity(features_df)
                features_df = features_df.merge(regularity_features, on='userId', how='left')
            
            logger.info(f"Created cycle features: {features_df.shape[1]} total columns")
            return features_df
            
        except Exception as e:
            logger.error(f"Error creating cycle features: {str(e)}")
            raise
    
    def create_symptom_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from symptom data
        
        Args:
            df: DataFrame with symptom data
            
        Returns:
            DataFrame with engineered features
        """
        try:
            logger.info("Creating symptom features")
            
            features_df = df.copy()
            
            # Basic symptom features
            if 'severity' in features_df.columns:
                features_df['severity_normalized'] = (features_df['severity'] - 5.5) / 2.87  # Normalize 1-10 scale
                features_df['is_mild_symptom'] = (features_df['severity'] <= 3).astype(int)
                features_df['is_moderate_symptom'] = ((features_df['severity'] > 3) & (features_df['severity'] <= 7)).astype(int)
                features_df['is_severe_symptom'] = (features_df['severity'] > 7).astype(int)
            
            # Symptom type encoding
            if 'type' in features_df.columns:
                symptom_types = ['cramps', 'bloating', 'mood_swings', 'headache', 'fatigue', 
                               'acne', 'breast_tenderness', 'back_pain', 'nausea', 'other']
                
                for symptom_type in symptom_types:
                    features_df[f'is_{symptom_type}'] = (features_df['type'] == symptom_type).astype(int)
            
            # Temporal features
            if 'date' in features_df.columns:
                features_df['date'] = pd.to_datetime(features_df['date'])
                features_df['day_of_week'] = features_df['date'].dt.dayofweek
                features_df['is_weekend'] = (features_df['day_of_week'].isin([5, 6])).astype(int)
                features_df['month'] = features_df['date'].dt.month
                features_df['season'] = features_df['month'].apply(self._get_season)
            
            # Cycle phase features
            if 'cycleDay' in features_df.columns:
                features_df['cycle_phase'] = features_df['cycleDay'].apply(self._get_cycle_phase)
                features_df['is_menstrual_phase'] = (features_df['cycleDay'] <= 5).astype(int)
                features_df['is_follicular_phase'] = ((features_df['cycleDay'] > 5) & (features_df['cycleDay'] <= 13)).astype(int)
                features_df['is_ovulation_phase'] = ((features_df['cycleDay'] > 13) & (features_df['cycleDay'] <= 16)).astype(int)
                features_df['is_luteal_phase'] = (features_df['cycleDay'] > 16).astype(int)
                
                # Cyclical encoding for cycle day
                features_df['cycle_day_sin'] = np.sin(2 * np.pi * features_df['cycleDay'] / 28)
                features_df['cycle_day_cos'] = np.cos(2 * np.pi * features_df['cycleDay'] / 28)
            
            # User-specific aggregated features
            if 'userId' in features_df.columns:
                user_symptom_stats = self._calculate_user_symptom_stats(features_df)
                features_df = features_df.merge(user_symptom_stats, on='userId', how='left')
            
            # Symptom frequency and patterns
            if all(col in features_df.columns for col in ['userId', 'type', 'date']):
                frequency_features = self._calculate_symptom_frequency(features_df)
                features_df = features_df.merge(frequency_features, on=['userId', 'type'], how='left')
            
            logger.info(f"Created symptom features: {features_df.shape[1]} total columns")
            return features_df
            
        except Exception as e:
            logger.error(f"Error creating symptom features: {str(e)}")
            raise
    
    def create_user_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from user profile data
        
        Args:
            df: DataFrame with user data
            
        Returns:
            DataFrame with engineered features
        """
        try:
            logger.info("Creating user features")
            
            features_df = df.copy()
            
            # BMI and health metrics
            if all(col in features_df.columns for col in ['height', 'weight']):
                features_df['bmi'] = features_df['weight'] / ((features_df['height'] / 100) ** 2)
                features_df['bmi_category'] = features_df['bmi'].apply(self._get_bmi_category)
                features_df['is_underweight'] = (features_df['bmi'] < 18.5).astype(int)
                features_df['is_normal_weight'] = ((features_df['bmi'] >= 18.5) & (features_df['bmi'] < 25)).astype(int)
                features_df['is_overweight'] = ((features_df['bmi'] >= 25) & (features_df['bmi'] < 30)).astype(int)
                features_df['is_obese'] = (features_df['bmi'] >= 30).astype(int)
            
            # Age-related features
            if 'age' in features_df.columns:
                features_df['age_normalized'] = (features_df['age'] - 30) / 10  # Normalize around 30
                features_df['is_teen'] = (features_df['age'] < 20).astype(int)
                features_df['is_young_adult'] = ((features_df['age'] >= 20) & (features_df['age'] < 30)).astype(int)
                features_df['is_adult'] = ((features_df['age'] >= 30) & (features_df['age'] < 40)).astype(int)
                features_df['is_mature_adult'] = (features_df['age'] >= 40).astype(int)
            
            # Activity level encoding
            if 'activityLevel' in features_df.columns:
                activity_mapping = {'sedentary': 1, 'light': 2, 'moderate': 3, 'active': 4, 'very_active': 5}
                features_df['activity_level_numeric'] = features_df['activityLevel'].map(activity_mapping)
                features_df['activity_level_normalized'] = (features_df['activity_level_numeric'] - 3) / 1.5
                
                for level in ['sedentary', 'light', 'moderate', 'active', 'very_active']:
                    features_df[f'is_{level}'] = (features_df['activityLevel'] == level).astype(int)
            
            # Health goals encoding
            if 'healthGoals' in features_df.columns:
                # Assuming healthGoals is a list or comma-separated string
                common_goals = ['weight_loss', 'weight_gain', 'muscle_gain', 'pcos_management', 
                              'fertility', 'general_health', 'stress_management']
                
                for goal in common_goals:
                    features_df[f'goal_{goal}'] = features_df['healthGoals'].astype(str).str.contains(goal, case=False, na=False).astype(int)
                
                # Count total number of goals
                features_df['total_goals'] = features_df['healthGoals'].astype(str).str.count(',') + 1
                features_df['total_goals'] = features_df['total_goals'].where(features_df['healthGoals'].notna(), 0)
            
            logger.info(f"Created user features: {features_df.shape[1]} total columns")
            return features_df
            
        except Exception as e:
            logger.error(f"Error creating user features: {str(e)}")
            raise
    
    def create_workout_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from workout data
        
        Args:
            df: DataFrame with workout data
            
        Returns:
            DataFrame with engineered features
        """
        try:
            logger.info("Creating workout features")
            
            features_df = df.copy()
            
            # Duration features
            if 'duration' in features_df.columns:
                features_df['duration_normalized'] = (features_df['duration'] - 45) / 30  # Normalize around 45 minutes
                features_df['is_short_workout'] = (features_df['duration'] < 30).astype(int)
                features_df['is_medium_workout'] = ((features_df['duration'] >= 30) & (features_df['duration'] <= 60)).astype(int)
                features_df['is_long_workout'] = (features_df['duration'] > 60).astype(int)
            
            # Intensity encoding
            if 'intensity' in features_df.columns:
                intensity_mapping = {'low': 1, 'medium': 2, 'high': 3, 'very-high': 4}
                features_df['intensity_numeric'] = features_df['intensity'].map(intensity_mapping)
                features_df['intensity_normalized'] = (features_df['intensity_numeric'] - 2.5) / 1.5
                
                for intensity in ['low', 'medium', 'high', 'very-high']:
                    features_df[f'is_{intensity}_intensity'] = (features_df['intensity'] == intensity).astype(int)
            
            # Workout type encoding
            if 'type' in features_df.columns:
                workout_types = ['cardio', 'strength', 'flexibility', 'sports', 'mixed']
                for workout_type in workout_types:
                    features_df[f'is_{workout_type}'] = (features_df['type'] == workout_type).astype(int)
            
            # Calories per minute
            if all(col in features_df.columns for col in ['totalCaloriesBurned', 'duration']):
                features_df['calories_per_minute'] = features_df['totalCaloriesBurned'] / features_df['duration']
                features_df['calories_per_minute'] = features_df['calories_per_minute'].fillna(0)
            
            # Temporal features
            if 'date' in features_df.columns:
                features_df['date'] = pd.to_datetime(features_df['date'])
                features_df['day_of_week'] = features_df['date'].dt.dayofweek
                features_df['is_weekend_workout'] = (features_df['day_of_week'].isin([5, 6])).astype(int)
                features_df['hour'] = features_df['date'].dt.hour
                features_df['is_morning_workout'] = (features_df['hour'] < 12).astype(int)
                features_df['is_evening_workout'] = (features_df['hour'] >= 18).astype(int)
            
            # User-specific aggregated features
            if 'userId' in features_df.columns:
                user_workout_stats = self._calculate_user_workout_stats(features_df)
                features_df = features_df.merge(user_workout_stats, on='userId', how='left')
            
            logger.info(f"Created workout features: {features_df.shape[1]} total columns")
            return features_df
            
        except Exception as e:
            logger.error(f"Error creating workout features: {str(e)}")
            raise
    
    def create_nutrition_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create features from nutrition/meal data
        
        Args:
            df: DataFrame with meal data
            
        Returns:
            DataFrame with engineered features
        """
        try:
            logger.info("Creating nutrition features")
            
            features_df = df.copy()
            
            # Calorie features
            if 'totalCalories' in features_df.columns:
                features_df['calories_normalized'] = (features_df['totalCalories'] - 500) / 300  # Normalize around 500 per meal
                features_df['is_low_calorie'] = (features_df['totalCalories'] < 300).astype(int)
                features_df['is_high_calorie'] = (features_df['totalCalories'] > 700).astype(int)
            
            # Macronutrient ratios
            nutrition_cols = ['protein', 'carbs', 'fat']
            if all(col in features_df.columns for col in nutrition_cols):
                total_macros = features_df[nutrition_cols].sum(axis=1)
                
                for nutrient in nutrition_cols:
                    features_df[f'{nutrient}_ratio'] = features_df[nutrient] / total_macros
                    features_df[f'{nutrient}_ratio'] = features_df[f'{nutrient}_ratio'].fillna(0)
                
                # Protein per calorie
                if 'totalCalories' in features_df.columns:
                    features_df['protein_per_calorie'] = features_df['protein'] * 4 / features_df['totalCalories']
                    features_df['protein_per_calorie'] = features_df['protein_per_calorie'].fillna(0)
            
            # Meal type encoding
            if 'type' in features_df.columns:
                meal_types = ['breakfast', 'lunch', 'dinner', 'snack']
                for meal_type in meal_types:
                    features_df[f'is_{meal_type}'] = (features_df['type'] == meal_type).astype(int)
            
            # Temporal features
            if 'date' in features_df.columns:
                features_df['date'] = pd.to_datetime(features_df['date'])
                features_df['day_of_week'] = features_df['date'].dt.dayofweek
                features_df['is_weekend_meal'] = (features_df['day_of_week'].isin([5, 6])).astype(int)
            
            # User-specific aggregated features
            if 'userId' in features_df.columns:
                user_nutrition_stats = self._calculate_user_nutrition_stats(features_df)
                features_df = features_df.merge(user_nutrition_stats, on='userId', how='left')
            
            logger.info(f"Created nutrition features: {features_df.shape[1]} total columns")
            return features_df
            
        except Exception as e:
            logger.error(f"Error creating nutrition features: {str(e)}")
            raise
    
    def _get_season(self, month: int) -> str:
        """Get season from month"""
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [3, 4, 5]:
            return 'spring'
        elif month in [6, 7, 8]:
            return 'summer'
        else:
            return 'fall'
    
    def _get_cycle_phase(self, cycle_day: int) -> str:
        """Get cycle phase from cycle day"""
        if cycle_day <= 5:
            return 'menstrual'
        elif cycle_day <= 13:
            return 'follicular'
        elif cycle_day <= 16:
            return 'ovulation'
        else:
            return 'luteal'
    
    def _get_bmi_category(self, bmi: float) -> str:
        """Get BMI category"""
        if pd.isna(bmi):
            return 'unknown'
        elif bmi < 18.5:
            return 'underweight'
        elif bmi < 25:
            return 'normal'
        elif bmi < 30:
            return 'overweight'
        else:
            return 'obese'
    
    def _calculate_user_cycle_stats(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate user-specific cycle statistics"""
        user_stats = df.groupby('userId').agg({
            'cycleLength': ['mean', 'std', 'count'],
            'periodLength': ['mean', 'std']
        }).round(2)
        
        user_stats.columns = ['avg_cycle_length', 'cycle_length_std', 'total_cycles', 
                             'avg_period_length', 'period_length_std']
        user_stats = user_stats.reset_index()
        
        # Calculate regularity score
        user_stats['cycle_regularity_score'] = 1 / (1 + user_stats['cycle_length_std'].fillna(7))
        
        return user_stats
    
    def _calculate_cycle_regularity(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate cycle regularity features"""
        regularity_stats = []
        
        for user_id in df['userId'].unique():
            user_data = df[df['userId'] == user_id].sort_values('startDate')
            
            if len(user_data) >= 3:
                cycle_lengths = user_data['cycleLength'].dropna()
                if len(cycle_lengths) >= 3:
                    std_dev = cycle_lengths.std()
                    is_regular = std_dev <= 7  # Within 7 days is considered regular
                    
                    regularity_stats.append({
                        'userId': user_id,
                        'cycle_std_dev': std_dev,
                        'is_regular_cycles': int(is_regular),
                        'cycle_variability': std_dev / cycle_lengths.mean() if cycle_lengths.mean() > 0 else 0
                    })
        
        return pd.DataFrame(regularity_stats)
    
    def _calculate_user_symptom_stats(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate user-specific symptom statistics"""
        user_stats = df.groupby('userId').agg({
            'severity': ['mean', 'std', 'max'],
            'type': 'count'
        }).round(2)
        
        user_stats.columns = ['avg_symptom_severity', 'symptom_severity_std', 
                             'max_symptom_severity', 'total_symptoms']
        user_stats = user_stats.reset_index()
        
        # Most common symptom type for each user
        most_common = df.groupby('userId')['type'].agg(lambda x: x.value_counts().index[0] if len(x) > 0 else 'none')
        user_stats = user_stats.merge(most_common.reset_index().rename(columns={'type': 'most_common_symptom'}), 
                                     on='userId', how='left')
        
        return user_stats
    
    def _calculate_symptom_frequency(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate symptom frequency features"""
        # Calculate days between same symptom occurrences
        df_sorted = df.sort_values(['userId', 'type', 'date'])
        df_sorted['days_since_last'] = df_sorted.groupby(['userId', 'type'])['date'].diff().dt.days
        
        frequency_stats = df_sorted.groupby(['userId', 'type']).agg({
            'days_since_last': ['mean', 'std'],
            'date': 'count'
        }).round(2)
        
        frequency_stats.columns = ['avg_days_between', 'days_between_std', 'symptom_frequency']
        frequency_stats = frequency_stats.reset_index()
        
        return frequency_stats
    
    def _calculate_user_workout_stats(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate user-specific workout statistics"""
        user_stats = df.groupby('userId').agg({
            'duration': ['mean', 'sum', 'count'],
            'totalCaloriesBurned': ['mean', 'sum'],
            'intensity_numeric': 'mean'
        }).round(2)
        
        user_stats.columns = ['avg_workout_duration', 'total_workout_time', 'total_workouts',
                             'avg_calories_per_workout', 'total_calories_burned', 'avg_intensity']
        user_stats = user_stats.reset_index()
        
        # Workout frequency (workouts per week)
        user_stats['workouts_per_week'] = user_stats['total_workouts'] / 4  # Assuming 4 weeks of data
        
        return user_stats
    
    def _calculate_user_nutrition_stats(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate user-specific nutrition statistics"""
        user_stats = df.groupby('userId').agg({
            'totalCalories': ['mean', 'sum'],
            'protein': 'mean',
            'carbs': 'mean',
            'fat': 'mean'
        }).round(2)
        
        user_stats.columns = ['avg_calories_per_meal', 'total_calories',
                             'avg_protein', 'avg_carbs', 'avg_fat']
        user_stats = user_stats.reset_index()
        
        # Daily averages (assuming multiple meals per day)
        meals_per_day = df.groupby(['userId', df['date'].dt.date]).size().groupby('userId').mean()
        user_stats = user_stats.merge(meals_per_day.reset_index().rename(columns={0: 'meals_per_day'}), 
                                     on='userId', how='left')
        
        user_stats['daily_calories'] = user_stats['avg_calories_per_meal'] * user_stats['meals_per_day']
        
        return user_stats
    
    def select_features(self, X: pd.DataFrame, y: pd.Series, method: str = 'mutual_info', k: int = 20) -> List[str]:
        """
        Select top k features using specified method
        
        Args:
            X: Feature matrix
            y: Target variable
            method: Feature selection method ('mutual_info', 'f_classif')
            k: Number of features to select
            
        Returns:
            List of selected feature names
        """
        try:
            # Handle missing values
            X_filled = X.fillna(X.median())
            
            if method == 'mutual_info':
                selector = SelectKBest(score_func=mutual_info_classif, k=k)
            else:
                selector = SelectKBest(score_func=f_classif, k=k)
            
            selector.fit(X_filled, y)
            selected_features = X.columns[selector.get_support()].tolist()
            
            # Store feature scores
            feature_scores = dict(zip(X.columns, selector.scores_))
            self.feature_stats['feature_scores'] = feature_scores
            self.feature_stats['selected_features'] = selected_features
            
            logger.info(f"Selected {len(selected_features)} features using {method}")
            return selected_features
            
        except Exception as e:
            logger.error(f"Error in feature selection: {str(e)}")
            return X.columns.tolist()
    
    def scale_features(self, X: pd.DataFrame, feature_name: str = 'default') -> pd.DataFrame:
        """
        Scale features using StandardScaler
        
        Args:
            X: Feature matrix
            feature_name: Name for storing scaler
            
        Returns:
            Scaled feature matrix
        """
        try:
            if feature_name not in self.scalers:
                self.scalers[feature_name] = StandardScaler()
                X_scaled = self.scalers[feature_name].fit_transform(X)
            else:
                X_scaled = self.scalers[feature_name].transform(X)
            
            return pd.DataFrame(X_scaled, columns=X.columns, index=X.index)
            
        except Exception as e:
            logger.error(f"Error scaling features: {str(e)}")
            return X