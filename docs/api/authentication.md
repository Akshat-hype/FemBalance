# Authentication API

This document describes the authentication endpoints for the FEMbalance API.

## Base URL

```
http://localhost:3001/api/auth
```

## Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1995-06-15"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f6789012345",
    "email": "user@example.com",
    "profile": {
      "firstName": "Jane",
      "lastName": "Doe",
      "dateOfBirth": "1995-06-15T00:00:00.000Z"
    },
    "preferences": {
      "units": "metric",
      "notifications": {
        "periodReminders": true,
        "ovulationReminders": true,
        "irregularityAlerts": true
      }
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Login User

Authenticate an existing user.

**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f6789012345",
    "email": "user@example.com",
    "profile": {
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Current User

Get the currently authenticated user's information.

**Endpoint:** `GET /me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "_id": "64a1b2c3d4e5f6789012345",
    "email": "user@example.com",
    "profile": {
      "firstName": "Jane",
      "lastName": "Doe",
      "dateOfBirth": "1995-06-15T00:00:00.000Z",
      "height": 165,
      "weight": 60
    },
    "preferences": {
      "units": "metric",
      "notifications": {
        "periodReminders": true,
        "ovulationReminders": true,
        "irregularityAlerts": true
      }
    }
  }
}
```

### Logout User

Logout the current user.

**Endpoint:** `POST /logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

### Forgot Password

Request a password reset link.

**Endpoint:** `POST /forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

### Reset Password

Reset password using a reset token.

**Endpoint:** `POST /reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

## Authentication

Most API endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email",
      "value": "invalid-email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid email or password"
}
```

### 409 Conflict
```json
{
  "message": "User already exists with this email"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

## Security Notes

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire after 7 days by default
- Rate limiting is applied to prevent brute force attacks
- All endpoints use HTTPS in production
- Sensitive data is excluded from API responses

## Example Usage

### JavaScript/Node.js

```javascript
// Register a new user
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token for future requests
    localStorage.setItem('authToken', data.token);
    return data.user;
  } else {
    throw new Error(data.message);
  }
};

// Login user
const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('authToken', data.token);
    return data.user;
  } else {
    throw new Error(data.message);
  }
};

// Make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};
```

### cURL Examples

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "1995-06-15"
  }'

# Login user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'

# Get current user (replace TOKEN with actual JWT token)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```