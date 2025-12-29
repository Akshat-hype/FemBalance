import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, ProgressBar } from 'react-bootstrap';
import DietPlans from '../../components/wellness/DietPlans';
import './Diet.css';

const Diet = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [nutritionStats, setNutritionStats] = useState({
    dailyCalories: 0,
    calorieGoal: 2000,
    protein: 0,
    proteinGoal: 150,
    carbs: 0,
    carbsGoal: 250,
    fat: 0,
    fatGoal: 65
  });

  useEffect(() => {
    // Fetch nutrition statistics
    fetchNutritionStats();
  }, []);

  const fetchNutritionStats = async () => {
    try {
      // API call to get nutrition statistics
      // This would be implemented with actual API endpoints
      setNutritionStats({
        dailyCalories: 1650,
        calorieGoal: 2000,
        protein: 120,
        proteinGoal: 150,
        carbs: 180,
        carbsGoal: 250,
        fat: 55,
        fatGoal: 65
      });
    } catch (error) {
      console.error('Error fetching nutrition stats:', error);
    }
  };

  const calculateProgress = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <Container fluid className="diet-page">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Diet & Nutrition</h1>
          <p className="page-subtitle">
            Track your meals, follow diet plans, and monitor your nutritional intake
          </p>
        </Col>
      </Row>

      {/* Daily Nutrition Overview */}
      <Row className="mb-4">
        <Col>
          <Card className="nutrition-overview">
            <Card.Header>
              <h4>Today's Nutrition</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="nutrition-item">
                    <h5>Calories</h5>
                    <div className="nutrition-progress">
                      <ProgressBar 
                        now={calculateProgress(nutritionStats.dailyCalories, nutritionStats.calorieGoal)}
                        variant="primary"
                      />
                      <span className="nutrition-text">
                        {nutritionStats.dailyCalories} / {nutritionStats.calorieGoal} kcal
                      </span>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="nutrition-item">
                    <h5>Protein</h5>
                    <div className="nutrition-progress">
                      <ProgressBar 
                        now={calculateProgress(nutritionStats.protein, nutritionStats.proteinGoal)}
                        variant="success"
                      />
                      <span className="nutrition-text">
                        {nutritionStats.protein} / {nutritionStats.proteinGoal} g
                      </span>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="nutrition-item">
                    <h5>Carbs</h5>
                    <div className="nutrition-progress">
                      <ProgressBar 
                        now={calculateProgress(nutritionStats.carbs, nutritionStats.carbsGoal)}
                        variant="warning"
                      />
                      <span className="nutrition-text">
                        {nutritionStats.carbs} / {nutritionStats.carbsGoal} g
                      </span>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="nutrition-item">
                    <h5>Fat</h5>
                    <div className="nutrition-progress">
                      <ProgressBar 
                        now={calculateProgress(nutritionStats.fat, nutritionStats.fatGoal)}
                        variant="info"
                      />
                      <span className="nutrition-text">
                        {nutritionStats.fat} / {nutritionStats.fatGoal} g
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
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
                  <Nav.Link eventKey="plans">Diet Plans</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="log">Log Meal</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="history">Meal History</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="analytics">Analytics</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                <Tab.Pane active={activeTab === 'plans'}>
                  <DietPlans />
                </Tab.Pane>
                <Tab.Pane active={activeTab === 'log'}>
                  <div className="meal-logging">
                    <h4>Log Your Meal</h4>
                    <p>Meal logging interface will be implemented here.</p>
                    {/* MealLogger component would go here */}
                  </div>
                </Tab.Pane>
                <Tab.Pane active={activeTab === 'history'}>
                  <div className="meal-history">
                    <h4>Meal History</h4>
                    <p>Your meal history will be displayed here.</p>
                    {/* MealHistory component would go here */}
                  </div>
                </Tab.Pane>
                <Tab.Pane active={activeTab === 'analytics'}>
                  <div className="nutrition-analytics">
                    <h4>Nutrition Analytics</h4>
                    <p>Detailed nutrition analytics and trends will be shown here.</p>
                    {/* NutritionAnalytics component would go here */}
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

export default Diet;