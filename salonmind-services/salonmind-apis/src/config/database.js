const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    logger.info('Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    logger.success(`MongoDB Connected: ${conn.connection.host}`);
    logger.debug(`Database: ${conn.connection.name}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
