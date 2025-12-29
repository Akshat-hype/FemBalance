import React, { useState, useEffect } from 'react';

const BlogList = ({ onPostSelect }) => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Posts', count: 0 },
    { id: 'menstrual-health', name: 'Menstrual Health', count: 0 },
    { id: 'pcos', name: 'PCOS Awareness', count: 0 },
    { id: 'nutrition', name: 'Nutrition', count: 0 },
    { id: 'exercise', name: 'Exercise & Fitness', count: 0 },
    { id: 'lifestyle', name: 'Lifestyle', count: 0 },
    { id: 'mental-health', name: 'Mental Health', count: 0 }
  ];

  // Mock blog posts data
  const mockPosts = [
    {
      id: 1,
      title: 'Understanding Your Menstrual Cycle: A Complete Guide',
      excerpt: 'Learn about the four phases of your menstrual cycle and how hormones affect your body and mood throughout the month.',
      category: 'menstrual-health',
      author: 'Dr. Sarah Johnson',
      publishDate: '2024-01-15',
      readTime: '8 min read',
      image: '/api/placeholder/400/250',
      tags: ['cycle-tracking', 'hormones', 'education'],
      featured: true
    },
    {
      id: 2,
      title: 'PCOS and Diet: Foods That Help Manage Symptoms',
      excerpt: 'Discover which foods can help manage PCOS symptoms and improve insulin sensitivity naturally.',
      category: 'pcos',
      author: 'Nutritionist Emma Davis',
      publishDate: '2024-01-12',
      readTime: '6 min read',
      image: '/api/placeholder/400/250',
      tags: ['pcos', 'nutrition', 'insulin-resistance'],
      featured: false
    },
    {
      id: 3,
      title: 'Exercise During Your Period: What You Need to Know',
      excerpt: 'Learn how to adapt your workout routine during menstruation and which exercises can actually help with cramps.',
      category: 'exercise',
      author: 'Fitness Coach Lisa Chen',
      publishDate: '2024-01-10',
      readTime: '5 min read',
      image: '/api/placeholder/400/250',
      tags: ['exercise', 'period', 'fitness'],
      featured: false
    },
    {
      id: 4,
      title: 'Managing PMS: Natural Remedies and Lifestyle Changes',
      excerpt: 'Explore natural ways to reduce PMS symptoms through diet, exercise, and stress management techniques.',
      category: 'lifestyle',
      author: 'Dr. Maria Rodriguez',
      publishDate: '2024-01-08',
      readTime: '7 min read',
      image: '/api/placeholder/400/250',
      tags: ['pms', 'natural-remedies', 'lifestyle'],
      featured: false
    },
    {
      id: 5,
      title: 'The Connection Between Mental Health and Menstrual Cycles',
      excerpt: 'Understanding how hormonal changes throughout your cycle can affect mood, anxiety, and overall mental wellbeing.',
      category: 'mental-health',
      author: 'Psychologist Dr. Amy Wilson',
      publishDate: '2024-01-05',
      readTime: '9 min read',
      image: '/api/placeholder/400/250',
      tags: ['mental-health', 'hormones', 'mood'],
      featured: true
    },
    {
      id: 6,
      title: 'Nutrition for Healthy Periods: Essential Nutrients',
      excerpt: 'Learn about the key nutrients your body needs for healthy menstrual cycles and where to find them.',
      category: 'nutrition',
      author: 'Registered Dietitian Kate Brown',
      publishDate: '2024-01-03',
      readTime: '6 min read',
      image: '/api/placeholder/400/250',
      tags: ['nutrition', 'vitamins', 'minerals'],
      featured: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = posts.filter(post => post.featured);

  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return posts.length;
    return posts.filter(post => post.category === categoryId).length;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Health & Wellness Blog</h2>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name} ({getCategoryCount(category.id)})
            </button>
          ))}
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && selectedCategory === 'all' && !searchTerm && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Articles</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {featuredPosts.map(post => (
              <div
                key={post.id}
                onClick={() => onPostSelect && onPostSelect(post)}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="h-32 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Featured Image</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-pink-600 uppercase tracking-wide">
                      {post.category.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Posts */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                onClick={() => onPostSelect && onPostSelect(post)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-pink-600 uppercase tracking-wide">
                      {post.category.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(post.publishDate).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-800 mb-2 hover:text-pink-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">By {post.author}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No articles found matching your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="mt-2 text-pink-600 hover:text-pink-700 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;