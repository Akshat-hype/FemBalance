# PCOS API Documentation

## Overview
The PCOS API provides endpoints for PCOS (Polycystic Ovary Syndrome) risk assessment within the FEMbalance application. Users can submit assessment responses, view their risk scores, and track PCOS risk over time using machine learning-based analysis.

## Base URL
```
/api/pcos
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Submit PCOS Assessment

#### POST /assessment
Submit a PCOS risk assessment with responses and calculated risk score.

**Request Body:**
```json
{
  "responses": {
    "irregularPeriods": true,
    "excessHairGrowth": false,
    "acne": true,
    "weightGain": true,
    "hairLoss": false,
    "darkSkinPatches": false,
    "difficultyLosingWeight": true,
    "familyHistory": false,
    "insulinResistance": false,
    "moodChanges": true,
    "sleepApnea": false,
    "highAndrogens": false
  },
  "riskScore": 65.5,
  "riskLevel": "Medium"
}
```

**Response:**
```json
{
  "_id": "assessment_id",
  "userId": "user_id",
  "responses": {
    "irregularPeriods": true,
    "excessHairGrowth": false,
    "acne": true,
    "weightGain": true,
    "hairLoss": false,
    "darkSkinPatches": false,
    "difficultyLosingWeight": true,
    "familyHistory": false,
    "insulinResistance": false,
    "moodChanges": true,
    "sleepApnea": false,
    "highAndrogens": false
  },
  "riskScore": 65.5,
  "riskLevel": "Medium",
  "recommendations": [
    "Consider consulting with a healthcare provider about PCOS symptoms",
    "Monitor menstrual cycle regularity",
    "Maintain a balanced diet and regular exercise routine",
    "Track symptoms and lifestyle factors"
  ],
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z"
}
```

### Get All Assessments

#### GET /assessments
Get user's PCOS risk assessment history.

**Response:**
```json
{
  "assessments": [
    {
      "_id": "assessment_id_1",
      "userId": "user_id",
      "riskScore": 65.5,
      "riskLevel": "Medium",
      "createdAt": "2023-12-01T10:00:00Z"
    },
    {
      "_id": "assessment_id_2",
      "userId": "user_id",
      "riskScore": 58.2,
      "riskLevel": "Medium",
      "createdAt": "2023-11-01T10:00:00Z"
    }
  ],
  "totalAssessments": 2,
  "latestRiskLevel": "Medium",
  "riskTrend": "increasing"
}
```

### Get Latest Assessment

#### GET /assessment/latest
Get user's most recent PCOS risk assessment.

**Response:**
```json
{
  "_id": "assessment_id",
  "userId": "user_id",
  "responses": {
    "irregularPeriods": true,
    "excessHairGrowth": false,
    "acne": true,
    "weightGain": true,
    "hairLoss": false,
    "darkSkinPatches": false,
    "difficultyLosingWeight": true,
    "familyHistory": false,
    "insulinResistance": false,
    "moodChanges": true,
    "sleepApnea": false,
    "highAndrogens": false
  },
  "riskScore": 65.5,
  "riskLevel": "Medium",
  "recommendations": [
    "Consider consulting with a healthcare provider about PCOS symptoms",
    "Monitor menstrual cycle regularity",
    "Maintain a balanced diet and regular exercise routine",
    "Track symptoms and lifestyle factors"
  ],
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z"
}
```

### Get Specific Assessment

#### GET /assessment/:assessmentId
Get a specific PCOS risk assessment by ID.

**Response:**
```json
{
  "_id": "assessment_id",
  "userId": "user_id",
  "responses": {
    "irregularPeriods": true,
    "excessHairGrowth": false,
    "acne": true,
    "weightGain": true,
    "hairLoss": false,
    "darkSkinPatches": false,
    "difficultyLosingWeight": true,
    "familyHistory": false,
    "insulinResistance": false,
    "moodChanges": true,
    "sleepApnea": false,
    "highAndrogens": false
  },
  "riskScore": 65.5,
  "riskLevel": "Medium",
  "recommendations": [
    "Consider consulting with a healthcare provider about PCOS symptoms",
    "Monitor menstrual cycle regularity",
    "Maintain a balanced diet and regular exercise routine",
    "Track symptoms and lifestyle factors"
  ],
  "mlAnalysis": {
    "confidence": 0.82,
    "keyFactors": [
      "irregularPeriods",
      "weightGain",
      "difficultyLosingWeight",
      "acne"
    ],
    "modelVersion": "v2.1.0"
  },
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z"
}
```

### Delete Assessment

#### DELETE /assessment/:assessmentId
Delete a specific PCOS risk assessment.

**Response:**
```json
{
  "message": "PCOS assessment deleted successfully"
}
```

### Get Risk Statistics

#### GET /statistics
Get PCOS risk statistics and trends for the user.

**Response:**
```json
{
  "totalAssessments": 5,
  "assessmentPeriod": {
    "firstAssessment": "2023-08-01T10:00:00Z",
    "lastAssessment": "2023-12-01T10:00:00Z",
    "daysBetween": 122
  },
  "currentRisk": {
    "score": 65.5,
    "level": "Medium",
    "confidence": 0.82
  },
  "riskTrend": {
    "direction": "increasing",
    "changePercent": 12.5,
    "significance": "moderate"
  },
  "riskHistory": [
    {
      "date": "2023-08-01T10:00:00Z",
      "score": 52.1,
      "level": "Low"
    },
    {
      "date": "2023-09-15T10:00:00Z",
      "score": 58.3,
      "level": "Medium"
    },
    {
      "date": "2023-11-01T10:00:00Z",
      "score": 62.7,
      "level": "Medium"
    },
    {
      "date": "2023-12-01T10:00:00Z",
      "score": 65.5,
      "level": "Medium"
    }
  ],
  "riskFactorAnalysis": {
    "mostCommonFactors": [
      {
        "factor": "irregularPeriods",
        "frequency": 0.8,
        "impact": "high"
      },
      {
        "factor": "weightGain",
        "frequency": 0.6,
        "impact": "medium"
      },
      {
        "factor": "acne",
        "frequency": 0.4,
        "impact": "low"
      }
    ],
    "emergingFactors": [
      {
        "factor": "difficultyLosingWeight",
        "trend": "increasing",
        "recentFrequency": 0.75
      }
    ]
  },
  "recommendations": [
    "Your PCOS risk has increased moderately over time",
    "Consider discussing symptoms with a healthcare provider",
    "Focus on lifestyle modifications to manage risk factors",
    "Continue regular monitoring through assessments"
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "riskScore",
      "message": "Risk score must be between 0 and 100"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "message": "PCOS assessment not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details"
}
```

## Field Definitions

### Risk Levels
- `Low`: Risk score 0-33.3 (Low likelihood of PCOS)
- `Medium`: Risk score 33.4-66.6 (Moderate likelihood of PCOS)
- `High`: Risk score 66.7-100 (High likelihood of PCOS)

### Assessment Questions
- `irregularPeriods`: Irregular menstrual cycles (>35 days or <21 days)
- `excessHairGrowth`: Hirsutism (excess hair growth on face, chest, back)
- `acne`: Persistent acne, especially adult-onset
- `weightGain`: Unexplained weight gain or difficulty maintaining weight
- `hairLoss`: Male-pattern hair loss or thinning
- `darkSkinPatches`: Acanthosis nigricans (dark skin patches)
- `difficultyLosingWeight`: Difficulty losing weight despite diet/exercise
- `familyHistory`: Family history of PCOS or diabetes
- `insulinResistance`: Diagnosed insulin resistance or pre-diabetes
- `moodChanges`: Depression, anxiety, or mood swings
- `sleepApnea`: Sleep apnea or sleep disturbances
- `highAndrogens`: Elevated androgen levels (if known)

### Risk Trend Directions
- `increasing`: Risk score trending upward over time
- `decreasing`: Risk score trending downward over time
- `stable`: Risk score remaining relatively constant

### Trend Significance
- `minimal`: Change less than 5%
- `moderate`: Change between 5-15%
- `significant`: Change greater than 15%

## ML Integration

The PCOS API integrates with the FEMbalance ML service for advanced risk assessment:

### ML API Endpoint
```
POST http://localhost:8000/api/v1/predict/pcos
```

### ML Request Format
```json
{
  "features": {
    "irregular_periods": 1,
    "excess_hair_growth": 0,
    "acne": 1,
    "weight_gain": 1,
    "hair_loss": 0,
    "dark_skin_patches": 0,
    "difficulty_losing_weight": 1,
    "family_history": 0,
    "insulin_resistance": 0,
    "mood_changes": 1,
    "sleep_apnea": 0,
    "high_androgens": 0
  }
}
```

### ML Response Format
```json
{
  "risk_score": 65.5,
  "risk_level": "Medium",
  "confidence": 0.82,
  "key_factors": [
    "irregular_periods",
    "weight_gain",
    "difficulty_losing_weight"
  ],
  "model_version": "v2.1.0"
}
```

## Example Usage

### JavaScript/Node.js

```javascript
// Submit PCOS assessment
const submitAssessment = async (assessmentData) => {
  const response = await fetch('/api/pcos/assessment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(assessmentData)
  });
  return response.json();
};

// Get latest assessment
const getLatestAssessment = async () => {
  const response = await fetch('/api/pcos/assessment/latest', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Get risk statistics
const getRiskStatistics = async () => {
  const response = await fetch('/api/pcos/statistics', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### cURL Examples

```bash
# Submit PCOS assessment
curl -X POST http://localhost:3001/api/pcos/assessment \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responses": {
      "irregularPeriods": true,
      "acne": true,
      "weightGain": true
    },
    "riskScore": 65.5,
    "riskLevel": "Medium"
  }'

# Get latest assessment
curl -X GET http://localhost:3001/api/pcos/assessment/latest \
  -H "Authorization: Bearer TOKEN"

# Get all assessments
curl -X GET http://localhost:3001/api/pcos/assessments \
  -H "Authorization: Bearer TOKEN"

# Get risk statistics
curl -X GET http://localhost:3001/api/pcos/statistics \
  -H "Authorization: Bearer TOKEN"
```

## Important Disclaimers

⚠️ **Medical Disclaimer**: The PCOS risk assessment is for educational and informational purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.

⚠️ **Data Privacy**: All PCOS assessment data is encrypted and stored securely. Users have full control over their data and can delete assessments at any time.

⚠️ **ML Model Limitations**: The machine learning model is trained on available data and may not account for all individual variations. Results should be interpreted in conjunction with professional medical evaluation.