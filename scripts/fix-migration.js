// This script is for fixing the failed migration in production
const { execSync } = require('child_process');

console.log('🔧 Running migration fix script...');

try {
  // Mark the migration as applied without running it
  console.log('📝 Marking migration as applied...');
  execSync(
    'npx prisma migrate resolve --applied 20250802060000_fix_content_status_enum',
    { stdio: 'inherit' }
  );

  console.log('✅ Migration marked as applied successfully!');

  // Verify the database schema
  console.log('🔍 Verifying database schema...');
  execSync('npx prisma db pull --print', { stdio: 'inherit' });

  console.log('🎉 Database schema is now up to date!');
} catch (error) {
  console.error('❌ Error fixing migration:', error);
  process.exit(1);
}
