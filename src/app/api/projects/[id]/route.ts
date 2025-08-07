import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { Project } from '@/types/database';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        color: true,
        archived: true,
        status: true, // Include the new status field
        createdAt: true,
        updatedAt: true,
        background: true,
        visibility: true,
        starred: true,
        template: true,
        ownerId: true,
        lists: {
          where: { archived: false },
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { archived: false },
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                position: true,
                dueDate: true,
                cover: true,
                archived: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            _count: {
              select: {
                cards: true,
              },
            },
          },
        },
        members: {
          select: {
            user: true,
            role: true,
          },
        },
        labels: true,
        _count: {
          select: {
            lists: true,
            cards: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project as Project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, archived, ...updateData } = body;

    const updatePayload: any = { ...updateData };

    // Handle status update
    if (status !== undefined) {
      updatePayload.status = status;
    }

    // Handle archived update
    if (archived !== undefined) {
      updatePayload.archived = archived;
    }

    const project = await prisma.project.update({
      where: { id },
      data: updatePayload,
      select: {
        id: true,
        title: true,
        description: true,
        color: true,
        archived: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        background: true,
        visibility: true,
        starred: true,
        template: true,
        ownerId: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete the project (cascade will handle related data)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Project "${project.title}" deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
