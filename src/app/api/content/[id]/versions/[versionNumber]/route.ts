import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { getContentVersion, restoreContentVersion } from '@/lib/versioning';

// GET /api/content/[id]/versions/[versionNumber] - Get a specific version of content
export const GET = createProtectedHandler(async (req) => {
  const pathParts = req.nextUrl.pathname.split('/');
  const contentId = pathParts[3];
  const versionNumberStr = pathParts[5];

  if (!contentId || !versionNumberStr) {
    return NextResponse.json(
      { error: 'Content ID and version number are required' },
      { status: 400 }
    );
  }

  const versionNumber = parseInt(versionNumberStr, 10);
  if (isNaN(versionNumber)) {
    return NextResponse.json(
      { error: 'Version number must be a valid integer' },
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

    // Get the specific version
    const version = await getContentVersion(contentId, versionNumber);

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error fetching content version:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content version' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// POST /api/content/[id]/versions/[versionNumber]/restore - Restore content to a specific version
export const POST = createProtectedHandler(async (req) => {
  const pathParts = req.nextUrl.pathname.split('/');
  const contentId = pathParts[3];
  const versionNumberStr = pathParts[5];

  if (!contentId || !versionNumberStr) {
    return NextResponse.json(
      { error: 'Content ID and version number are required' },
      { status: 400 }
    );
  }

  const versionNumber = parseInt(versionNumberStr, 10);
  if (isNaN(versionNumber)) {
    return NextResponse.json(
      { error: 'Version number must be a valid integer' },
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

    // Check if user is author or has edit permissions
    if (
      content.authorId !== req.user!.id &&
      !req.user!.role.includes('ADMIN')
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to restore this content' },
        { status: 403 }
      );
    }

    // Restore the content to the specified version
    const restoredContent = await restoreContentVersion(
      contentId,
      versionNumber,
      req.user!.id
    );

    return NextResponse.json(restoredContent);
  } catch (error) {
    console.error('Error restoring content version:', error);
    return NextResponse.json(
      { error: 'Failed to restore content version' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_EDIT));
