# FEMbalance Frontend

React.js frontend application for FEMbalance - Intelligent menstrual health platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Header, Footer, etc.)
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard-specific components
│   ├── cycle/          # Cycle tracking components
│   ├── symptoms/       # Symptom logging components
│   ├── pcos/           # PCOS-related components
│   ├── wellness/       # Exercise and diet components
│   └── blog/           # Blog components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── context/            # React context providers
├── utils/              # Utility functions
├── styles/             # CSS and styling files
└── assets/             # Static assets
```

## 🛠️ Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🎨 Styling

This project uses:
- **Tailwind CSS** for utility-first styling
- **Custom CSS** for component-specific styles
- **Responsive design** for mobile-first approach

### Color Scheme
- Primary: Pink/Rose tones for feminine health focus
- Secondary: Blue tones for trust and reliability
- Accent colors for different cycle phases and risk levels

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ML_API_URL=http://localhost:8000/api/v1
REACT_APP_APP_NAME=FEMbalance
```

### API Integration

The frontend communicates with:
- **Backend API** (Node.js/Express) for user data and cycles
- **ML API** (Python/FastAPI) for PCOS predictions

## 📱 Features

### Core Features
- **User Authentication** - Login, register, password reset
- **Cycle Tracking** - Period logging, cycle visualization
- **Symptom Monitoring** - Daily symptom tracking
- **PCOS Risk Assessment** - ML-powered risk evaluation
- **Wellness Guidance** - Exercise and diet recommendations
- **Health Education** - Blog and educational content

### UI/UX Features
- **Responsive Design** - Works on all device sizes
- **Intuitive Navigation** - Easy-to-use interface
- **Visual Feedback** - Loading states, success/error messages
- **Accessibility** - WCAG compliant components

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure
- **Unit Tests** - Component and utility function tests
- **Integration Tests** - API integration and user flow tests
- **E2E Tests** - Full application workflow tests

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
# Build Docker image
docker build -t fembalance-frontend .

# Run container
docker run -p 3000:3000 fembalance-frontend
```

### Environment-specific Builds
- **Development** - Hot reloading, debug tools
- **Staging** - Production build with staging API
- **Production** - Optimized build with production API

## 🔒 Security

### Best Practices
- **JWT Token Management** - Secure token storage and refresh
- **Input Validation** - Client-side validation for all forms
- **XSS Protection** - Sanitized user inputs
- **HTTPS Only** - All API calls use HTTPS in production

## 📊 Performance

### Optimization Techniques
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Compressed and responsive images
- **Bundle Analysis** - Regular bundle size monitoring
- **Caching** - API response caching where appropriate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration
- Follow React best practices
- Write meaningful component and function names
- Add PropTypes for component props

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.