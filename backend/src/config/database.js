const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fembalance';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('Mongoose connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing mongoose connection:', error);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: states[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
};

// Create database indexes for better performance
const createIndexes = async () => {
  try {
    logger.info('Creating database indexes...');

    // User indexes
    await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.collection('users').createIndex({ 'profile.dateOfBirth': 1 });
    await mongoose.connection.collection('users').createIndex({ createdAt: -1 });

    // Cycle indexes
    await mongoose.connection.collection('cycles').createIndex({ userId: 1, startDate: -1 });
    await mongoose.connection.collection('cycles').createIndex({ userId: 1, endDate: -1 });
    await mongoose.connection.collection('cycles').createIndex({ userId: 1, createdAt: -1 });

    // Symptom indexes
    await mongoose.connection.collection('symptoms').createIndex({ userId: 1, date: -1 });
    await mongoose.connection.collection('symptoms').createIndex({ userId: 1, createdAt: -1 });

    // PCOS Risk indexes
    await mongoose.connection.collection('pcosrisks').createIndex({ userId: 1, assessmentDate: -1 });
    await mongoose.connection.collection('pcosrisks').createIndex({ riskLevel: 1 });

    // Blog indexes
    await mongoose.connection.collection('blogs').createIndex({ published: 1, publishDate: -1 });
    await mongoose.connection.collection('blogs').createIndex({ category: 1, published: 1 });
    await mongoose.connection.collection('blogs').createIndex({ featured: 1, published: 1 });
    await mongoose.connection.collection('blogs').createIndex({ slug: 1 }, { unique: true });
    await mongoose.connection.collection('blogs').createIndex({ 
      title: 'text', 
      excerpt: 'text', 
      content: 'text' 
    });

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create database indexes:', error);
    // Don't throw error as this is not critical for app startup
  }
};

// Cleanup database connections
const cleanup = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
};

module.exports = {
  connectDatabase,
  checkDatabaseHealth,
  getDatabaseStats,
  createIndexes,
  cleanup
};