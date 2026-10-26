import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env.js';

// Configure public DNS resolvers to prevent Windows SRV lookup failures (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Use system default if setServers is unavailable
}

let mongodInstance = null;

export const connectDB = async () => {
  const sanitizedUri = (ENV.MONGODB_URI || '').replace(/:([^:@]+)@/, ':****@');
  const isLocal = (ENV.MONGODB_URI || '').includes('localhost') || (ENV.MONGODB_URI || '').includes('127.0.0.1');
  const timeoutMs = isLocal ? 2000 : 10000;

  try {
    // Attempt connecting to the configured MongoDB URI (2s for local fallback, 10s for Atlas)
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: timeoutMs,
    });
    console.log(`[Database] Connected successfully to MongoDB at: ${sanitizedUri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to external MongoDB at ${sanitizedUri} (${err.message}).`);
    try {
      console.log('[Database] Initializing embedded in-memory MongoDB Server fallback...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB Server at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to connect to MongoDB and in-memory fallback was unavailable:', memErr.message);
      console.error('[Database] Please verify your MONGODB_URI in Render environment variables and ensure MongoDB Atlas Network Access is set to allow 0.0.0.0/0.');
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('[Database] Disconnected from MongoDB');
  } catch (err) {
    console.error('[Database] Error disconnecting:', err);
  }
};
