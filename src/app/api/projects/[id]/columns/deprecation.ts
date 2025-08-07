import { NextRequest, NextResponse } from 'next/server';

/**
 * Deprecation handler for old column endpoints
 * Redirects to new list endpoints with appropriate warnings
 */
export function createDeprecationResponse(
  message: string,
  redirectUrl?: string
) {
  const response = {
    error: 'API Endpoint Deprecated',
    message: `This endpoint is deprecated. ${message}`,
    deprecatedAt: '2025-01-08',
    migration: {
      recommendation: 'Please use the new board-based API endpoints',
      documentation: '/docs/api/migration-guide',
      newEndpoints: {
        'GET /api/projects/[id]/columns': 'GET /api/projects/[id]/board',
        'POST /api/projects/[id]/columns': 'POST /api/projects/[id]/lists',
        'GET /api/tasks': 'GET /api/projects/[id]/board',
        'POST /api/tasks': 'POST /api/lists/[listId]/cards',
      },
    },
  };

  if (redirectUrl) {
    return NextResponse.json(response, {
      status: 301,
      headers: {
        Location: redirectUrl,
        'X-Deprecated-Endpoint': 'true',
        'X-Migration-Date': '2025-01-08',
      },
    });
  }

  return NextResponse.json(response, {
    status: 410, // Gone
    headers: {
      'X-Deprecated-Endpoint': 'true',
      'X-Migration-Date': '2025-01-08',
    },
  });
}
