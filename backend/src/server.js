import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { populateSeedData } from './scripts/seed.js';

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

initSocket(io);

// Auto-seed Admin if not already present
const ensureAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: ENV.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        name: ENV.ADMIN_NAME,
        email: ENV.ADMIN_EMAIL,
        password: ENV.ADMIN_PASSWORD,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        walletBalance: 10000,
        status: 'active',
      });
      console.log(`[Admin] Default administrator created: ${ENV.ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('[Admin] Error ensuring default admin user:', err);
  }
};

// Auto-seed demo data when running with in-memory DB (no categories = fresh start)
const ensureDemoData = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('[Seed] Empty database detected. Auto-seeding demo data...');
      await populateSeedData();
      console.log('[Seed] Demo data seeded successfully.');
    }
  } catch (err) {
    console.error('[Seed] Auto-seed error:', err);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await ensureAdminUser();
    await ensureDemoData();

    server.listen(ENV.PORT, () => {
      console.log(`=======================================================`);
      console.log(` Freelance Service Marketplace Backend Running!`);
      console.log(` Port: ${ENV.PORT}`);
      console.log(` Environment: ${ENV.NODE_ENV}`);
      console.log(` Client URL: ${ENV.CLIENT_URL}`);
      console.log(` API Base: http://localhost:${ENV.PORT}/api`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully terminating server...`);
  server.close(async () => {
    await disconnectDB();
    console.log('Server and database closed. Bye!');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();

