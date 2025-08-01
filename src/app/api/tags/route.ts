import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// GET /api/tags - Get all tags
export const GET = createProtectedHandler(async (req) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_VIEW));

// POST /api/tags - Create a new tag
export const POST = createProtectedHandler(async (req) => {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingTag) {
      return NextResponse.json(existingTag);
    }

    // Create new tag
    const newTag = await prisma.tag.create({
      data: {
        name,
      },
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.CONTENT_CREATE));
