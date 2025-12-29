# Symptoms API Documentation

## Overview
The Symptoms API provides endpoints for logging and tracking menstrual symptoms and lifestyle factors within the FEMbalance application. Users can track symptoms like cramps, bloating, mood swings, and lifestyle factors like sleep and exercise.

## Base URL
```
/api/symptoms
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Get Symptoms

#### GET /
Get user's symptom logs with optional filtering and pagination.

**Query Parameters:**
- `startDate` (optional): Filter symptoms from this date (ISO 8601 format)
- `endDate` (optional): Filter symptoms until this date (ISO 8601 format)
- `limit` (optional): Number of records to return (1-100, default: 20)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
{
  "symptoms": [
    {
      "_id": "symptom_id",
      "userId": "user_id",
      "date": "2023-12-01T00:00:00Z",
      "symptoms": {
        "cramps": 3,
        "bloating": 2,
        "moodSwings": 4,
        "fatigue": 3,
        "acne": 1
      },
      "lifestyle": {
        "sleepHours": 7.5,
        "stressLevel": 6,
        "exerciseMinutes": 30
      },
      "notes": "Moderate symptoms today",
      "cycleDay": 14,
      "createdAt": "2023-12-01T10:00:00Z",
      "updatedAt": "2023-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 45,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Log Symptoms

#### POST /
Log symptoms and lifestyle data for a specific date.

**Request Body:**
```json
{
  "date": "2023-12-01T00:00:00Z",
  "symptoms": {
    "cramps": 3,
    "bloating": 2,
    "moodSwings": 4,
    "fatigue": 3,
    "acne": 1
  },
  "lifestyle": {
    "sleepHours": 7.5,
    "stressLevel": 6,
    "exerciseMinutes": 30
  },
  "notes": "Moderate symptoms today"
}
```

**Response:**
```json
{
  "_id": "symptom_id",
  "userId": "user_id",
  "date": "2023-12-01T00:00:00Z",
  "symptoms": {
    "cramps": 3,
    "bloating": 2,
    "moodSwings": 4,
    "fatigue": 3,
    "acne": 1
  },
  "lifestyle": {
    "sleepHours": 7.5,
    "stressLevel": 6,
    "exerciseMinutes": 30
  },
  "notes": "Moderate symptoms today",
  "cycleDay": 14,
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z"
}
```

### Update Symptoms

#### PUT /:id
Update an existing symptom log.

**Request Body:**
```json
{
  "symptoms": {
    "cramps": 4,
    "bloating": 3
  },
  "lifestyle": {
    "stressLevel": 7
  },
  "notes": "Updated symptoms - feeling worse"
}
```

**Response:**
```json
{
  "_id": "symptom_id",
  "userId": "user_id",
  "date": "2023-12-01T00:00:00Z",
  "symptoms": {
    "cramps": 4,
    "bloating": 3,
    "moodSwings": 4,
    "fatigue": 3,
    "acne": 1
  },
  "lifestyle": {
    "sleepHours": 7.5,
    "stressLevel": 7,
    "exerciseMinutes": 30
  },
  "notes": "Updated symptoms - feeling worse",
  "cycleDay": 14,
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T15:00:00Z"
}
```

### Delete Symptoms

#### DELETE /:id
Delete a symptom log.

**Response:**
```json
{
  "message": "Symptom log deleted successfully"
}
```

### Get Symptom History

#### GET /history
Get symptom history and trends over time.

**Query Parameters:**
- `days` (optional): Number of days to look back (1-365, default: 30)

**Response:**
```json
{
  "period": {
    "days": 30,
    "startDate": "2023-11-01T00:00:00Z",
    "endDate": "2023-12-01T00:00:00Z"
  },
  "trends": {
    "symptoms": {
      "cramps": {
        "average": 2.8,
        "trend": "stable",
        "peakDays": [1, 2, 28, 29]
      },
      "bloating": {
        "average": 2.1,
        "trend": "decreasing",
        "peakDays": [26, 27, 28]
      },
      "moodSwings": {
        "average": 3.2,
        "trend": "increasing",
        "peakDays": [14, 15, 25, 26]
      }
    },
    "lifestyle": {
      "sleepHours": {
        "average": 7.2,
        "trend": "stable"
      },
      "stressLevel": {
        "average": 5.8,
        "trend": "increasing"
      },
      "exerciseMinutes": {
        "average": 25.4,
        "trend": "decreasing"
      }
    }
  },
  "correlations": [
    {
      "factor1": "stressLevel",
      "factor2": "moodSwings",
      "correlation": 0.78,
      "strength": "strong"
    },
    {
      "factor1": "exerciseMinutes",
      "factor2": "cramps",
      "correlation": -0.45,
      "strength": "moderate"
    }
  ]
}
```

### Get Symptom Statistics

#### GET /stats
Get statistical analysis of symptoms and lifestyle factors.

**Query Parameters:**
- `days` (optional): Number of days to analyze (1-365, default: 90)

**Response:**
```json
{
  "period": {
    "days": 90,
    "totalLogs": 78
  },
  "symptoms": {
    "cramps": {
      "average": 2.6,
      "min": 0,
      "max": 5,
      "mostCommon": 3,
      "daysLogged": 65
    },
    "bloating": {
      "average": 2.1,
      "min": 0,
      "max": 5,
      "mostCommon": 2,
      "daysLogged": 58
    },
    "moodSwings": {
      "average": 3.1,
      "min": 0,
      "max": 5,
      "mostCommon": 3,
      "daysLogged": 72
    },
    "fatigue": {
      "average": 2.8,
      "min": 0,
      "max": 5,
      "mostCommon": 3,
      "daysLogged": 69
    },
    "acne": {
      "average": 1.4,
      "min": 0,
      "max": 4,
      "mostCommon": 1,
      "daysLogged": 45
    }
  },
  "lifestyle": {
    "sleepHours": {
      "average": 7.3,
      "min": 4.5,
      "max": 9.5,
      "daysLogged": 76
    },
    "stressLevel": {
      "average": 5.2,
      "min": 1,
      "max": 10,
      "daysLogged": 74
    },
    "exerciseMinutes": {
      "average": 28.5,
      "min": 0,
      "max": 90,
      "daysLogged": 68
    }
  },
  "insights": [
    "Your cramps are typically moderate during menstruation",
    "Stress levels tend to be higher during PMS phase",
    "Regular exercise correlates with reduced symptom severity"
  ]
}
```

### Bulk Log Symptoms

#### POST /bulk
Log multiple symptom entries at once.

**Request Body:**
```json
{
  "symptoms": [
    {
      "date": "2023-12-01T00:00:00Z",
      "symptoms": {
        "cramps": 3,
        "bloating": 2
      },
      "lifestyle": {
        "sleepHours": 7.5,
        "stressLevel": 6
      }
    },
    {
      "date": "2023-12-02T00:00:00Z",
      "symptoms": {
        "cramps": 4,
        "fatigue": 3
      },
      "lifestyle": {
        "sleepHours": 6.5,
        "stressLevel": 7
      }
    }
  ]
}
```

**Response:**
```json
{
  "message": "Bulk symptom logging completed",
  "created": 2,
  "updated": 0,
  "errors": [],
  "logs": [
    {
      "_id": "symptom_id_1",
      "date": "2023-12-01T00:00:00Z",
      "symptoms": {
        "cramps": 3,
        "bloating": 2
      }
    },
    {
      "_id": "symptom_id_2",
      "date": "2023-12-02T00:00:00Z",
      "symptoms": {
        "cramps": 4,
        "fatigue": 3
      }
    }
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
      "field": "symptoms.cramps",
      "message": "Cramps severity must be between 0-5"
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
  "message": "Symptom log not found"
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

### Symptom Severity Scale (0-5)
- `0`: No symptoms
- `1`: Very mild
- `2`: Mild
- `3`: Moderate
- `4`: Severe
- `5`: Very severe

### Stress Level Scale (0-10)
- `0-2`: Very low stress
- `3-4`: Low stress
- `5-6`: Moderate stress
- `7-8`: High stress
- `9-10`: Very high stress

### Trend Indicators
- `increasing`: Symptom severity is getting worse over time
- `decreasing`: Symptom severity is improving over time
- `stable`: Symptom severity remains consistent

### Correlation Strength
- `weak`: Correlation coefficient 0.0-0.3
- `moderate`: Correlation coefficient 0.3-0.7
- `strong`: Correlation coefficient 0.7-1.0

## Example Usage

### JavaScript/Node.js

```javascript
// Log symptoms for today
const logSymptoms = async (symptomData) => {
  const response = await fetch('/api/symptoms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(symptomData)
  });
  return response.json();
};

// Get symptom history
const getSymptomHistory = async (days = 30) => {
  const response = await fetch(`/api/symptoms/history?days=${days}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Get symptom statistics
const getSymptomStats = async () => {
  const response = await fetch('/api/symptoms/stats', {
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
# Log symptoms
curl -X POST http://localhost:3001/api/symptoms \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-12-01T00:00:00Z",
    "symptoms": {
      "cramps": 3,
      "bloating": 2,
      "moodSwings": 4
    },
    "lifestyle": {
      "sleepHours": 7.5,
      "stressLevel": 6,
      "exerciseMinutes": 30
    }
  }'

# Get symptom history
curl -X GET "http://localhost:3001/api/symptoms/history?days=30" \
  -H "Authorization: Bearer TOKEN"

# Get symptom statistics
curl -X GET http://localhost:3001/api/symptoms/stats \
  -H "Authorization: Bearer TOKEN"

# Bulk log symptoms
curl -X POST http://localhost:3001/api/symptoms/bulk \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": [
      {
        "date": "2023-12-01T00:00:00Z",
        "symptoms": {"cramps": 3}
      },
      {
        "date": "2023-12-02T00:00:00Z",
        "symptoms": {"cramps": 4}
      }
    ]
  }'
```