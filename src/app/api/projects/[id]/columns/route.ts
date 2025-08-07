import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withProjectAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';
import { createDeprecationResponse } from './deprecation';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return deprecation warning and redirect to new endpoint
  return createDeprecationResponse(
    'Use POST /api/projects/[id]/lists to create new lists.',
    `/api/projects/${params.id}/lists`
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return deprecation warning and redirect to new endpoint
  return createDeprecationResponse(
    'Use GET /api/projects/[id]/board to get project lists and cards.',
    `/api/projects/${params.id}/board`
  );
}
