import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withRateLimit } from '@/lib/middleware/auth';
import {
  handleApiError,
  createSuccessResponse,
  throwError,
} from '@/lib/utils/error-handler';
import { z } from 'zod';

// Validation schema for creating checklist items
const createItemSchema = z.object({
  text: z.string().min(1, 'Text is required').max(500, 'Text too long'),
  position: z.number().min(0).optional(),
  assigneeId: z.string().optional(),
});

// Validation schema for reordering items
const reorderItemsSchema = z.object({
  itemOrders: z.array(
    z.object({
      id: z.string(),
      position: z.number().min(0),
    })
  ),
});

/**
 * POST /api/checklists/[checklistId]/items
 * Create a new checklist item
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { checklistId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 30, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const auth = await withAuth(req);
    const checklistId = params.checklistId;

    // Get the checklist and check permissions
    const checklist = await prisma.projectChecklist.findUnique({
      where: { id: checklistId },
      include: {
        card: {
          include: {
            list: {
              include: {
                project: {
                  select: { ownerId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      );
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: checklist.card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner, member, or global ADMIN
    if (
      !projectMember &&
      checklist.card.list.project.ownerId !== auth.user.id &&
      (auth as any)?.user?.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = createItemSchema.parse(body);

    // Get next position if not provided
    let position = validatedData.position;
    if (position === undefined) {
      const lastItem = await prisma.projectChecklistItem.findFirst({
        where: { checklistId },
        orderBy: { position: 'desc' },
      });
      position = lastItem ? lastItem.position + 1000 : 1000;
    }

    // Validate assignee if provided
    if (validatedData.assigneeId) {
      const assignee = await prisma.projectMember.findFirst({
        where: {
          projectId: checklist.card.list.projectId,
          userId: validatedData.assigneeId,
        },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee is not a member of this project' },
          { status: 400 }
        );
      }
    }

    // Create the checklist item
    const newItem = await prisma.projectChecklistItem.create({
      data: {
        text: validatedData.text,
        position,
        checklistId,
        assigneeId: validatedData.assigneeId || null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return createSuccessResponse(newItem, 201);
  } catch (error) {
    console.error('Create Checklist Item API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return handleApiError(error);
  }
}

/**
 * PATCH /api/checklists/[checklistId]/items/reorder
 * Reorder checklist items
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { checklistId: string } }
) {
  try {
    // Rate limiting
    if (!withRateLimit(req, 20, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const auth = await withAuth(req);
    const checklistId = params.checklistId;

    // Get the checklist and check permissions
    const checklist = await prisma.projectChecklist.findUnique({
      where: { id: checklistId },
      include: {
        card: {
          include: {
            list: {
              include: {
                project: {
                  select: { ownerId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      );
    }

    // Check if user has write access to this project
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId: checklist.card.list.projectId,
        userId: auth.user.id,
      },
    });

    // Allow access if user is owner, member, or global ADMIN
    if (
      !projectMember &&
      checklist.card.list.project.ownerId !== auth.user.id &&
      (auth as any)?.user?.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = reorderItemsSchema.parse(body);

    // Verify all items belong to this checklist
    const itemIds = validatedData.itemOrders.map((item) => item.id);
    const existingItems = await prisma.projectChecklistItem.findMany({
      where: {
        id: { in: itemIds },
        checklistId,
      },
    });

    if (existingItems.length !== itemIds.length) {
      return NextResponse.json(
        { error: 'Some items do not belong to this checklist' },
        { status: 400 }
      );
    }

    // Update positions in transaction
    await prisma.$transaction(async (tx) => {
      for (const item of validatedData.itemOrders) {
        await tx.projectChecklistItem.update({
          where: { id: item.id },
          data: { position: item.position },
        });
      }
    });

    // Get updated items
    const updatedItems = await prisma.projectChecklistItem.findMany({
      where: { checklistId },
      orderBy: { position: 'asc' },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return createSuccessResponse(updatedItems);
  } catch (error) {
    console.error('Reorder Checklist Items API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return handleApiError(error);
  }
}
