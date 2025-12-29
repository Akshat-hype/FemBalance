import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Nav } from 'react-bootstrap';
import { Person, Shield, Download, Trash } from 'react-bootstrap-icons';
import './Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [userProfile, setUserProfile] = useState({
    personalInfo: {
      name: '',
      email: '',
      dateOfBirth: '',
      location: '',
      phone: ''
    },
    healthMetrics: {
      height: '',
      weight: '',
      activityLevel: 'moderate',
      healthGoals: []
    },
    preferences: {
      units: 'metric',
      notifications: true,
      privacy: 'private'
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch user profile data
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // API call to get user profile
      // This would be implemented with actual API endpoints
      setUserProfile({
        personalInfo: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          dateOfBirth: '1990-05-15',
          location: 'New York, NY',
          phone: '+1 (555) 123-4567'
        },
        healthMetrics: {
          height: '165',
          weight: '65',
          activityLevel: 'moderate',
          healthGoals: ['weight-management', 'pcos-management']
        },
        preferences: {
          units: 'metric',
          notifications: true,
          privacy: 'private'
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // API call to save user profile
      console.log('Saving profile:', userProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleExportData = () => {
    // Export user data functionality
    console.log('Exporting user data...');
  };

  const handleDeleteAccount = () => {
    // Delete account functionality
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
    }
  };

  return (
    <Container fluid className="profile-page">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">
            Manage your personal information, health metrics, and account preferences
          </p>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="personal">
                    <Person className="me-2" />
                    Personal Info
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="health">
                    Health Metrics
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="preferences">
                    Preferences
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="privacy">
                    <Shield className="me-2" />
                    Privacy & Security
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane active={activeTab === 'personal'}>
                  <div className="profile-section">
                    <div className="section-header">
                      <h4>Personal Information</h4>
                      <Button 
                        variant={isEditing ? "success" : "outline-primary"}
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                      >
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                      </Button>
                    </div>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={userProfile.personalInfo.name}
                            onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={userProfile.personalInfo.email}
                            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date of Birth</Form.Label>
                          <Form.Control
                            type="date"
                            value={userProfile.personalInfo.dateOfBirth}
                            onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Location</Form.Label>
                          <Form.Control
                            type="text"
                            value={userProfile.personalInfo.location}
                            onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                            disabled={!isEditing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Tab.Pane>

                <Tab.Pane active={activeTab === 'health'}>
                  <div className="profile-section">
                    <h4>Health Metrics</h4>
                    <p className="text-muted">Help us provide better recommendations by sharing your health information.</p>
                    {/* Health metrics form would go here */}
                  </div>
                </Tab.Pane>

                <Tab.Pane active={activeTab === 'preferences'}>
                  <div className="profile-section">
                    <h4>App Preferences</h4>
                    <p className="text-muted">Customize your app experience.</p>
                    {/* Preferences form would go here */}
                  </div>
                </Tab.Pane>

                <Tab.Pane active={activeTab === 'privacy'}>
                  <div className="profile-section">
                    <h4>Privacy & Security</h4>
                    <div className="privacy-actions">
                      <Button variant="outline-info" onClick={handleExportData} className="me-3">
                        <Download className="me-2" />
                        Export My Data
                      </Button>
                      <Button variant="outline-danger" onClick={handleDeleteAccount}>
                        <Trash className="me-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;