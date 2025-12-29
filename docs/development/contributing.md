# Contributing to FEMbalance

Thank you for your interest in contributing to FEMbalance! This guide will help you get started with contributing to our menstrual health and PCOS awareness platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Standards](#code-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

FEMbalance is committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our Code of Conduct:

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Public or private harassment
- Publishing others' private information without permission
- Any conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud)
- Git
- A GitHub account

### First-Time Setup

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/fembalance.git
   cd fembalance
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/fembalance.git
   ```

3. **Set Up Development Environment**
   ```bash
   # Follow the setup guide
   # See docs/development/setup.md for detailed instructions
   ```

## Development Setup

### Quick Setup with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **ML API Setup**
   ```bash
   cd ml
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python src/api/app.py
   ```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues in existing functionality
- **Feature development**: Add new features or enhance existing ones
- **Documentation**: Improve or add documentation
- **Testing**: Add or improve test coverage
- **Performance**: Optimize existing code
- **Accessibility**: Improve accessibility features
- **UI/UX**: Enhance user interface and experience

### Finding Issues to Work On

1. **Good First Issues**: Look for issues labeled `good first issue`
2. **Help Wanted**: Check issues labeled `help wanted`
3. **Bug Reports**: Fix bugs labeled `bug`
4. **Feature Requests**: Implement features labeled `enhancement`

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Comment on the issue** to let others know you're working on it
3. **Ask questions** if anything is unclear
4. **Start small** with your first contribution

## Code Standards

### General Principles

- **Write clean, readable code** with meaningful variable and function names
- **Follow existing code patterns** and conventions
- **Keep functions small** and focused on a single responsibility
- **Add comments** for complex logic or business rules
- **Handle errors gracefully** with proper error messages

### JavaScript/Node.js Standards

```javascript
// Use ES6+ features
const getUserCycles = async (userId) => {
  try {
    const cycles = await Cycle.find({ userId }).sort({ startDate: -1 });
    return cycles;
  } catch (error) {
    logger.error('Failed to fetch user cycles', { userId, error: error.message });
    throw new Error('Unable to retrieve cycle data');
  }
};

// Use descriptive variable names
const averageCycleLength = cycles.reduce((sum, cycle) => sum + cycle.length, 0) / cycles.length;

// Add JSDoc comments for functions
/**
 * Calculate PCOS risk score based on user responses
 * @param {Object} responses - User's assessment responses
 * @param {boolean} responses.irregularPeriods - Has irregular periods
 * @param {boolean} responses.excessHairGrowth - Has excess hair growth
 * @returns {Promise<Object>} Risk assessment result
 */
const calculatePCOSRisk = async (responses) => {
  // Implementation here
};
```

### React/Frontend Standards

```jsx
// Use functional components with hooks
const CycleTracker = ({ userId }) => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        setLoading(true);
        const data = await cycleService.getCycles(userId);
        setCycles(data);
      } catch (err) {
        setError('Failed to load cycle data');
        console.error('Cycle fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="cycle-tracker">
      {cycles.map(cycle => (
        <CycleCard key={cycle._id} cycle={cycle} />
      ))}
    </div>
  );
};

// Use PropTypes for type checking
CycleTracker.propTypes = {
  userId: PropTypes.string.isRequired
};
```

### Python/ML Standards

```python
# Follow PEP 8 style guide
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class PCOSRiskPredictor:
    """PCOS risk prediction model wrapper."""
    
    def __init__(self, model_path: str):
        """Initialize the predictor with model path."""
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self._load_model()
    
    def predict(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Predict PCOS risk based on input features.
        
        Args:
            features: Dictionary of feature values
            
        Returns:
            Dictionary containing risk score and confidence
            
        Raises:
            ValueError: If required features are missing
        """
        try:
            # Validate input features
            self._validate_features(features)
            
            # Prepare features for prediction
            feature_array = self._prepare_features(features)
            
            # Make prediction
            risk_score = self.model.predict_proba(feature_array)[0][1]
            confidence = self._calculate_confidence(feature_array)
            
            return {
                'risk_score': float(risk_score),
                'confidence': float(confidence),
                'risk_level': self._get_risk_level(risk_score)
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def _validate_features(self, features: Dict[str, float]) -> None:
        """Validate that all required features are present."""
        required_features = [
            'irregular_periods', 'excess_hair_growth', 'acne',
            'weight_gain', 'hair_loss', 'dark_skin_patches'
        ]
        
        missing_features = [f for f in required_features if f not in features]
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")
```

### CSS/Styling Standards

```css
/* Use Tailwind CSS utility classes when possible */
.cycle-card {
  @apply bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow;
}

/* For custom styles, use BEM methodology */
.cycle-tracker__header {
  @apply text-2xl font-bold text-gray-800 mb-6;
}

.cycle-tracker__card {
  @apply bg-white rounded-lg shadow-md p-4;
}

.cycle-tracker__card--active {
  @apply border-2 border-pink-500;
}

/* Use CSS custom properties for theming */
:root {
  --color-primary: #ec4899;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```bash
# Feature addition
feat(cycle): add cycle prediction algorithm

# Bug fix
fix(auth): resolve JWT token expiration issue

# Documentation update
docs(api): update authentication endpoint documentation

# Performance improvement
perf(ml): optimize PCOS risk calculation

# Breaking change
feat(api)!: change cycle data structure

BREAKING CHANGE: cycle data now includes additional metadata fields
```

### Scope Guidelines

- **frontend**: Frontend/React changes
- **backend**: Backend/API changes
- **ml**: Machine learning related changes
- **auth**: Authentication related changes
- **cycle**: Cycle tracking features
- **symptoms**: Symptom logging features
- **pcos**: PCOS assessment features
- **ui**: User interface changes
- **api**: API changes
- **docs**: Documentation changes
- **test**: Testing related changes

## Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following the code standards

4. **Test your changes**
   ```bash
   # Run all tests
   npm test  # Frontend and backend
   pytest    # ML API
   ```

5. **Update documentation** if needed

### Pull Request Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by at least one maintainer
3. **Testing** in development environment
4. **Documentation** review if applicable
5. **Approval** and merge by maintainer

### After Merge

1. **Delete your feature branch**
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Update your local main branch**
   ```bash
   git checkout main
   git pull upstream main
   ```

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional Context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Testing Requirements

### Frontend Testing

```javascript
// Component testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CycleTracker } from '../CycleTracker';

describe('CycleTracker', () => {
  test('displays cycle data correctly', async () => {
    const mockCycles = [
      { _id: '1', startDate: '2023-12-01', length: 28 }
    ];
    
    render(<CycleTracker userId="user123" />);
    
    await waitFor(() => {
      expect(screen.getByText('28 days')).toBeInTheDocument();
    });
  });
  
  test('handles loading state', () => {
    render(<CycleTracker userId="user123" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Backend Testing

```javascript
// API endpoint testing with Jest and Supertest
const request = require('supertest');
const app = require('../src/app');

describe('Cycle API', () => {
  test('GET /api/cycles returns user cycles', async () => {
    const response = await request(app)
      .get('/api/cycles')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    
    expect(response.body.cycles).toBeDefined();
    expect(Array.isArray(response.body.cycles)).toBe(true);
  });
  
  test('POST /api/cycles creates new cycle', async () => {
    const cycleData = {
      startDate: '2023-12-01',
      endDate: '2023-12-05',
      flow: 'normal'
    };
    
    const response = await request(app)
      .post('/api/cycles')
      .set('Authorization', `Bearer ${validToken}`)
      .send(cycleData)
      .expect(201);
    
    expect(response.body._id).toBeDefined();
    expect(response.body.startDate).toBe(cycleData.startDate);
  });
});
```

### ML Testing

```python
# Model testing with pytest
import pytest
from src.models.pcos_predictor import PCOSRiskPredictor

class TestPCOSRiskPredictor:
    @pytest.fixture
    def predictor(self):
        return PCOSRiskPredictor('models/pcos/latest/model.pkl')
    
    def test_predict_valid_features(self, predictor):
        features = {
            'irregular_periods': 1,
            'excess_hair_growth': 0,
            'acne': 1,
            'weight_gain': 1,
            'hair_loss': 0,
            'dark_skin_patches': 0
        }
        
        result = predictor.predict(features)
        
        assert 'risk_score' in result
        assert 'confidence' in result
        assert 'risk_level' in result
        assert 0 <= result['risk_score'] <= 1
    
    def test_predict_missing_features(self, predictor):
        features = {'irregular_periods': 1}  # Missing required features
        
        with pytest.raises(ValueError, match="Missing required features"):
            predictor.predict(features)
```

### Test Coverage Requirements

- **Frontend**: Minimum 80% coverage
- **Backend**: Minimum 85% coverage
- **ML**: Minimum 90% coverage

```bash
# Check coverage
npm run test:coverage  # Frontend and backend
pytest --cov=src --cov-report=html  # ML
```

## Documentation

### Code Documentation

- **Add JSDoc comments** for all public functions
- **Include type information** in comments
- **Document complex algorithms** with inline comments
- **Update API documentation** when changing endpoints

### README Updates

When adding new features:

1. Update the main README.md
2. Update component-specific READMEs
3. Add new environment variables to .env.example
4. Update the feature list

### API Documentation

- Update OpenAPI/Swagger specifications
- Include request/response examples
- Document error codes and messages
- Add authentication requirements

## Community

### Getting Help

- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Discord**: Join our community chat (link in README)
- **Email**: Contact maintainers at dev@fembalance.com

### Recognition

Contributors are recognized in:

- **CONTRIBUTORS.md**: All contributors listed
- **Release notes**: Major contributors mentioned
- **GitHub**: Contributor statistics displayed
- **Website**: Contributor spotlight (with permission)

### Mentorship

New contributors can request mentorship:

1. Comment on a `good first issue`
2. Tag `@mentorship` in your comment
3. A maintainer will guide you through the process

## License

By contributing to FEMbalance, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to FEMbalance! Your efforts help make menstrual health tracking and PCOS awareness more accessible to everyone. 💖