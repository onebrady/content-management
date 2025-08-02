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
        // Deploy migrations with timeout and retry logic
        const maxRetries = 3;
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Migration attempt ${attempt}/${maxRetries}...`);

            // Set a longer timeout for the migration command
            execSync('npx prisma migrate deploy', {
              stdio: 'inherit',
              env: { ...process.env },
              timeout: 30000, // 30 seconds timeout
            });

            console.log('Database migrations completed successfully');
            return; // Success, exit the function
          } catch (error) {
            lastError = error;
            console.error(`Migration attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
              console.log(`Retrying in 5 seconds...`);
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          }
        }

        // If we get here, all attempts failed
        console.error('All migration attempts failed:', lastError);
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
