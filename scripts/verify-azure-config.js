#!/usr/bin/env node

/**
 * Azure AD Configuration Verification Script
 *
 * This script helps verify that your Azure AD configuration is correct
 * and all required environment variables are set.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Azure AD Configuration Verification\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found');
  console.log('   Create a .env.local file with your environment variables');
  process.exit(1);
}

// Read environment variables
require('dotenv').config({ path: envPath });

const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'AZURE_AD_CLIENT_ID',
  'AZURE_AD_CLIENT_SECRET',
  'AZURE_AD_TENANT_ID',
  'DATABASE_URL',
];

const optionalVars = [
  'UPLOADTHING_SECRET',
  'UPLOADTHING_APP_ID',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

console.log('📋 Environment Variables Check:');
console.log('================================');

let allRequiredPresent = true;

// Check required variables
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 Optional Variables Check:');
console.log('=============================');

// Check optional variables
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  }
});

console.log('\n🔧 Configuration Validation:');
console.log('============================');

// Validate NEXTAUTH_URL
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  if (nextAuthUrl.includes('localhost')) {
    console.log('✅ NEXTAUTH_URL: Local development configuration');
  } else if (nextAuthUrl.includes('content.westerntruck.com')) {
    console.log('✅ NEXTAUTH_URL: Production configuration');
  } else {
    console.log('⚠️  NEXTAUTH_URL: Unknown domain, verify this is correct');
  }
}

// Validate Azure AD variables
const clientId = process.env.AZURE_AD_CLIENT_ID;
const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
const tenantId = process.env.AZURE_AD_TENANT_ID;

if (clientId && clientSecret && tenantId) {
  console.log('✅ Azure AD credentials: All present');

  // Validate client ID format (should be a GUID)
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (guidRegex.test(clientId)) {
    console.log('✅ Azure AD Client ID: Valid format');
  } else {
    console.log('⚠️  Azure AD Client ID: Invalid format (should be a GUID)');
  }

  if (guidRegex.test(tenantId)) {
    console.log('✅ Azure AD Tenant ID: Valid format');
  } else {
    console.log('⚠️  Azure AD Tenant ID: Invalid format (should be a GUID)');
  }
} else {
  console.log('❌ Azure AD credentials: Missing required variables');
}

console.log('\n🌐 Azure AD Redirect URI Configuration:');
console.log('=======================================');

if (nextAuthUrl) {
  const baseUrl = nextAuthUrl.replace(/\/$/, ''); // Remove trailing slash
  const redirectUri = `${baseUrl}/api/auth/callback/azure-ad`;
  console.log(`📝 Add this redirect URI to your Azure AD app registration:`);
  console.log(`   ${redirectUri}`);

  if (baseUrl.includes('localhost')) {
    console.log('\n📝 For local development, also add:');
    console.log(`   http://localhost:3000/api/auth/callback/azure-ad`);
  }
}

console.log('\n📋 Next Steps:');
console.log('==============');

if (!allRequiredPresent) {
  console.log('❌ Fix missing environment variables before proceeding');
  process.exit(1);
}

console.log('✅ All required environment variables are present');
console.log(
  '📝 Verify your Azure AD app registration has the correct redirect URIs'
);
console.log('📝 Ensure your database is accessible');
console.log('📝 Test the authentication flow');

console.log('\n🔗 Useful Links:');
console.log('================');
console.log('• Azure Portal: https://portal.azure.com');
console.log('• NextAuth.js Docs: https://next-auth.js.org/');
console.log(
  '• Azure AD Provider Docs: https://next-auth.js.org/providers/azure-ad'
);

console.log('\n✨ Configuration verification complete!');
