import { PrismaClient, UserRole, ContentType, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

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

  console.log('✅ Database seeded successfully!');
  console.log('👥 Created users:', { admin, moderator, contributor, viewer });
  console.log('🏷️  Created tags:', tags);
  console.log('📝 Created content:', content);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
