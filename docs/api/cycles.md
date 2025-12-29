# Cycles API Documentation

## Overview
The Cycles API provides endpoints for managing menstrual cycle tracking within the FEMbalance application. Users can log cycle data, track patterns, and get predictions based on their cycle history.

## Base URL
```
/api/cycles
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Get Cycles

#### GET /
Get user's cycle history with optional pagination.

**Query Parameters:**
- `limit` (optional): Number of cycles to return (1-50, default: 10)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
{
  "cycles": [
    {
      "_id": "cycle_id",
      "userId": "user_id",
      "startDate": "2023-12-01T00:00:00Z",
      "endDate": "2023-12-05T00:00:00Z",
      "cycleLength": 28,
      "periodLength": 5,
      "flow": "normal",
      "notes": "Regular cycle",
      "createdAt": "2023-12-01T10:00:00Z",
      "updatedAt": "2023-12-05T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCycles": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Create Cycle

#### POST /
Log a new menstrual cycle.

**Request Body:**
```json
{
  "startDate": "2023-12-01T00:00:00Z",
  "endDate": "2023-12-05T00:00:00Z",
  "flow": "normal",
  "notes": "Regular cycle this month"
}
```

**Response:**
```json
{
  "_id": "cycle_id",
  "userId": "user_id",
  "startDate": "2023-12-01T00:00:00Z",
  "endDate": "2023-12-05T00:00:00Z",
  "cycleLength": 28,
  "periodLength": 5,
  "flow": "normal",
  "notes": "Regular cycle this month",
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-01T10:00:00Z"
}
```

### Update Cycle

#### PUT /:id
Update an existing cycle record.

**Request Body:**
```json
{
  "endDate": "2023-12-06T00:00:00Z",
  "flow": "heavy",
  "notes": "Updated cycle information"
}
```

**Response:**
```json
{
  "_id": "cycle_id",
  "userId": "user_id",
  "startDate": "2023-12-01T00:00:00Z",
  "endDate": "2023-12-06T00:00:00Z",
  "cycleLength": 28,
  "periodLength": 6,
  "flow": "heavy",
  "notes": "Updated cycle information",
  "createdAt": "2023-12-01T10:00:00Z",
  "updatedAt": "2023-12-06T10:00:00Z"
}
```

### Delete Cycle

#### DELETE /:id
Delete a cycle record.

**Response:**
```json
{
  "message": "Cycle deleted successfully"
}
```

### Get Cycle Statistics

#### GET /stats
Get user's cycle statistics and patterns.

**Response:**
```json
{
  "averageCycleLength": 28.5,
  "averagePeriodLength": 5.2,
  "totalCycles": 12,
  "cycleRegularity": "regular",
  "lastCycleDate": "2023-12-01T00:00:00Z",
  "cycleLengthVariation": 2.1,
  "flowPatterns": {
    "light": 2,
    "normal": 8,
    "heavy": 2
  },
  "monthlyStats": [
    {
      "month": "2023-11",
      "cycleLength": 29,
      "periodLength": 5
    },
    {
      "month": "2023-12",
      "cycleLength": 28,
      "periodLength": 5
    }
  ]
}
```

### Get Cycle Predictions

#### GET /predictions
Get predictions for next period and ovulation based on cycle history.

**Response:**
```json
{
  "nextPeriod": {
    "predictedDate": "2023-12-29T00:00:00Z",
    "confidence": "high",
    "daysUntil": 7
  },
  "nextOvulation": {
    "predictedDate": "2023-12-15T00:00:00Z",
    "confidence": "medium",
    "daysUntil": -7,
    "fertileWindow": {
      "start": "2023-12-13T00:00:00Z",
      "end": "2023-12-17T00:00:00Z"
    }
  },
  "currentPhase": {
    "phase": "luteal",
    "dayInPhase": 14,
    "description": "Post-ovulation phase"
  },
  "cycleInsights": [
    "Your cycles are regular with an average length of 28 days",
    "Your period typically lasts 5 days",
    "You ovulate around day 14 of your cycle"
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
      "field": "startDate",
      "message": "Please provide a valid start date"
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
  "message": "Cycle not found"
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

### Flow Types
- `light`: Light menstrual flow
- `normal`: Normal menstrual flow
- `heavy`: Heavy menstrual flow

### Cycle Regularity
- `regular`: Cycle length varies by less than 7 days
- `irregular`: Cycle length varies by 7 or more days
- `unknown`: Not enough data to determine regularity

### Prediction Confidence
- `high`: Based on 6+ cycles with consistent patterns
- `medium`: Based on 3-5 cycles with some variation
- `low`: Based on fewer than 3 cycles or high variation

## Example Usage

### JavaScript/Node.js

```javascript
// Get user's cycles
const getCycles = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/cycles?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Log a new cycle
const logCycle = async (cycleData) => {
  const response = await fetch('/api/cycles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cycleData)
  });
  return response.json();
};

// Get cycle predictions
const getPredictions = async () => {
  const response = await fetch('/api/cycles/predictions', {
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
# Get cycles
curl -X GET http://localhost:3001/api/cycles \
  -H "Authorization: Bearer TOKEN"

# Log a new cycle
curl -X POST http://localhost:3001/api/cycles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2023-12-01T00:00:00Z",
    "endDate": "2023-12-05T00:00:00Z",
    "flow": "normal",
    "notes": "Regular cycle"
  }'

# Get cycle statistics
curl -X GET http://localhost:3001/api/cycles/stats \
  -H "Authorization: Bearer TOKEN"

# Get predictions
curl -X GET http://localhost:3001/api/cycles/predictions \
  -H "Authorization: Bearer TOKEN"
```