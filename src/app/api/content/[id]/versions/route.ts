import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { createContentVersion, getContentVersions } from '@/lib/versioning';

// GET /api/content/[id]/versions - Get all versions of a content
export const GET = createProtectedHandler(async (req) => {
  const contentId = req.nextUrl.pathname.split('/')[3]; // Extract content ID from URL

  if (!contentId) {
    return NextResponse.json(
      { error: 'Content ID is required' },
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

    // Get all versions
    const versions = await getContentVersions(contentId);

    return NextResponse.json({ versions, currentVersion: content.version });
  } catch (error) {
    console.error('Error fetching content versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content versions' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// POST /api/content/[id]/versions - Create a new version of content
export const POST = createProtectedHandler(async (req) => {
  const contentId = req.nextUrl.pathname.split('/')[3]; // Extract content ID from URL

  if (!contentId) {
    return NextResponse.json(
      { error: 'Content ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { changeDescription } = body;

    // Create a new version
    const newVersion = await createContentVersion(
      contentId,
      req.user!.id,
      changeDescription
    );

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error('Error creating content version:', error);
    return NextResponse.json(
      { error: 'Failed to create content version' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_EDIT));
