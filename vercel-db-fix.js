// This script is for fixing the database schema in production
// It will apply any pending migrations to the production database

const { execSync } = require('child_process');

console.log('🔧 Running database migration fix for Vercel...');

try {
  // Run the migration deploy command
  console.log('📦 Applying pending migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('✅ Migrations applied successfully!');

  // Verify the database schema
  console.log('🔍 Verifying database schema...');
  execSync('npx prisma db pull --print', { stdio: 'inherit' });

  console.log('🎉 Database schema is now up to date!');
} catch (error) {
  console.error('❌ Error applying migrations:', error);
  process.exit(1);
}
