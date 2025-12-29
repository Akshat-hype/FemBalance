import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import BlogList from '../../components/blog/BlogList';
import BlogCategories from '../../components/blog/BlogCategories';
import './Blog.css';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredPosts, setFeaturedPosts] = useState([]);

  useEffect(() => {
    // Fetch featured blog posts
    fetchFeaturedPosts();
  }, []);

  const fetchFeaturedPosts = async () => {
    try {
      // API call to get featured posts
      // This would be implemented with actual API endpoints
      setFeaturedPosts([
        {
          id: 1,
          title: "Understanding PCOS: A Comprehensive Guide",
          excerpt: "Learn about the symptoms, causes, and management of PCOS...",
          category: "PCOS",
          readTime: "8 min read",
          featured: true
        },
        {
          id: 2,
          title: "Nutrition Tips for Hormonal Balance",
          excerpt: "Discover foods that can help regulate your hormones naturally...",
          category: "Nutrition",
          readTime: "6 min read",
          featured: true
        }
      ]);
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <Container fluid className="blog-page">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title">Health & Wellness Blog</h1>
          <p className="page-subtitle">
            Expert insights, tips, and guidance for women's health and PCOS management
          </p>
        </Col>
      </Row>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup className="search-input">
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <BlogCategories 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </Col>
      </Row>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <Row className="mb-4">
          <Col>
            <h3 className="section-title">Featured Articles</h3>
            <Row>
              {featuredPosts.map(post => (
                <Col md={6} key={post.id} className="mb-3">
                  <Card className="featured-post">
                    <Card.Body>
                      <div className="post-meta">
                        <span className="category-badge">{post.category}</span>
                        <span className="read-time">{post.readTime}</span>
                      </div>
                      <Card.Title>{post.title}</Card.Title>
                      <Card.Text>{post.excerpt}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}

      {/* Main Blog Content */}
      <Row>
        <Col>
          <BlogList 
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Blog;