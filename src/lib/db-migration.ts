import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Production environment detected, running migrations...');

      // Import and run Prisma migrations
      const { execSync } = require('child_process');

      try {
        // Deploy migrations
        execSync('npx prisma migrate deploy', {
          stdio: 'inherit',
          env: { ...process.env },
        });
        console.log('Database migrations completed successfully');
      } catch (error) {
        console.error('Error running migrations:', error);
        // Don't throw error, just log it
      }
    }
  } catch (error) {
    console.error('Error in migration handler:', error);
    // Don't throw error, just log it
  }
}

// Run migrations when this module is imported
if (process.env.NODE_ENV === 'production') {
  runMigrations().catch(console.error);
}
