import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/freelance_marketplace',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_production_12345!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@marketplace.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin123!Secure',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Platform Administrator'
};
