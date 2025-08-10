import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { Project } from '@/types/database';
import {
  createSuccessResponse,
  handleApiError,
} from '@/lib/utils/error-handler';

function normalizeStatusId(input?: string): string | undefined {
  if (!input) return input;
  const s = input.toLowerCase().replace(/[_\s]+/g, '-');
  const allowed = new Set(['planning', 'in-progress', 'review', 'completed']);
  if (allowed.has(s)) return s;
  if (s.includes('progress')) return 'in-progress';
  if (s.includes('review')) return 'review';
  if (s.includes('complete')) return 'completed';
  // Allow custom statuses by returning the normalized slug
  return s;
}

export async function GET(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        color: true,
        archived: true,
        status: true, // Include the new status field
        statusOrder: true,
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
                completed: true,
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
        // Prisma Project model does not expose cards on ProjectCountOutputType
        // Keep only valid counters
        _count: {
          select: {
            lists: true,
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
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    let {
      status,
      statusOrder,
      archived,
      destIndex,
      destStatus,
      ...updateData
    } = body || {};
    status = normalizeStatusId(status);
    const normalizedDestStatus = normalizeStatusId(destStatus);

    // Fetch existing to compare status and derive owner for ordering
    const existing = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let nextStatusOrder: number | undefined = statusOrder;
    const statusIntent = normalizedDestStatus ?? status ?? existing.status;
    const statusChanged =
      typeof statusIntent !== 'undefined' && statusIntent !== existing.status;

    // If server is told where to insert (destIndex) or status changes without a provided statusOrder,
    // compute authoritative order using neighbors
    if (
      typeof destIndex === 'number' ||
      (statusChanged &&
        (typeof statusOrder === 'undefined' || statusOrder === null))
    ) {
      const targetStatus = normalizedDestStatus ?? status ?? existing.status;
      // Pull minimal fields sorted by statusOrder asc
      const projectsInTarget = await prisma.project.findMany({
        where: { ownerId: existing.ownerId, status: targetStatus as string },
        orderBy: { statusOrder: 'asc' },
        select: { id: true, statusOrder: true },
      });

      const { computeNextStatusOrder } = await import('@/lib/projects/order');
      const indexForInsert =
        typeof destIndex === 'number' ? destIndex : projectsInTarget.length;
      nextStatusOrder = computeNextStatusOrder(
        projectsInTarget as any,
        indexForInsert
      );
      status = targetStatus;
    }

    const updatePayload: any = { ...updateData };
    if (typeof status !== 'undefined') updatePayload.status = status;
    if (typeof nextStatusOrder !== 'undefined')
      updatePayload.statusOrder = nextStatusOrder;
    if (typeof archived !== 'undefined') updatePayload.archived = archived;

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('[Projects PATCH] input', {
        id,
        status,
        destStatus,
        destIndex,
      });
      // eslint-disable-next-line no-console
      console.info('[Projects PATCH] computed', {
        targetStatus: status,
        nextStatusOrder,
      });
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
        statusOrder: true,
        createdAt: true,
        updatedAt: true,
        background: true,
        visibility: true,
        starred: true,
        template: true,
        ownerId: true,
      },
    });

    return createSuccessResponse(project, 'Project updated');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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
