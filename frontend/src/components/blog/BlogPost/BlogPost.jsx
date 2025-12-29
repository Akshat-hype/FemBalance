import React from 'react';

const BlogPost = ({ post, onBack }) => {
  if (!post) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Post not found.</p>
      </div>
    );
  }

  // Mock full content - in real app, this would be fetched from API
  const fullContent = `
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    
    <h3>Understanding the Basics</h3>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    
    <blockquote>
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
    </blockquote>
    
    <h3>Key Points to Remember</h3>
    <ul>
      <li>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit</li>
      <li>Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt</li>
      <li>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet</li>
      <li>Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt</li>
    </ul>
    
    <h3>Practical Applications</h3>
    <p>Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>
    
    <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
    
    <h3>Conclusion</h3>
    <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
  `;

  const relatedPosts = [
    {
      id: 101,
      title: 'Related Article: Managing Hormonal Changes',
      category: 'menstrual-health',
      readTime: '5 min read'
    },
    {
      id: 102,
      title: 'Understanding Insulin Resistance in PCOS',
      category: 'pcos',
      readTime: '7 min read'
    },
    {
      id: 103,
      title: 'Nutrition Tips for Better Periods',
      category: 'nutrition',
      readTime: '6 min read'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-pink-600 hover:text-pink-700 mb-4 text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to articles
        </button>

        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-pink-600 uppercase tracking-wide">
              {post.category.replace('-', ' ')}
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{post.readTime}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {new Date(post.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 font-semibold text-sm">
                  {post.author.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{post.author}</p>
                <p className="text-sm text-gray-500">Health & Wellness Expert</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image Placeholder */}
        <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Article Featured Image</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose prose-lg max-w-none">
          <div className="text-lg text-gray-600 mb-6 font-medium leading-relaxed">
            {post.excerpt}
          </div>
          
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: fullContent }}
            style={{
              lineHeight: '1.8',
            }}
          />
        </div>

        {/* Tags */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 font-semibold text-lg">
                {post.author.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">{post.author}</h4>
              <p className="text-gray-600 text-sm mb-2">
                {post.author} is a certified health and wellness expert with over 10 years of experience 
                in women's health. She specializes in menstrual health, PCOS management, and holistic wellness approaches.
              </p>
              <div className="flex space-x-3">
                <button className="text-pink-600 hover:text-pink-700 text-sm">Follow</button>
                <button className="text-gray-500 hover:text-gray-700 text-sm">View Profile</button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Related Articles</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedPosts.map(relatedPost => (
              <div key={relatedPost.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <span className="text-xs font-medium text-pink-600 uppercase tracking-wide">
                  {relatedPost.category.replace('-', ' ')}
                </span>
                <h5 className="font-medium text-gray-800 mt-2 mb-1 line-clamp-2">
                  {relatedPost.title}
                </h5>
                <span className="text-xs text-gray-500">{relatedPost.readTime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 text-center">
            <h4 className="font-semibold text-gray-800 mb-2">Stay Updated</h4>
            <p className="text-gray-600 text-sm mb-4">
              Get the latest articles on women's health and wellness delivered to your inbox.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button className="bg-pink-600 text-white px-4 py-2 rounded-r-md hover:bg-pink-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;