const express = require('express');
const {
  getAllPosts,
  getPostById,
  getPostBySlug,
  getFeaturedPosts,
  getRelatedPosts,
  getCategories,
  getPopularTags,
  searchPosts
} = require('../controllers/blogController');

const router = express.Router();

// @route   GET /api/blog/posts
// @desc    Get all blog posts with filtering and pagination
// @access  Public
router.get('/posts', getAllPosts);

// @route   GET /api/blog/posts/featured
// @desc    Get featured blog posts
// @access  Public
router.get('/posts/featured', getFeaturedPosts);

// @route   GET /api/blog/posts/search
// @desc    Search blog posts
// @access  Public
router.get('/posts/search', searchPosts);

// @route   GET /api/blog/categories
// @desc    Get all blog categories with post counts
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/blog/tags
// @desc    Get popular tags
// @access  Public
router.get('/tags', getPopularTags);

// @route   GET /api/blog/posts/:postId
// @desc    Get blog post by ID
// @access  Public
router.get('/posts/:postId', getPostById);

// @route   GET /api/blog/posts/:postId/related
// @desc    Get related blog posts
// @access  Public
router.get('/posts/:postId/related', getRelatedPosts);

// @route   GET /api/blog/slug/:slug
// @desc    Get blog post by slug
// @access  Public
router.get('/slug/:slug', getPostBySlug);

module.exports = router;