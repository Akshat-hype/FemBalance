const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'menstrual-health',
      'pcos',
      'nutrition',
      'exercise',
      'lifestyle',
      'mental-health',
      'general'
    ],
    index: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  published: {
    type: Boolean,
    default: false,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  publishDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: 60
    },
    metaDescription: {
      type: String,
      maxlength: 160
    },
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
blogSchema.index({ category: 1, published: 1, publishDate: -1 });
blogSchema.index({ tags: 1, published: 1 });
blogSchema.index({ featured: 1, published: 1, publishDate: -1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

// Virtual for formatted publish date
blogSchema.virtual('formattedPublishDate').get(function() {
  return this.publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for reading time calculation
blogSchema.virtual('estimatedReadTime').get(function() {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
  return this.readTime || 5;
});

// Method to generate slug from title
blogSchema.methods.generateSlug = function() {
  return this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Method to get category display name
blogSchema.methods.getCategoryDisplayName = function() {
  const categoryNames = {
    'menstrual-health': 'Menstrual Health',
    'pcos': 'PCOS',
    'nutrition': 'Nutrition',
    'exercise': 'Exercise & Fitness',
    'lifestyle': 'Lifestyle',
    'mental-health': 'Mental Health',
    'general': 'General'
  };
  return categoryNames[this.category] || this.category;
};

// Static method to get popular posts
blogSchema.statics.getPopularPosts = function(limit = 5) {
  return this.find({ published: true })
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .populate('author', 'profile.firstName profile.lastName')
    .select('-content');
};

// Static method to get recent posts
blogSchema.statics.getRecentPosts = function(limit = 5) {
  return this.find({ published: true })
    .sort({ publishDate: -1 })
    .limit(limit)
    .populate('author', 'profile.firstName profile.lastName')
    .select('-content');
};

// Pre-save middleware to generate slug and calculate read time
blogSchema.pre('save', function(next) {
  // Generate slug if not provided or title changed
  if (this.isNew || this.isModified('title')) {
    this.slug = this.generateSlug();
  }
  
  // Calculate read time if content changed
  if (this.isModified('content')) {
    this.readTime = this.estimatedReadTime;
  }
  
  // Set publish date if publishing for first time
  if (this.isModified('published') && this.published && !this.publishDate) {
    this.publishDate = new Date();
  }
  
  next();
});

// Pre-save middleware to ensure unique slug
blogSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('title')) {
    let baseSlug = this.generateSlug();
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug exists
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);