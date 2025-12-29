# Testing Guide

## Overview

This guide covers testing strategies, tools, and best practices for the FEMbalance application. We use a comprehensive testing approach that includes unit tests, integration tests, end-to-end tests, and property-based testing.

## Testing Philosophy

Our testing strategy follows these principles:

- **Test-Driven Development (TDD)**: Write tests before implementing features
- **Comprehensive Coverage**: Aim for high test coverage across all components
- **Fast Feedback**: Tests should run quickly to enable rapid development
- **Reliable Tests**: Tests should be deterministic and not flaky
- **Maintainable Tests**: Tests should be easy to read, write, and maintain

## Testing Stack

### Frontend Testing
- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **MSW (Mock Service Worker)**: API mocking
- **Cypress**: End-to-end testing
- **Storybook**: Component visual testing

### Backend Testing
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion testing
- **MongoDB Memory Server**: In-memory database for testing
- **Sinon**: Mocking and stubbing
- **Artillery**: Load testing

### ML Testing
- **pytest**: Python testing framework
- **pytest-cov**: Coverage reporting
- **Hypothesis**: Property-based testing
- **scikit-learn**: Model testing utilities
- **MLflow**: Model performance tracking

## Test Structure and Organization

### Directory Structure
```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── __tests__/
│   │   ├── pages/
│   │   │   └── __tests__/
│   │   ├── services/
│   │   │   └── __tests__/
│   │   └── utils/
│   │       └── __tests__/
│   ├── cypress/
│   │   ├── e2e/
│   │   ├── fixtures/
│   │   └── support/
│   └── __tests__/
│       └── setup.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── __tests__/
│   │   ├── models/
│   │   │   └── __tests__/
│   │   ├── routes/
│   │   │   └── __tests__/
│   │   └── services/
│   │       └── __tests__/
│   └── tests/
│       ├── integration/
│       ├── fixtures/
│       └── setup.js
└── ml/
    ├── src/
    │   ├── models/
    │   │   └── test_*.py
    │   ├── api/
    │   │   └── test_*.py
    │   └── utils/
    │       └── test_*.py
    └── tests/
        ├── integration/
        ├── fixtures/
        └── conftest.py
```
## Frontend Testing

### Unit Testing with Jest and React Testing Library

#### Component Testing

```javascript
// src/components/__tests__/CycleCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { CycleCard } from '../CycleCard';

describe('CycleCard', () => {
  const mockCycle = {
    _id: '1',
    startDate: '2023-12-01',
    endDate: '2023-12-05',
    length: 28,
    flow: 'normal'
  };

  test('renders cycle information correctly', () => {
    render(<CycleCard cycle={mockCycle} />);
    
    expect(screen.getByText('28 days')).toBeInTheDocument();
    expect(screen.getByText('Normal flow')).toBeInTheDocument();
    expect(screen.getByText('Dec 1 - Dec 5')).toBeInTheDocument();
  });

  test('handles edit button click', () => {
    const mockOnEdit = jest.fn();
    render(<CycleCard cycle={mockCycle} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockCycle._id);
  });

  test('displays loading state', () => {
    render(<CycleCard cycle={mockCycle} loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

#### Hook Testing

```javascript
// src/hooks/__tests__/useCycle.test.js
import { renderHook, act } from '@testing-library/react';
import { useCycle } from '../useCycle';
import * as cycleService from '../../services/cycle';

jest.mock('../../services/cycle');

describe('useCycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches cycles on mount', async () => {
    const mockCycles = [{ _id: '1', length: 28 }];
    cycleService.getCycles.mockResolvedValue(mockCycles);

    const { result } = renderHook(() => useCycle('user123'));

    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.cycles).toEqual(mockCycles);
    expect(result.current.loading).toBe(false);
  });

  test('handles error state', async () => {
    const mockError = new Error('Failed to fetch');
    cycleService.getCycles.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCycle('user123'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Failed to fetch cycles');
    expect(result.current.loading).toBe(false);
  });
});
```

#### Service Testing

```javascript
// src/services/__tests__/cycleService.test.js
import { getCycles, createCycle } from '../cycleService';
import { api } from '../api';

jest.mock('../api');

describe('cycleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCycles', () => {
    test('returns cycles data', async () => {
      const mockResponse = {
        data: {
          cycles: [{ _id: '1', length: 28 }],
          pagination: { totalPages: 1 }
        }
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await getCycles('user123');

      expect(api.get).toHaveBeenCalledWith('/cycles', {
        params: { userId: 'user123' }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles API error', async () => {
      const mockError = new Error('Network error');
      api.get.mockRejectedValue(mockError);

      await expect(getCycles('user123')).rejects.toThrow('Network error');
    });
  });

  describe('createCycle', () => {
    test('creates new cycle', async () => {
      const cycleData = { startDate: '2023-12-01', flow: 'normal' };
      const mockResponse = { data: { _id: '1', ...cycleData } };
      api.post.mockResolvedValue(mockResponse);

      const result = await createCycle(cycleData);

      expect(api.post).toHaveBeenCalledWith('/cycles', cycleData);
      expect(result).toEqual(mockResponse.data);
    });
  });
});
```

### Integration Testing

```javascript
// src/__tests__/CycleTracking.integration.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CycleTracking } from '../pages/CycleTracking';
import { server } from '../mocks/server';

// Mock Service Worker setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CycleTracking Integration', () => {
  test('complete cycle logging flow', async () => {
    renderWithProviders(<CycleTracking />);

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('Cycle History')).toBeInTheDocument();
    });

    // Click add cycle button
    fireEvent.click(screen.getByRole('button', { name: /add cycle/i }));

    // Fill out form
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: '2023-12-01' }
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: '2023-12-05' }
    });
    fireEvent.click(screen.getByLabelText(/normal flow/i));

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save cycle/i }));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Cycle saved successfully')).toBeInTheDocument();
    });

    // Verify cycle appears in list
    expect(screen.getByText('Dec 1 - Dec 5')).toBeInTheDocument();
  });
});
```

### End-to-End Testing with Cypress

```javascript
// cypress/e2e/cycle-tracking.cy.js
describe('Cycle Tracking', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
    cy.visit('/cycle-tracking');
  });

  it('allows user to log a new cycle', () => {
    // Click add cycle button
    cy.get('[data-testid="add-cycle-btn"]').click();

    // Fill out cycle form
    cy.get('[data-testid="start-date-input"]').type('2023-12-01');
    cy.get('[data-testid="end-date-input"]').type('2023-12-05');
    cy.get('[data-testid="flow-normal"]').click();
    cy.get('[data-testid="notes-input"]').type('Regular cycle this month');

    // Submit form
    cy.get('[data-testid="save-cycle-btn"]').click();

    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('contain', 'Cycle saved successfully');

    // Verify cycle appears in history
    cy.get('[data-testid="cycle-list"]')
      .should('contain', 'Dec 1 - Dec 5')
      .should('contain', 'Normal flow');
  });

  it('calculates cycle statistics correctly', () => {
    // Navigate to statistics
    cy.get('[data-testid="stats-tab"]').click();

    // Verify statistics are displayed
    cy.get('[data-testid="average-cycle-length"]')
      .should('contain', '28 days');
    cy.get('[data-testid="cycle-regularity"]')
      .should('contain', 'Regular');
  });

  it('handles form validation errors', () => {
    cy.get('[data-testid="add-cycle-btn"]').click();

    // Try to submit without required fields
    cy.get('[data-testid="save-cycle-btn"]').click();

    // Verify validation errors
    cy.get('[data-testid="start-date-error"]')
      .should('contain', 'Start date is required');
  });
});
```

### Visual Testing with Storybook

```javascript
// src/components/CycleCard.stories.js
import { CycleCard } from './CycleCard';

export default {
  title: 'Components/CycleCard',
  component: CycleCard,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  args: {
    cycle: {
      _id: '1',
      startDate: '2023-12-01',
      endDate: '2023-12-05',
      length: 28,
      flow: 'normal'
    }
  }
};

export const LongCycle = {
  args: {
    cycle: {
      _id: '2',
      startDate: '2023-11-01',
      endDate: '2023-11-07',
      length: 35,
      flow: 'heavy'
    }
  }
};

export const Loading = {
  args: {
    cycle: {
      _id: '3',
      startDate: '2023-12-01',
      endDate: '2023-12-05',
      length: 28,
      flow: 'normal'
    },
    loading: true
  }
};
```

## Backend Testing

### Unit Testing Controllers

```javascript
// src/controllers/__tests__/cycleController.test.js
const request = require('supertest');
const app = require('../../app');
const Cycle = require('../../models/Cycle');
const { generateToken } = require('../../utils/auth');

jest.mock('../../models/Cycle');

describe('Cycle Controller', () => {
  let authToken;

  beforeEach(() => {
    authToken = generateToken({ userId: 'user123' });
    jest.clearAllMocks();
  });

  describe('GET /api/cycles', () => {
    test('returns user cycles', async () => {
      const mockCycles = [
        { _id: '1', userId: 'user123', length: 28 },
        { _id: '2', userId: 'user123', length: 30 }
      ];
      Cycle.find.mockResolvedValue(mockCycles);

      const response = await request(app)
        .get('/api/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.cycles).toEqual(mockCycles);
      expect(Cycle.find).toHaveBeenCalledWith({ userId: 'user123' });
    });

    test('handles database error', async () => {
      Cycle.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.message).toBe('Internal server error');
    });

    test('requires authentication', async () => {
      await request(app)
        .get('/api/cycles')
        .expect(401);
    });
  });

  describe('POST /api/cycles', () => {
    test('creates new cycle', async () => {
      const cycleData = {
        startDate: '2023-12-01',
        endDate: '2023-12-05',
        flow: 'normal'
      };
      const mockCycle = { _id: '1', userId: 'user123', ...cycleData };
      Cycle.prototype.save = jest.fn().mockResolvedValue(mockCycle);

      const response = await request(app)
        .post('/api/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cycleData)
        .expect(201);

      expect(response.body).toEqual(mockCycle);
    });

    test('validates required fields', async () => {
      const response = await request(app)
        .post('/api/cycles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'startDate',
          message: 'Please provide a valid start date'
        })
      );
    });
  });
});
```

### Model Testing

```javascript
// src/models/__tests__/Cycle.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Cycle = require('../Cycle');

describe('Cycle Model', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Cycle.deleteMany({});
  });

  test('creates cycle with valid data', async () => {
    const cycleData = {
      userId: new mongoose.Types.ObjectId(),
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-05'),
      flow: 'normal'
    };

    const cycle = new Cycle(cycleData);
    const savedCycle = await cycle.save();

    expect(savedCycle._id).toBeDefined();
    expect(savedCycle.length).toBe(5);
    expect(savedCycle.flow).toBe('normal');
  });

  test('calculates cycle length correctly', async () => {
    const cycle = new Cycle({
      userId: new mongoose.Types.ObjectId(),
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-05'),
      flow: 'normal'
    });

    await cycle.save();
    expect(cycle.length).toBe(5);
  });

  test('validates required fields', async () => {
    const cycle = new Cycle({});

    await expect(cycle.save()).rejects.toThrow();
  });

  test('validates flow enum values', async () => {
    const cycle = new Cycle({
      userId: new mongoose.Types.ObjectId(),
      startDate: new Date('2023-12-01'),
      flow: 'invalid-flow'
    });

    await expect(cycle.save()).rejects.toThrow();
  });
});
```

### Integration Testing

```javascript
// tests/integration/cycle.integration.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Cycle = require('../../src/models/Cycle');

describe('Cycle Integration Tests', () => {
  let mongoServer;
  let user;
  let authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Cycle.deleteMany({});

    // Create test user
    user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      profile: { firstName: 'Test', lastName: 'User' }
    });

    // Generate auth token
    authToken = user.generateAuthToken();
  });

  test('complete cycle management flow', async () => {
    // Create cycle
    const cycleData = {
      startDate: '2023-12-01',
      endDate: '2023-12-05',
      flow: 'normal',
      notes: 'Regular cycle'
    };

    const createResponse = await request(app)
      .post('/api/cycles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(cycleData)
      .expect(201);

    const cycleId = createResponse.body._id;

    // Get cycles
    const getResponse = await request(app)
      .get('/api/cycles')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getResponse.body.cycles).toHaveLength(1);
    expect(getResponse.body.cycles[0]._id).toBe(cycleId);

    // Update cycle
    const updateData = { flow: 'heavy', notes: 'Updated notes' };
    const updateResponse = await request(app)
      .put(`/api/cycles/${cycleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData)
      .expect(200);

    expect(updateResponse.body.flow).toBe('heavy');
    expect(updateResponse.body.notes).toBe('Updated notes');

    // Get statistics
    const statsResponse = await request(app)
      .get('/api/cycles/stats')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(statsResponse.body.totalCycles).toBe(1);
    expect(statsResponse.body.averageCycleLength).toBeDefined();

    // Delete cycle
    await request(app)
      .delete(`/api/cycles/${cycleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Verify deletion
    const finalGetResponse = await request(app)
      .get('/api/cycles')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(finalGetResponse.body.cycles).toHaveLength(0);
  });
});
```

## ML Testing

### Model Testing

```python
# src/models/test_pcos_predictor.py
import pytest
import numpy as np
import pandas as pd
from unittest.mock import Mock, patch
from src.models.pcos_predictor import PCOSRiskPredictor

class TestPCOSRiskPredictor:
    @pytest.fixture
    def sample_features(self):
        return {
            'irregular_periods': 1,
            'excess_hair_growth': 0,
            'acne': 1,
            'weight_gain': 1,
            'hair_loss': 0,
            'dark_skin_patches': 0,
            'difficulty_losing_weight': 1,
            'family_history': 0,
            'insulin_resistance': 0,
            'mood_changes': 1,
            'sleep_apnea': 0,
            'high_androgens': 0
        }

    @pytest.fixture
    def predictor(self):
        with patch('joblib.load') as mock_load:
            mock_model = Mock()
            mock_model.predict_proba.return_value = np.array([[0.3, 0.7]])
            mock_load.return_value = mock_model
            
            predictor = PCOSRiskPredictor('models/pcos/latest/model.pkl')
            predictor.scaler = Mock()
            predictor.scaler.transform.return_value = np.array([[1, 0, 1, 1, 0, 0]])
            
            return predictor

    def test_predict_valid_features(self, predictor, sample_features):
        result = predictor.predict(sample_features)
        
        assert 'risk_score' in result
        assert 'confidence' in result
        assert 'risk_level' in result
        assert 0 <= result['risk_score'] <= 1
        assert result['risk_level'] in ['Low', 'Medium', 'High']

    def test_predict_missing_features(self, predictor):
        incomplete_features = {'irregular_periods': 1}
        
        with pytest.raises(ValueError, match="Missing required features"):
            predictor.predict(incomplete_features)

    def test_predict_invalid_feature_types(self, predictor, sample_features):
        sample_features['irregular_periods'] = 'invalid'
        
        with pytest.raises(ValueError, match="Invalid feature type"):
            predictor.predict(sample_features)

    def test_risk_level_calculation(self, predictor):
        # Test low risk
        assert predictor._get_risk_level(0.2) == 'Low'
        
        # Test medium risk
        assert predictor._get_risk_level(0.5) == 'Medium'
        
        # Test high risk
        assert predictor._get_risk_level(0.8) == 'High'

    def test_feature_preparation(self, predictor, sample_features):
        feature_array = predictor._prepare_features(sample_features)
        
        assert isinstance(feature_array, np.ndarray)
        assert feature_array.shape[1] == len(sample_features)

    @pytest.mark.parametrize("risk_score,expected_level", [
        (0.1, 'Low'),
        (0.33, 'Low'),
        (0.34, 'Medium'),
        (0.66, 'Medium'),
        (0.67, 'High'),
        (0.9, 'High')
    ])
    def test_risk_level_boundaries(self, predictor, risk_score, expected_level):
        assert predictor._get_risk_level(risk_score) == expected_level
```

### Property-Based Testing

```python
# src/models/test_pcos_properties.py
import pytest
from hypothesis import given, strategies as st, assume
from src.models.pcos_predictor import PCOSRiskPredictor

class TestPCOSProperties:
    @pytest.fixture
    def predictor(self):
        # Use a real trained model for property testing
        return PCOSRiskPredictor('models/pcos/latest/model.pkl')

    @given(st.dictionaries(
        keys=st.sampled_from([
            'irregular_periods', 'excess_hair_growth', 'acne',
            'weight_gain', 'hair_loss', 'dark_skin_patches',
            'difficulty_losing_weight', 'family_history',
            'insulin_resistance', 'mood_changes', 'sleep_apnea',
            'high_androgens'
        ]),
        values=st.integers(min_value=0, max_value=1),
        min_size=12,
        max_size=12
    ))
    def test_prediction_output_format(self, predictor, features):
        """Property: All predictions should return valid format"""
        result = predictor.predict(features)
        
        # Check required keys exist
        assert 'risk_score' in result
        assert 'confidence' in result
        assert 'risk_level' in result
        
        # Check value ranges
        assert 0 <= result['risk_score'] <= 1
        assert 0 <= result['confidence'] <= 1
        assert result['risk_level'] in ['Low', 'Medium', 'High']

    @given(st.dictionaries(
        keys=st.sampled_from([
            'irregular_periods', 'excess_hair_growth', 'acne',
            'weight_gain', 'hair_loss', 'dark_skin_patches'
        ]),
        values=st.integers(min_value=0, max_value=1),
        min_size=1,
        max_size=5
    ))
    def test_incomplete_features_raise_error(self, predictor, incomplete_features):
        """Property: Incomplete features should always raise ValueError"""
        with pytest.raises(ValueError, match="Missing required features"):
            predictor.predict(incomplete_features)

    @given(st.dictionaries(
        keys=st.sampled_from([
            'irregular_periods', 'excess_hair_growth', 'acne',
            'weight_gain', 'hair_loss', 'dark_skin_patches',
            'difficulty_losing_weight', 'family_history',
            'insulin_resistance', 'mood_changes', 'sleep_apnea',
            'high_androgens'
        ]),
        values=st.integers(min_value=0, max_value=1),
        min_size=12,
        max_size=12
    ))
    def test_prediction_consistency(self, predictor, features):
        """Property: Same input should always produce same output"""
        result1 = predictor.predict(features)
        result2 = predictor.predict(features)
        
        assert result1['risk_score'] == result2['risk_score']
        assert result1['risk_level'] == result2['risk_level']

    @given(st.integers(min_value=0, max_value=12))
    def test_risk_monotonicity(self, predictor, num_positive_features):
        """Property: More positive features should not decrease risk"""
        # Create two feature sets with different numbers of positive features
        base_features = {
            'irregular_periods': 0, 'excess_hair_growth': 0, 'acne': 0,
            'weight_gain': 0, 'hair_loss': 0, 'dark_skin_patches': 0,
            'difficulty_losing_weight': 0, 'family_history': 0,
            'insulin_resistance': 0, 'mood_changes': 0, 'sleep_apnea': 0,
            'high_androgens': 0
        }
        
        # Set specified number of features to 1
        feature_names = list(base_features.keys())
        for i in range(min(num_positive_features, len(feature_names))):
            base_features[feature_names[i]] = 1
        
        # Create a version with one additional positive feature
        if num_positive_features < len(feature_names):
            more_features = base_features.copy()
            more_features[feature_names[num_positive_features]] = 1
            
            base_risk = predictor.predict(base_features)['risk_score']
            more_risk = predictor.predict(more_features)['risk_score']
            
            # More positive features should not decrease risk
            assert more_risk >= base_risk
```

### API Testing

```python
# src/api/test_app.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from src.api.app import app

client = TestClient(app)

class TestPCOSAPI:
    def test_health_endpoint(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert "status" in response.json()
        assert response.json()["status"] == "healthy"

    @patch('src.models.pcos_predictor.PCOSRiskPredictor')
    def test_predict_pcos_valid_request(self, mock_predictor_class):
        # Mock the predictor
        mock_predictor = Mock()
        mock_predictor.predict.return_value = {
            'risk_score': 0.65,
            'confidence': 0.82,
            'risk_level': 'Medium'
        }
        mock_predictor_class.return_value = mock_predictor

        request_data = {
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

        response = client.post("/api/v1/predict/pcos", json=request_data)
        
        assert response.status_code == 200
        result = response.json()
        assert "risk_score" in result
        assert "confidence" in result
        assert "risk_level" in result
        assert result["risk_score"] == 0.65

    def test_predict_pcos_missing_features(self):
        request_data = {
            "features": {
                "irregular_periods": 1
                # Missing other required features
            }
        }

        response = client.post("/api/v1/predict/pcos", json=request_data)
        assert response.status_code == 422  # Validation error

    def test_predict_pcos_invalid_feature_values(self):
        request_data = {
            "features": {
                "irregular_periods": 2,  # Invalid value (should be 0 or 1)
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

        response = client.post("/api/v1/predict/pcos", json=request_data)
        assert response.status_code == 422

    @patch('src.models.pcos_predictor.PCOSRiskPredictor')
    def test_predict_pcos_model_error(self, mock_predictor_class):
        # Mock the predictor to raise an exception
        mock_predictor = Mock()
        mock_predictor.predict.side_effect = Exception("Model error")
        mock_predictor_class.return_value = mock_predictor

        request_data = {
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

        response = client.post("/api/v1/predict/pcos", json=request_data)
        assert response.status_code == 500
```

## Test Configuration

### Frontend Test Configuration

```javascript
// frontend/jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
  ]
};
```

```javascript
// frontend/src/__tests__/setup.js
import '@testing-library/jest-dom';
import { server } from '../mocks/server';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Backend Test Configuration

```javascript
// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.test.js',
    '<rootDir>/tests/**/*.js'
  ]
};
```

```javascript
// backend/tests/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

### ML Test Configuration

```python
# ml/pytest.ini
[tool:pytest]
testpaths = src tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts = 
    --strict-markers
    --strict-config
    --verbose
    --cov=src
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=90
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
```

```python
# ml/conftest.py
import pytest
import numpy as np
import pandas as pd
from unittest.mock import Mock
import tempfile
import os

@pytest.fixture
def sample_pcos_data():
    """Generate sample PCOS dataset for testing"""
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'irregular_periods': np.random.binomial(1, 0.6, n_samples),
        'excess_hair_growth': np.random.binomial(1, 0.4, n_samples),
        'acne': np.random.binomial(1, 0.5, n_samples),
        'weight_gain': np.random.binomial(1, 0.7, n_samples),
        'hair_loss': np.random.binomial(1, 0.3, n_samples),
        'dark_skin_patches': np.random.binomial(1, 0.2, n_samples),
    }
    
    # Generate target based on features (simplified)
    target = (
        data['irregular_periods'] * 0.3 +
        data['weight_gain'] * 0.2 +
        data['acne'] * 0.1 +
        np.random.normal(0, 0.1, n_samples)
    ) > 0.3
    
    df = pd.DataFrame(data)
    df['target'] = target.astype(int)
    
    return df

@pytest.fixture
def temp_model_dir():
    """Create temporary directory for model files"""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield temp_dir

@pytest.fixture
def mock_trained_model():
    """Mock trained scikit-learn model"""
    model = Mock()
    model.predict.return_value = np.array([0, 1, 0])
    model.predict_proba.return_value = np.array([[0.8, 0.2], [0.3, 0.7], [0.9, 0.1]])
    model.feature_names_in_ = [
        'irregular_periods', 'excess_hair_growth', 'acne',
        'weight_gain', 'hair_loss', 'dark_skin_patches'
    ]
    return model
```

## Running Tests

### Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- CycleCard.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run tests in CI mode
npm test -- --ci --coverage --watchAll=false
```

### Backend Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=cycleController

# Run integration tests only
npm test -- --testPathPattern=integration

# Run tests in watch mode
npm test -- --watch

# Run tests with debugging
npm test -- --inspect-brk
```

### ML Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest src/models/test_pcos_predictor.py

# Run tests with specific marker
pytest -m "not slow"

# Run property-based tests
pytest src/models/test_pcos_properties.py

# Run tests in parallel
pytest -n auto

# Run tests with verbose output
pytest -v
```

### End-to-End Tests

```bash
# Run Cypress tests headlessly
npx cypress run

# Open Cypress test runner
npx cypress open

# Run specific test file
npx cypress run --spec "cypress/e2e/cycle-tracking.cy.js"

# Run tests in specific browser
npx cypress run --browser chrome

# Run tests with video recording
npx cypress run --record --key <record-key>
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run linting
        run: cd frontend && npm run lint
      
      - name: Run tests
        run: cd frontend && npm test -- --ci --coverage --watchAll=false
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: frontend/coverage/lcov.info
          flags: frontend

  backend-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run linting
        run: cd backend && npm run lint
      
      - name: Run tests
        run: cd backend && npm test -- --ci --coverage
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/fembalance_test
          JWT_SECRET: test-secret
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: backend/coverage/lcov.info
          flags: backend

  ml-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          cd ml
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run linting
        run: cd ml && flake8 src/
      
      - name: Run tests
        run: cd ml && pytest --cov=src --cov-report=xml
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ml/coverage.xml
          flags: ml

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests, ml-tests]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Wait for services
        run: |
          npx wait-on http://localhost:3000
          npx wait-on http://localhost:3001/api/health
          npx wait-on http://localhost:8000/health
      
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          working-directory: frontend
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
      
      - name: Upload Cypress screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: frontend/cypress/screenshots
```

## Test Data Management

### Test Fixtures

```javascript
// tests/fixtures/cycles.js
export const mockCycles = [
  {
    _id: '1',
    userId: 'user123',
    startDate: '2023-12-01T00:00:00Z',
    endDate: '2023-12-05T00:00:00Z',
    length: 28,
    flow: 'normal',
    notes: 'Regular cycle'
  },
  {
    _id: '2',
    userId: 'user123',
    startDate: '2023-11-03T00:00:00Z',
    endDate: '2023-11-07T00:00:00Z',
    length: 30,
    flow: 'heavy',
    notes: 'Heavier than usual'
  }
];

export const mockCycleStats = {
  averageCycleLength: 29,
  averagePeriodLength: 5,
  totalCycles: 2,
  cycleRegularity: 'regular'
};
```

### Database Seeding

```javascript
// tests/helpers/seedDatabase.js
const User = require('../../src/models/User');
const Cycle = require('../../src/models/Cycle');
const Symptom = require('../../src/models/Symptom');

const seedDatabase = async () => {
  // Create test user
  const user = await User.create({
    email: 'test@example.com',
    password: 'password123',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01'
    }
  });

  // Create test cycles
  const cycles = await Cycle.create([
    {
      userId: user._id,
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-05'),
      flow: 'normal'
    },
    {
      userId: user._id,
      startDate: new Date('2023-11-03'),
      endDate: new Date('2023-11-07'),
      flow: 'heavy'
    }
  ]);

  // Create test symptoms
  const symptoms = await Symptom.create([
    {
      userId: user._id,
      date: new Date('2023-12-01'),
      symptoms: { cramps: 3, bloating: 2 },
      lifestyle: { sleepHours: 7, stressLevel: 5 }
    }
  ]);

  return { user, cycles, symptoms };
};

module.exports = { seedDatabase };
```

## Performance Testing

### Load Testing with Artillery

```yaml
# tests/load/api-load-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
  variables:
    authToken: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

scenarios:
  - name: "Get cycles"
    weight: 40
    flow:
      - get:
          url: "/api/cycles"
          headers:
            Authorization: "{{ authToken }}"
          expect:
            - statusCode: 200

  - name: "Create cycle"
    weight: 30
    flow:
      - post:
          url: "/api/cycles"
          headers:
            Authorization: "{{ authToken }}"
            Content-Type: "application/json"
          json:
            startDate: "2023-12-01T00:00:00Z"
            endDate: "2023-12-05T00:00:00Z"
            flow: "normal"
          expect:
            - statusCode: 201

  - name: "Get cycle stats"
    weight: 30
    flow:
      - get:
          url: "/api/cycles/stats"
          headers:
            Authorization: "{{ authToken }}"
          expect:
            - statusCode: 200
```

```bash
# Run load test
artillery run tests/load/api-load-test.yml

# Generate HTML report
artillery run --output report.json tests/load/api-load-test.yml
artillery report report.json
```

## Test Best Practices

### General Testing Principles

1. **Write tests first** (Test-Driven Development)
2. **Keep tests simple** and focused on one thing
3. **Use descriptive test names** that explain what is being tested
4. **Arrange, Act, Assert** pattern for test structure
5. **Mock external dependencies** to isolate units under test
6. **Test edge cases** and error conditions
7. **Maintain test independence** - tests should not depend on each other
8. **Keep tests fast** - slow tests discourage running them frequently

### Frontend Testing Best Practices

1. **Test user interactions**, not implementation details
2. **Use semantic queries** (getByRole, getByLabelText) over test IDs
3. **Test accessibility** by using screen reader queries
4. **Mock API calls** consistently across tests
5. **Test loading and error states**
6. **Use real user events** with userEvent library
7. **Test responsive behavior** with different viewport sizes

### Backend Testing Best Practices

1. **Test API contracts** - request/response formats
2. **Test authentication and authorization**
3. **Test input validation** thoroughly
4. **Test error handling** and edge cases
5. **Use in-memory database** for faster tests
6. **Test database operations** with real data
7. **Test middleware** in isolation

### ML Testing Best Practices

1. **Test model inputs and outputs** format and ranges
2. **Use property-based testing** for comprehensive coverage
3. **Test model performance** metrics and thresholds
4. **Test data preprocessing** pipelines
5. **Mock expensive operations** like model training
6. **Test model versioning** and loading
7. **Test prediction consistency** and reproducibility

This comprehensive testing guide ensures that the FEMbalance application maintains high quality, reliability, and performance across all components.