"""
Symptom Analysis Model for pattern recognition and clustering.
"""

import numpy as np
import pandas as pd
import pickle
import logging
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timedelta
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from collections import Counter

from ..utils.constants import (
    SYMPTOM_TYPES, CYCLE_PHASES, MODEL_PATHS, DEFAULT_HYPERPARAMETERS
)

logger = logging.getLogger(__name__)

class SymptomAnalysisModel:
    """Symptom Analysis Model for pattern recognition and insights."""
    
    def __init__(self):
        self.clustering_model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.pca = PCA(n_components=2)
        self.is_trained = False
        self.model_version = '1.0.0'
        self.cluster_profiles = {}
        
    def process_symptom_data(self, symptoms: List[Dict[str, Any]]) -> pd.DataFrame:
        """Process raw symptom data into structured format."""
        try:
            if not symptoms:
                raise ValueError("No symptom data provided")
            
            # Convert to DataFrame
            df = pd.DataFrame(symptoms)
            
            # Ensure required columns
            required_cols = ['type', 'severity', 'date']
            missing_cols = set(required_cols) - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            # Convert dates
            df['date'] = pd.to_datetime(df['date'])
            
            # Add cycle day if not present
            if 'cycle_day' not in df.columns:
                df['cycle_day'] = self._estimate_cycle_day(df['date'])
            
            # Encode symptom types
            df['symptom_type_encoded'] = df['type'].map(SYMPTOM_TYPES)
            df['symptom_type_encoded'] = df['symptom_type_encoded'].fillna(SYMPTOM_TYPES['other'])
            
            # Add temporal features
            df['hour'] = df['date'].dt.hour
            df['day_of_week'] = df['date'].dt.dayofweek
            df['month'] = df['date'].dt.month
            
            # Add cycle phase
            df['cycle_phase'] = df['cycle_day'].apply(self._get_cycle_phase)
            
            return df
            
        except Exception as e:
            logger.error(f"Symptom data processing failed: {str(e)}")
            raise ValueError(f"Symptom data processing failed: {str(e)}")
    
    def _estimate_cycle_day(self, dates: pd.Series) -> pd.Series:
        """Estimate cycle day based on dates (simplified approach)."""
        # This is a simplified estimation - in practice, would use actual cycle data
        # Assume 28-day cycles starting from the earliest date
        min_date = dates.min()
        cycle_days = ((dates - min_date).dt.days % 28) + 1
        return cycle_days
    
    def _get_cycle_phase(self, cycle_day: int) -> str:
        """Get cycle phase based on cycle day."""
        for phase, (start, end) in CYCLE_PHASES.items():
            if start <= cycle_day <= end:
                return phase
        return 'luteal'  # Default for days > 28
    
    def analyze_patterns(self, symptoms: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze symptom patterns and correlations."""
        try:
            df = self.process_symptom_data(symptoms)
            
            analysis = {
                'total_symptoms': len(df),
                'unique_types': df['type'].nunique(),
                'date_range': {
                    'start': df['date'].min().isoformat(),
                    'end': df['date'].max().isoformat(),
                    'days': (df['date'].max() - df['date'].min()).days
                },
                'patterns': self._analyze_symptom_patterns(df),
                'correlations': self._analyze_correlations(df),
                'trends': self._analyze_trends(df),
                'insights': self._generate_insights(df),
                'recommendations': self._generate_recommendations(df)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Pattern analysis failed: {str(e)}")
            raise RuntimeError(f"Pattern analysis failed: {str(e)}")
    
    def _analyze_symptom_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze basic symptom patterns."""
        patterns = {}
        
        # Most common symptoms
        symptom_counts = df['type'].value_counts()
        patterns['most_common'] = symptom_counts.head(5).to_dict()
        
        # Average severity by symptom type
        avg_severity = df.groupby('type')['severity'].mean().round(2)
        patterns['average_severity'] = avg_severity.to_dict()
        
        # Symptoms by cycle phase
        phase_symptoms = df.groupby(['cycle_phase', 'type']).size().unstack(fill_value=0)
        patterns['by_cycle_phase'] = phase_symptoms.to_dict()
        
        # Time of day patterns
        hourly_symptoms = df.groupby('hour').size()
        patterns['hourly_distribution'] = hourly_symptoms.to_dict()
        
        # Day of week patterns
        weekly_symptoms = df.groupby('day_of_week').size()
        patterns['weekly_distribution'] = weekly_symptoms.to_dict()
        
        return patterns
    
    def _analyze_correlations(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze correlations between symptoms and other factors."""
        correlations = {}
        
        # Symptom severity correlation with cycle day
        if len(df) > 10:  # Need sufficient data
            severity_cycle_corr = df['severity'].corr(df['cycle_day'])
            correlations['severity_cycle_day'] = float(severity_cycle_corr) if not np.isnan(severity_cycle_corr) else 0.0
        
        # Co-occurring symptoms
        symptom_pairs = []
        dates = df['date'].dt.date.unique()
        
        for date in dates:
            day_symptoms = df[df['date'].dt.date == date]['type'].tolist()
            if len(day_symptoms) > 1:
                for i in range(len(day_symptoms)):
                    for j in range(i+1, len(day_symptoms)):
                        symptom_pairs.append((day_symptoms[i], day_symptoms[j]))
        
        if symptom_pairs:
            pair_counts = Counter(symptom_pairs)
            correlations['co_occurring'] = dict(pair_counts.most_common(5))
        
        return correlations
    
    def _analyze_trends(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze trends over time."""
        trends = {}
        
        # Overall symptom frequency trend
        daily_counts = df.groupby(df['date'].dt.date).size()
        if len(daily_counts) > 7:  # Need at least a week of data
            # Simple linear trend
            x = np.arange(len(daily_counts))
            y = daily_counts.values
            trend_slope = np.polyfit(x, y, 1)[0]
            trends['frequency_trend'] = 'increasing' if trend_slope > 0.1 else 'decreasing' if trend_slope < -0.1 else 'stable'
        
        # Severity trends
        daily_severity = df.groupby(df['date'].dt.date)['severity'].mean()
        if len(daily_severity) > 7:
            x = np.arange(len(daily_severity))
            y = daily_severity.values
            severity_slope = np.polyfit(x, y, 1)[0]
            trends['severity_trend'] = 'increasing' if severity_slope > 0.1 else 'decreasing' if severity_slope < -0.1 else 'stable'
        
        return trends
    
    def _generate_insights(self, df: pd.DataFrame) -> List[str]:
        """Generate insights from symptom data."""
        insights = []
        
        # Most problematic phase
        phase_severity = df.groupby('cycle_phase')['severity'].mean()
        if not phase_severity.empty:
            worst_phase = phase_severity.idxmax()
            insights.append(f"Symptoms are most severe during the {worst_phase} phase")
        
        # Peak symptom times
        hourly_counts = df.groupby('hour').size()
        if not hourly_counts.empty:
            peak_hour = hourly_counts.idxmax()
            if peak_hour < 12:
                time_desc = "morning"
            elif peak_hour < 17:
                time_desc = "afternoon"
            else:
                time_desc = "evening"
            insights.append(f"Symptoms are most common in the {time_desc}")
        
        # Symptom diversity
        unique_symptoms = df['type'].nunique()
        total_symptoms = len(df)
        if unique_symptoms / total_symptoms > 0.5:
            insights.append("You experience a wide variety of symptoms")
        else:
            insights.append("Your symptoms tend to be consistent types")
        
        # Severity patterns
        avg_severity = df['severity'].mean()
        if avg_severity > 7:
            insights.append("Your symptoms tend to be quite severe")
        elif avg_severity < 4:
            insights.append("Your symptoms are generally mild")
        else:
            insights.append("Your symptoms are moderate in severity")
        
        return insights
    
    def _generate_recommendations(self, df: pd.DataFrame) -> List[str]:
        """Generate recommendations based on symptom patterns."""
        recommendations = []
        
        # Phase-specific recommendations
        phase_severity = df.groupby('cycle_phase')['severity'].mean()
        if not phase_severity.empty:
            worst_phase = phase_severity.idxmax()
            
            if worst_phase == 'menstrual':
                recommendations.extend([
                    "Consider using heat therapy during menstruation",
                    "Stay hydrated and get adequate rest during your period"
                ])
            elif worst_phase == 'luteal':
                recommendations.extend([
                    "Focus on stress management in the weeks before your period",
                    "Consider reducing caffeine intake during the luteal phase"
                ])
        
        # Severity-based recommendations
        avg_severity = df['severity'].mean()
        if avg_severity > 6:
            recommendations.extend([
                "Consider consulting with a healthcare provider about symptom management",
                "Track potential triggers like stress, diet, or sleep patterns"
            ])
        
        # General recommendations
        recommendations.extend([
            "Continue tracking symptoms to identify patterns",
            "Maintain regular exercise and healthy sleep habits",
            "Consider relaxation techniques like meditation or yoga"
        ])
        
        return recommendations
    
    def cluster_symptoms(self, symptoms: List[Dict[str, Any]], n_clusters: int = None) -> Dict[str, Any]:
        """Cluster symptoms to identify patterns."""
        try:
            df = self.process_symptom_data(symptoms)
            
            if len(df) < 10:  # Need sufficient data for clustering
                return {
                    'message': 'Insufficient data for clustering analysis',
                    'min_required': 10,
                    'current_count': len(df)
                }
            
            # Prepare features for clustering
            features = ['symptom_type_encoded', 'severity', 'cycle_day', 'hour', 'day_of_week']
            X = df[features].values
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Determine optimal number of clusters if not specified
            if n_clusters is None:
                n_clusters = self._find_optimal_clusters(X_scaled)
            
            # Perform clustering
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(X_scaled)
            
            # Calculate silhouette score
            silhouette_avg = silhouette_score(X_scaled, cluster_labels)
            
            # Analyze clusters
            df['cluster'] = cluster_labels
            cluster_analysis = self._analyze_clusters(df)
            
            # PCA for visualization
            X_pca = self.pca.fit_transform(X_scaled)
            
            result = {
                'n_clusters': n_clusters,
                'silhouette_score': float(silhouette_avg),
                'cluster_analysis': cluster_analysis,
                'cluster_centers': kmeans.cluster_centers_.tolist(),
                'visualization_data': {
                    'pca_coordinates': X_pca.tolist(),
                    'cluster_labels': cluster_labels.tolist()
                },
                'model_version': self.model_version,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Symptom clustering failed: {str(e)}")
            raise RuntimeError(f"Symptom clustering failed: {str(e)}")
    
    def _find_optimal_clusters(self, X: np.ndarray, max_clusters: int = 8) -> int:
        """Find optimal number of clusters using elbow method."""
        try:
            inertias = []
            K_range = range(2, min(max_clusters + 1, len(X) // 2))
            
            for k in K_range:
                kmeans = KMeans(n_clusters=k, random_state=42)
                kmeans.fit(X)
                inertias.append(kmeans.inertia_)
            
            # Simple elbow detection (find point with maximum curvature)
            if len(inertias) < 2:
                return 2
            
            # Calculate second derivative to find elbow
            diffs = np.diff(inertias)
            second_diffs = np.diff(diffs)
            
            if len(second_diffs) > 0:
                elbow_idx = np.argmax(second_diffs) + 2  # +2 because we start from k=2
                return min(elbow_idx, max_clusters)
            
            return 3  # Default
            
        except Exception:
            return 3  # Default fallback
    
    def _analyze_clusters(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze characteristics of each cluster."""
        cluster_analysis = {}
        
        for cluster_id in df['cluster'].unique():
            cluster_data = df[df['cluster'] == cluster_id]
            
            # Most common symptom types in this cluster
            common_symptoms = cluster_data['type'].value_counts().head(3).to_dict()
            
            # Average severity
            avg_severity = cluster_data['severity'].mean()
            
            # Most common cycle phase
            common_phase = cluster_data['cycle_phase'].mode().iloc[0] if not cluster_data['cycle_phase'].empty else 'unknown'
            
            # Time patterns
            common_hour = cluster_data['hour'].mode().iloc[0] if not cluster_data['hour'].empty else 12
            
            cluster_analysis[f'cluster_{cluster_id}'] = {
                'size': len(cluster_data),
                'common_symptoms': common_symptoms,
                'average_severity': round(avg_severity, 2),
                'common_cycle_phase': common_phase,
                'common_hour': int(common_hour),
                'description': self._describe_cluster(common_symptoms, avg_severity, common_phase)
            }
        
        return cluster_analysis
    
    def _describe_cluster(self, symptoms: Dict, severity: float, phase: str) -> str:
        """Generate a description for a symptom cluster."""
        top_symptom = list(symptoms.keys())[0] if symptoms else 'various'
        
        severity_desc = 'severe' if severity > 7 else 'moderate' if severity > 4 else 'mild'
        
        return f"{severity_desc.capitalize()} {top_symptom} symptoms, typically during {phase} phase"
    
    def save_model(self, filepath: str = None):
        """Save the trained model to disk."""
        try:
            if filepath is None:
                filepath = MODEL_PATHS['symptom_analysis']
            
            model_data = {
                'clustering_model': self.clustering_model,
                'scaler': self.scaler,
                'label_encoder': self.label_encoder,
                'pca': self.pca,
                'cluster_profiles': self.cluster_profiles,
                'model_version': self.model_version,
                'trained_at': datetime.utcnow().isoformat()
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"Symptom analysis model saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Model saving failed: {str(e)}")
            raise RuntimeError(f"Model saving failed: {str(e)}")
    
    def load_model(self, filepath: str = None):
        """Load a trained model from disk."""
        try:
            if filepath is None:
                filepath = MODEL_PATHS['symptom_analysis']
            
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.clustering_model = model_data.get('clustering_model')
            self.scaler = model_data.get('scaler', StandardScaler())
            self.label_encoder = model_data.get('label_encoder', LabelEncoder())
            self.pca = model_data.get('pca', PCA(n_components=2))
            self.cluster_profiles = model_data.get('cluster_profiles', {})
            self.model_version = model_data.get('model_version', '1.0.0')
            self.is_trained = True
            
            logger.info(f"Symptom analysis model loaded from {filepath}")
            
        except FileNotFoundError:
            logger.warning(f"Model file not found: {filepath}")
            # Initialize with default settings for development
            self._initialize_default_model()
        except Exception as e:
            logger.error(f"Model loading failed: {str(e)}")
            raise RuntimeError(f"Model loading failed: {str(e)}")
    
    def _initialize_default_model(self):
        """Initialize default model for development/testing."""
        try:
            logger.info("Initializing default symptom analysis model...")
            
            # Initialize components
            self.scaler = StandardScaler()
            self.label_encoder = LabelEncoder()
            self.pca = PCA(n_components=2)
            self.clustering_model = None  # Will be created on demand
            self.is_trained = True
            
            logger.info("Default symptom analysis model initialized")
            
        except Exception as e:
            logger.error(f"Default model initialization failed: {str(e)}")
            raise RuntimeError(f"Default model initialization failed: {str(e)}")