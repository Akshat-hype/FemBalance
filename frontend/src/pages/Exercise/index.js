import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab } from 'react-bootstrap';
import ExercisePlans from '../../components/wellness/ExercisePlans';
import WorkoutTracker from '../../components/wellness/WorkoutTracker';
import './Exercise.css';

const Exercise = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [workoutStats, setWorkoutStats] = useState({
    weeklyWorkouts: 0,
    totalCalories: 0,
    averageDuration: 0
  });

  useEffect(() => {
    // Fetch workout statistics
    fetchWorkoutStats();
  }, []);

  const fetchWorkoutStats = async () => {
    try {
      // API call to get workout statistics
      // This would be implemented with actual API endpoints
      setWorkoutStats({
        weeklyWorkouts: 4,
        totalCalories: 1250,
        averageDuration: 45
      });
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    }
  };

  return (
    <Container fluid className="exercise-page">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Exercise & Fitness</h1>
          <p className="page-subtitle">
            Track your workouts, follow exercise plans, and monitor your fitness progress
          </p>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="stat-number">{workoutStats.weeklyWorkouts}</h3>
              <p className="stat-label">Workouts This Week</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="stat-number">{workoutStats.totalCalories}</h3>
              <p className="stat-label">Calories Burned</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="stat-number">{workoutStats.averageDuration}min</h3>
              <p className="stat-label">Average Duration</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="plans">Exercise Plans</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="tracker">Workout Tracker</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">Workout History</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane active={activeTab === 'plans'}>
                  <ExercisePlans />
                </Tab.Pane>
                <Tab.Pane active={activeTab === 'tracker'}>
                  <WorkoutTracker />
                </Tab.Pane>
                <Tab.Pane active={activeTab === 'history'}>
                  <div className="workout-history">
                    <h4>Workout History</h4>
                    <p>Your workout history will be displayed here.</p>
                    {/* WorkoutHistory component would go here */}
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

export default Exercise;