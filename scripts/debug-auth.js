#!/usr/bin/env node

/**
 * Authentication Debug Script
 *
 * This script helps diagnose OAuthCallback errors by checking:
 * - Environment variables
 * - Database connection
 * - Azure AD configuration
 * - NextAuth configuration
 * - Redirect URI configuration
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
  'DATABASE_URL',
];

let envIssues = 0;
requiredEnvVars.forEach((key) => {
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
  tenantId: process.env.AZURE_AD_TENANT_ID,
};

if (azureConfig.clientId && azureConfig.clientSecret && azureConfig.tenantId) {
  console.log('✅ Azure AD credentials are set');

  // Check if they look like valid GUIDs
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// Check for common OAuth callback issues
console.log('\n6. Checking for OAuth Callback Issues...');
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  const expectedCallbackUrl = `${nextAuthUrl}/api/auth/callback/azure-ad`;
  console.log(`Expected Azure AD redirect URI: ${expectedCallbackUrl}`);
  console.log('⚠️  Make sure this exact URL is configured in Azure AD');

  // Check for common issues
  if (expectedCallbackUrl.endsWith('/')) {
    console.log('❌ ERROR: Callback URL should not end with a trailing slash');
  }

  if (!expectedCallbackUrl.includes('/api/auth/callback/')) {
    console.log('❌ ERROR: Callback URL format is incorrect');
  }

  if (
    !expectedCallbackUrl.startsWith('https://') &&
    !expectedCallbackUrl.startsWith('http://localhost')
  ) {
    console.log(
      '❌ ERROR: Callback URL should use HTTPS (except for localhost)'
    );
  }

  // Check for domain mismatch
  const urlObj = new URL(nextAuthUrl);
  const domain = urlObj.hostname;
  console.log(`Domain: ${domain}`);

  if (
    process.env.NODE_ENV === 'production' &&
    domain !== 'content.westerntruck.com'
  ) {
    console.log(
      `❌ WARNING: Domain mismatch - expected content.westerntruck.com, got ${domain}`
    );
  }
}

// Check for client secret issues
console.log('\n7. Checking Client Secret...');
const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
if (clientSecret) {
  console.log('✅ Client secret is set');

  // Check if it looks like a valid secret (basic check)
  if (clientSecret.length < 10) {
    console.log('❌ WARNING: Client secret looks too short');
  }
} else {
  console.log('❌ ERROR: Client secret is not set');
}

// Generate recommendations for OAuthCallback error
console.log('\n8. Recommendations for OAuthCallback Error:');
console.log('- Verify client secret is valid and not expired');
console.log('- Check Azure AD app registration for proper redirect URI');
console.log('- Enable ID tokens and Access tokens in Implicit grant');
console.log('- Grant admin consent for required permissions');
console.log('- Clear browser cache and cookies');
console.log('- Test in incognito mode');
console.log('- Check Vercel function logs for detailed errors');
console.log('- Ensure HTTPS is used in production');

// Run database test
// Test NextAuth callback URL
console.log('\n9. Testing NextAuth Callback URL...');
const https = require('https');
const http = require('http');

function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol
      .get(url, (res) => {
        console.log(`✅ URL ${url} is reachable (status: ${res.statusCode})`);
        resolve(true);
      })
      .on('error', (err) => {
        console.log(`❌ ERROR: URL ${url} is not reachable: ${err.message}`);
        resolve(false);
      });

    // Set timeout
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`❌ ERROR: URL ${url} timed out`);
      resolve(false);
    });
  });
}

// Run all tests
Promise.all([
  testDatabase(),
  nextAuthUrl
    ? testUrl(`${nextAuthUrl}/api/auth/callback/azure-ad`)
    : Promise.resolve(false),
]).then(() => {
  console.log('\n🎯 Debug script completed!');
  console.log('\nIf OAuthCallback error persists:');
  console.log(
    '1. Check the troubleshooting guide: docs/auth-troubleshooting.md'
  );
  console.log('2. Review browser console for specific errors');
  console.log('3. Monitor Vercel function logs');
  console.log('4. Verify client secret is valid and not expired');
  console.log('5. Test with different browsers');
});
