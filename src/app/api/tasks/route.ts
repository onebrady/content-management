import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import { createTaskSchema } from '@/lib/validation/project-schemas';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';

/**
 * Deprecation helper for tasks endpoints
 */
function createTaskDeprecationResponse(message: string) {
  return NextResponse.json(
    {
      error: 'API Endpoint Deprecated',
      message: `This endpoint is deprecated. ${message}`,
      deprecatedAt: '2025-01-08',
      migration: {
        recommendation: 'Please use the new card-based API endpoints',
        documentation: '/docs/api/migration-guide',
        newEndpoints: {
          'GET /api/tasks': 'GET /api/projects/[id]/board',
          'POST /api/tasks': 'POST /api/lists/[listId]/cards',
          'GET /api/tasks/[id]': 'GET /api/cards/[cardId]',
          'PATCH /api/tasks/[id]': 'PATCH /api/cards/[cardId]',
        },
      },
    },
    {
      status: 410, // Gone
      headers: {
        'X-Deprecated-Endpoint': 'true',
        'X-Migration-Date': '2025-01-08',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  // Return deprecation warning
  return createTaskDeprecationResponse(
    'Use POST /api/lists/[listId]/cards to create new cards in project lists.'
  );
}

export async function GET(req: NextRequest) {
  // Return deprecation warning
  return createTaskDeprecationResponse(
    'Use GET /api/projects/[id]/board to get project lists and cards.'
  );
}
