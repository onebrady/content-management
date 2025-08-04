// Get application version from package.json
export function getAppVersion(): string {
  // In a Next.js app, we can access the version from package.json
  // This will be available at build time
  try {
    // For client-side, we'll use a fallback
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
    }
    // For server-side, we can read from package.json
    const packageJson = require('../../package.json');
    return packageJson.version || '1.0.0';
  } catch (error) {
    console.warn('Could not read version from package.json:', error);
    return '1.0.0';
  }
}

// Format version for display
export function formatVersion(version: string): string {
  return `v${version}`;
} 