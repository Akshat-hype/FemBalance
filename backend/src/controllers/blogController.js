const Blog = require('../models/Blog');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get all blog posts
const getAllPosts = async (req, res) => {
  try {
    const { 
      category, 
      tag, 
      search, 
      page = 1, 
      limit = 10,
      featured,
      published = true 
    } = req.query;

    // Build query
    const query = {};
    
    if (published !== undefined) {
      query.published = published === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await Blog.find(query)
      .populate('author', 'profile.firstName profile.lastName')
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Exclude full content for list view

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single blog post
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Blog.findById(postId)
      .populate('author', 'profile.firstName profile.lastName profile.bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get blog post by slug
const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Blog.findOne({ slug, published: true })
      .populate('author', 'profile.firstName profile.lastName profile.bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    logger.error('Error fetching blog post by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get featured posts
const getFeaturedPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const posts = await Blog.find({ featured: true, published: true })
      .populate('author', 'profile.firstName profile.lastName')
      .sort({ publishDate: -1 })
      .limit(parseInt(limit))
      .select('-content');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    logger.error('Error fetching featured posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get related posts
const getRelatedPosts = async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 3 } = req.query;

    const currentPost = await Blog.findById(postId);
    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Find related posts based on category and tags
    const relatedPosts = await Blog.find({
      _id: { $ne: postId },
      published: true,
      $or: [
        { category: currentPost.category },
        { tags: { $in: currentPost.tags } }
      ]
    })
    .populate('author', 'profile.firstName profile.lastName')
    .sort({ publishDate: -1 })
    .limit(parseInt(limit))
    .select('-content');

    res.json({
      success: true,
      data: relatedPosts
    });
  } catch (error) {
    logger.error('Error fetching related posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get blog categories
const getCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    });
  } catch (error) {
    logger.error('Error fetching blog categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get popular tags
const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Blog.aggregate([
      { $match: { published: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: tags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });
  } catch (error) {
    logger.error('Error fetching popular tags:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Search posts
const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = {
      published: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    const posts = await Blog.find(searchQuery)
      .populate('author', 'profile.firstName profile.lastName')
      .sort({ publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content');

    const total = await Blog.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        posts,
        query: q,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error searching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  getPostBySlug,
  getFeaturedPosts,
  getRelatedPosts,
  getCategories,
  getPopularTags,
  searchPosts
};