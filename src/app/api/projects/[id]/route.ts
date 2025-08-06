import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { Project } from '@/types/database';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                title: true,
                position: true,
                priority: true,
                completed: true,
                assigneeId: true,
                dueDate: true,
                description: true,
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
