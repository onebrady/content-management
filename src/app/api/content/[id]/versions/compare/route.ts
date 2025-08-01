import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { compareContentVersions } from '@/lib/versioning';

// GET /api/content/[id]/versions/compare?v1=1&v2=2 - Compare two versions of content
export const GET = createProtectedHandler(async (req) => {
  const contentId = req.nextUrl.pathname.split('/')[3]; // Extract content ID from URL
  const { searchParams } = new URL(req.url);
  const v1Str = searchParams.get('v1');
  const v2Str = searchParams.get('v2');

  if (!contentId) {
    return NextResponse.json(
      { error: 'Content ID is required' },
      { status: 400 }
    );
  }

  if (!v1Str || !v2Str) {
    return NextResponse.json(
      { error: 'Both version numbers (v1 and v2) are required' },
      { status: 400 }
    );
  }

  const v1 = parseInt(v1Str, 10);
  const v2 = parseInt(v2Str, 10);

  if (isNaN(v1) || isNaN(v2)) {
    return NextResponse.json(
      { error: 'Version numbers must be valid integers' },
      { status: 400 }
    );
  }

  try {
    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Compare the versions
    const comparison = await compareContentVersions(contentId, v1, v2);

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error comparing content versions:', error);
    return NextResponse.json(
      { error: 'Failed to compare content versions' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));
