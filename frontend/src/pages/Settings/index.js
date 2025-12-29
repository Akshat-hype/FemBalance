import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Bell, Shield, Globe, Moon, Sun } from 'react-bootstrap-icons';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      cycleReminders: true,
      workoutReminders: true,
      mealReminders: false,
      emailUpdates: true,
      pushNotifications: true
    },
    privacy: {
      dataSharing: false,
      analyticsTracking: true,
      profileVisibility: 'private'
    },
    appearance: {
      theme: 'light',
      language: 'en'
    },
    account: {
      twoFactorAuth: false,
      dataRetention: '2-years',
      exportFormat: 'json'
    }
  });

  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Fetch user settings
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // API call to get user settings
      // This would be implemented with actual API endpoints
      console.log('Fetching settings...');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // API call to save settings
      console.log('Saving settings:', settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <Container fluid className="settings-page">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Customize your app experience and manage your account preferences
          </p>
        </Col>
      </Row>

      {saveStatus && (
        <Row className="mb-3">
          <Col>
            <Alert variant={saveStatus === 'success' ? 'success' : 'danger'}>
              {saveStatus === 'success' 
                ? 'Settings saved successfully!' 
                : 'Error saving settings. Please try again.'
              }
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={6}>
          {/* Notifications Settings */}
          <Card className="mb-4">
            <Card.Header>
              <h4>
                <Bell className="me-2" />
                Notifications
              </h4>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="switch"
                id="cycle-reminders"
                label="Cycle reminders"
                checked={settings.notifications.cycleReminders}
                onChange={(e) => handleSettingChange('notifications', 'cycleReminders', e.target.checked)}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="workout-reminders"
                label="Workout reminders"
                checked={settings.notifications.workoutReminders}
                onChange={(e) => handleSettingChange('notifications', 'workoutReminders', e.target.checked)}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="meal-reminders"
                label="Meal reminders"
                checked={settings.notifications.mealReminders}
                onChange={(e) => handleSettingChange('notifications', 'mealReminders', e.target.checked)}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="email-updates"
                label="Email updates"
                checked={settings.notifications.emailUpdates}
                onChange={(e) => handleSettingChange('notifications', 'emailUpdates', e.target.checked)}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="push-notifications"
                label="Push notifications"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
              />
            </Card.Body>
          </Card>

          {/* Appearance Settings */}
          <Card className="mb-4">
            <Card.Header>
              <h4>
                {settings.appearance.theme === 'light' ? <Sun className="me-2" /> : <Moon className="me-2" />}
                Appearance
              </h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Theme</Form.Label>
                <Form.Select
                  value={settings.appearance.theme}
                  onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Language</Form.Label>
                <Form.Select
                  value={settings.appearance.language}
                  onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          {/* Privacy Settings */}
          <Card className="mb-4">
            <Card.Header>
              <h4>
                <Shield className="me-2" />
                Privacy & Security
              </h4>
            </Card.Header>
            <Card.Body>
              <Form.Check
                type="switch"
                id="data-sharing"
                label="Allow data sharing for research"
                checked={settings.privacy.dataSharing}
                onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                className="mb-3"
              />
              <Form.Check
                type="switch"
                id="analytics-tracking"
                label="Analytics tracking"
                checked={settings.privacy.analyticsTracking}
                onChange={(e) => handleSettingChange('privacy', 'analyticsTracking', e.target.checked)}
                className="mb-3"
              />
              <Form.Group className="mb-3">
                <Form.Label>Profile visibility</Form.Label>
                <Form.Select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                >
                  <option value="private">Private</option>
                  <option value="friends">Friends only</option>
                  <option value="public">Public</option>
                </Form.Select>
              </Form.Group>
              <Form.Check
                type="switch"
                id="two-factor-auth"
                label="Two-factor authentication"
                checked={settings.account.twoFactorAuth}
                onChange={(e) => handleSettingChange('account', 'twoFactorAuth', e.target.checked)}
              />
            </Card.Body>
          </Card>

          {/* Account Settings */}
          <Card className="mb-4">
            <Card.Header>
              <h4>
                <Globe className="me-2" />
                Account
              </h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Data retention period</Form.Label>
                <Form.Select
                  value={settings.account.dataRetention}
                  onChange={(e) => handleSettingChange('account', 'dataRetention', e.target.value)}
                >
                  <option value="1-year">1 year</option>
                  <option value="2-years">2 years</option>
                  <option value="5-years">5 years</option>
                  <option value="indefinite">Indefinite</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Data export format</Form.Label>
                <Form.Select
                  value={settings.account.exportFormat}
                  onChange={(e) => handleSettingChange('account', 'exportFormat', e.target.value)}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <Button variant="primary" size="lg" onClick={handleSave}>
            Save All Settings
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;