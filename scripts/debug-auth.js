#!/usr/bin/env node

/**
 * Authentication Debug Script
 * 
 * This script helps diagnose authentication issues by checking:
 * - Environment variables
 * - Database connection
 * - Azure AD configuration
 * - NextAuth configuration
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

console.log('🔍 Authentication Debug Script\n');

// Check environment variables
console.log('1. Checking Environment Variables...');
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'AZURE_AD_CLIENT_ID',
  'AZURE_AD_CLIENT_SECRET',
  'AZURE_AD_TENANT_ID',
  'DATABASE_URL'
];

let envIssues = 0;
requiredEnvVars.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Missing: ${key}`);
    envIssues++;
  } else {
    console.log(`✅ ${key}: ${value.substring(0, 10)}...`);
  }
});

if (envIssues > 0) {
  console.log(`\n⚠️  Found ${envIssues} missing environment variables`);
} else {
  console.log('\n✅ All required environment variables are set');
}

// Check NEXTAUTH_URL format
console.log('\n2. Checking NEXTAUTH_URL format...');
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  try {
    const url = new URL(nextAuthUrl);
    console.log(`✅ NEXTAUTH_URL is valid: ${url.toString()}`);
    
    if (url.protocol === 'https:' || url.hostname === 'localhost') {
      console.log('✅ Protocol is correct');
    } else {
      console.log('⚠️  Warning: Using HTTP in production may cause issues');
    }
  } catch (error) {
    console.error('❌ NEXTAUTH_URL is not a valid URL:', nextAuthUrl);
  }
}

// Check NEXTAUTH_SECRET strength
console.log('\n3. Checking NEXTAUTH_SECRET...');
const secret = process.env.NEXTAUTH_SECRET;
if (secret) {
  if (secret.length >= 32) {
    console.log('✅ NEXTAUTH_SECRET is sufficiently long');
  } else {
    console.log('⚠️  NEXTAUTH_SECRET might be too short');
  }
} else {
  console.log('❌ NEXTAUTH_SECRET is not set');
}

// Test database connection
console.log('\n4. Testing Database Connection...');
async function testDatabase() {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible (${userCount} users)`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Test Azure AD configuration
console.log('\n5. Checking Azure AD Configuration...');
const azureConfig = {
  clientId: process.env.AZURE_AD_CLIENT_ID,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
  tenantId: process.env.AZURE_AD_TENANT_ID
};

if (azureConfig.clientId && azureConfig.clientSecret && azureConfig.tenantId) {
  console.log('✅ Azure AD credentials are set');
  
  // Check if they look like valid GUIDs
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (guidRegex.test(azureConfig.clientId)) {
    console.log('✅ Client ID format looks correct');
  } else {
    console.log('⚠️  Client ID format might be incorrect');
  }
  
  if (guidRegex.test(azureConfig.tenantId)) {
    console.log('✅ Tenant ID format looks correct');
  } else {
    console.log('⚠️  Tenant ID format might be incorrect');
  }
} else {
  console.log('❌ Azure AD credentials are missing');
}

// Check for common redirect loop issues
console.log('\n6. Checking for Redirect Loop Issues...');
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  const expectedCallbackUrl = `${nextAuthUrl}/api/auth/callback/azure-ad`;
  console.log(`Expected Azure AD redirect URI: ${expectedCallbackUrl}`);
  console.log('⚠️  Make sure this exact URL is configured in Azure AD');
}

// Generate recommendations
console.log('\n7. Recommendations:');
console.log('- Clear browser cache and cookies');
console.log('- Test in incognito mode');
console.log('- Verify Azure AD redirect URI matches exactly');
console.log('- Check Vercel function logs for errors');
console.log('- Ensure HTTPS is used in production');

// Run database test
testDatabase().then(() => {
  console.log('\n🎯 Debug script completed!');
  console.log('\nIf issues persist:');
  console.log('1. Check the troubleshooting guide: docs/auth-troubleshooting.md');
  console.log('2. Review browser console for specific errors');
  console.log('3. Monitor Vercel function logs');
  console.log('4. Test with different browsers');
}); 