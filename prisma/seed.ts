import { PrismaClient, UserRole, ContentType, Priority, ProjectVisibility, ProjectActivityAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Skip seeding in production unless explicitly allowed
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.DISABLE_SEED_PRODUCTION === 'true'
  ) {
    console.log('⏭️ Skipping seed in production environment');
    return;
  }

  // Create test users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      department: 'IT',
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      email: 'moderator@example.com',
      name: 'Moderator User',
      role: UserRole.MODERATOR,
      department: 'Marketing',
    },
  });

  const contributor = await prisma.user.upsert({
    where: { email: 'contributor@example.com' },
    update: {},
    create: {
      email: 'contributor@example.com',
      name: 'Contributor User',
      role: UserRole.CONTRIBUTOR,
      department: 'Content',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      name: 'Viewer User',
      role: UserRole.VIEWER,
      department: 'Sales',
    },
  });

  const password = await bcrypt.hash('C&CREM&q5j&4fN', 10);
  await prisma.user.upsert({
    where: { email: 'onebrady@gmail.com' },
    update: { password, role: 'ADMIN' },
    create: {
      email: 'onebrady@gmail.com',
      name: 'Seeded Admin',
      password,
      role: 'ADMIN',
    },
  });

  // Create test tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'Technology' },
      update: {},
      create: { name: 'Technology' },
    }),
    prisma.tag.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: { name: 'Marketing' },
    }),
    prisma.tag.upsert({
      where: { name: 'Product' },
      update: {},
      create: { name: 'Product' },
    }),
  ]);

  // Create test content
  const content = await prisma.content.upsert({
    where: { slug: 'welcome-to-content-management-tool' },
    update: {}, // Don't update if it already exists
    create: {
      title: 'Welcome to Content Management Tool',
      slug: 'welcome-to-content-management-tool', // Added required slug field
      body: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is a sample content piece created during database seeding.',
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'You can edit this content using the rich text editor.',
              },
            ],
          },
        ],
      },
      type: ContentType.ARTICLE,
      priority: Priority.MEDIUM,
      authorId: contributor.id,
      assigneeId: moderator.id,
      tags: {
        connect: [{ name: 'Technology' }, { name: 'Product' }],
      },
      heroImage: null, // Added heroImage field with null value
    },
  });

  // Create test comments
  await prisma.comment.upsert({
    where: {
      id: 'seed-comment-1', // Using a predictable ID for upsert
    },
    update: {}, // Don't update if it already exists
    create: {
      id: 'seed-comment-1', // Using a predictable ID for upsert
      commentText: 'This is a great article!',
      contentId: content.id,
      userId: moderator.id,
    },
  });

  // Create test project with board structure
  const testProject = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      title: 'Client Website Redesign',
      description: 'Complete redesign of client website with modern UI/UX',
      color: 'blue',
      background: null,
      visibility: ProjectVisibility.PRIVATE,
      starred: true,
      template: false,
      ownerId: admin.id,
    },
  });

  // Create project lists (columns)
  const todoList = await prisma.projectList.upsert({
    where: { id: 'seed-list-1' },
    update: {},
    create: {
      id: 'seed-list-1',
      title: 'To Do',
      position: 0,
      projectId: testProject.id,
    },
  });

  const inProgressList = await prisma.projectList.upsert({
    where: { id: 'seed-list-2' },
    update: {},
    create: {
      id: 'seed-list-2',
      title: 'In Progress',
      position: 1,
      projectId: testProject.id,
    },
  });

  const reviewList = await prisma.projectList.upsert({
    where: { id: 'seed-list-3' },
    update: {},
    create: {
      id: 'seed-list-3',
      title: 'Client Review',
      position: 2,
      projectId: testProject.id,
    },
  });

  const doneList = await prisma.projectList.upsert({
    where: { id: 'seed-list-4' },
    update: {},
    create: {
      id: 'seed-list-4',
      title: 'Done',
      position: 3,
      projectId: testProject.id,
    },
  });

  // Create project cards
  const card1 = await prisma.projectCard.upsert({
    where: { id: 'seed-card-1' },
    update: {},
    create: {
      id: 'seed-card-1',
      title: 'Design Homepage Wireframes',
      description: 'Create wireframes for the new homepage design including hero section, navigation, and footer',
      position: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      listId: inProgressList.id,
      createdById: admin.id,
    },
  });

  const card2 = await prisma.projectCard.upsert({
    where: { id: 'seed-card-2' },
    update: {},
    create: {
      id: 'seed-card-2',
      title: 'Implement Responsive Navigation',
      description: 'Create mobile-first responsive navigation with hamburger menu for mobile devices',
      position: 0,
      listId: todoList.id,
      createdById: admin.id,
    },
  });

  const card3 = await prisma.projectCard.upsert({
    where: { id: 'seed-card-3' },
    update: {},
    create: {
      id: 'seed-card-3',
      title: 'Content Migration',
      description: 'Migrate all existing content from old website to new CMS structure',
      position: 1,
      listId: todoList.id,
      createdById: admin.id,
      contentId: content.id, // Link to the seeded content
    },
  });

  const card4 = await prisma.projectCard.upsert({
    where: { id: 'seed-card-4' },
    update: {},
    create: {
      id: 'seed-card-4',
      title: 'User Testing & Feedback',
      description: 'Conduct user testing sessions and gather client feedback on new design',
      position: 0,
      completed: true,
      listId: doneList.id,
      createdById: admin.id,
    },
  });

  // Create project labels
  const urgentLabel = await prisma.projectLabel.upsert({
    where: { id: 'seed-label-1' },
    update: {},
    create: {
      id: 'seed-label-1',
      name: 'Urgent',
      color: 'red',
      projectId: testProject.id,
    },
  });

  const designLabel = await prisma.projectLabel.upsert({
    where: { id: 'seed-label-2' },
    update: {},
    create: {
      id: 'seed-label-2',
      name: 'Design',
      color: 'purple',
      projectId: testProject.id,
    },
  });

  const developmentLabel = await prisma.projectLabel.upsert({
    where: { id: 'seed-label-3' },
    update: {},
    create: {
      id: 'seed-label-3',
      name: 'Development',
      color: 'blue',
      projectId: testProject.id,
    },
  });

  // Assign labels to cards
  await prisma.projectCardLabel.upsert({
    where: { cardId_labelId: { cardId: card1.id, labelId: designLabel.id } },
    update: {},
    create: {
      cardId: card1.id,
      labelId: designLabel.id,
    },
  });

  await prisma.projectCardLabel.upsert({
    where: { cardId_labelId: { cardId: card2.id, labelId: developmentLabel.id } },
    update: {},
    create: {
      cardId: card2.id,
      labelId: developmentLabel.id,
    },
  });

  await prisma.projectCardLabel.upsert({
    where: { cardId_labelId: { cardId: card2.id, labelId: urgentLabel.id } },
    update: {},
    create: {
      cardId: card2.id,
      labelId: urgentLabel.id,
    },
  });

  // Create checklist for the wireframe card
  const wireframeChecklist = await prisma.projectChecklist.upsert({
    where: { id: 'seed-checklist-1' },
    update: {},
    create: {
      id: 'seed-checklist-1',
      title: 'Design Tasks',
      position: 0,
      cardId: card1.id,
    },
  });

  // Create checklist items
  await prisma.projectChecklistItem.upsert({
    where: { id: 'seed-checklist-item-1' },
    update: {},
    create: {
      id: 'seed-checklist-item-1',
      text: 'Research competitor websites',
      position: 0,
      completed: true,
      checklistId: wireframeChecklist.id,
    },
  });

  await prisma.projectChecklistItem.upsert({
    where: { id: 'seed-checklist-item-2' },
    update: {},
    create: {
      id: 'seed-checklist-item-2',
      text: 'Create user persona',
      position: 1,
      completed: true,
      checklistId: wireframeChecklist.id,
    },
  });

  await prisma.projectChecklistItem.upsert({
    where: { id: 'seed-checklist-item-3' },
    update: {},
    create: {
      id: 'seed-checklist-item-3',
      text: 'Sketch initial wireframes',
      position: 2,
      completed: false,
      checklistId: wireframeChecklist.id,
      assigneeId: contributor.id,
    },
  });

  // Assign cards to users
  await prisma.projectCardAssignee.upsert({
    where: { cardId_userId: { cardId: card1.id, userId: contributor.id } },
    update: {},
    create: {
      cardId: card1.id,
      userId: contributor.id,
    },
  });

  await prisma.projectCardAssignee.upsert({
    where: { cardId_userId: { cardId: card2.id, userId: admin.id } },
    update: {},
    create: {
      cardId: card2.id,
      userId: admin.id,
    },
  });

  // Create project members
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: testProject.id, userId: admin.id } },
    update: {},
    create: {
      projectId: testProject.id,
      userId: admin.id,
      role: 'OWNER',
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: testProject.id, userId: contributor.id } },
    update: {},
    create: {
      projectId: testProject.id,
      userId: contributor.id,
      role: 'MEMBER',
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: testProject.id, userId: moderator.id } },
    update: {},
    create: {
      projectId: testProject.id,
      userId: moderator.id,
      role: 'MEMBER',
    },
  });

  // Create some project comments
  await prisma.projectComment.upsert({
    where: { id: 'seed-comment-1' },
    update: {},
    create: {
      id: 'seed-comment-1',
      text: 'Looking great! The wireframes are exactly what we discussed.',
      cardId: card1.id,
      authorId: moderator.id,
    },
  });

  // Create project activities
  await prisma.projectActivity.upsert({
    where: { id: 'seed-activity-1' },
    update: {},
    create: {
      id: 'seed-activity-1',
      action: ProjectActivityAction.CARD_CREATED,
      data: { cardTitle: card1.title },
      projectId: testProject.id,
      cardId: card1.id,
      userId: admin.id,
    },
  });

  await prisma.projectActivity.upsert({
    where: { id: 'seed-activity-2' },
    update: {},
    create: {
      id: 'seed-activity-2',
      action: ProjectActivityAction.CARD_MOVED,
      data: { fromList: 'To Do', toList: 'In Progress', cardTitle: card1.title },
      projectId: testProject.id,
      cardId: card1.id,
      userId: admin.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👥 Created users:', { admin, moderator, contributor, viewer });
  console.log('🏷️  Created tags:', tags);
  console.log('📝 Created content:', content);
  console.log('📋 Created project with board structure:', testProject);
  console.log('📝 Created cards with checklists and assignments');
  console.log('🎯 Created project labels and activities');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
