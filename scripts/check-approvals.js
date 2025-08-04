const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApprovals() {
  try {
    console.log('Checking content that needs approval...\n');

    // Get all content in IN_REVIEW status
    const contentInReview = await prisma.content.findMany({
      where: {
        status: 'IN_REVIEW',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `Found ${contentInReview.length} content items in IN_REVIEW status:`
    );

    contentInReview.forEach((content, index) => {
      console.log(`\n${index + 1}. ${content.title}`);
      console.log(`   ID: ${content.id}`);
      console.log(`   Type: ${content.type}`);
      console.log(`   Author: ${content.author.name}`);
      console.log(`   Assignee: ${content.assignee?.name || 'None'}`);
      console.log(`   Status: ${content.status}`);
      console.log(`   Approvals: ${content.approvals.length}`);
      console.log(`   Created: ${content.createdAt}`);
      console.log(`   Updated: ${content.updatedAt}`);
    });

    // Get all approval records
    const allApprovals = await prisma.approval.findMany({
      include: {
        content: {
          select: {
            id: true,
            title: true,
            status: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`\nFound ${allApprovals.length} approval records:`);

    allApprovals.forEach((approval, index) => {
      console.log(`\n${index + 1}. Approval for: ${approval.content.title}`);
      console.log(`   Approval ID: ${approval.id}`);
      console.log(`   Content ID: ${approval.contentId}`);
      console.log(`   Status: ${approval.status}`);
      console.log(`   Approver: ${approval.user.name}`);
      console.log(`   Comments: ${approval.comments || 'None'}`);
      console.log(`   Created: ${approval.createdAt}`);
      console.log(`   Updated: ${approval.updatedAt}`);
    });

    // Get all users with MODERATOR or ADMIN role
    const approvers = await prisma.user.findMany({
      where: {
        role: {
          in: ['MODERATOR', 'ADMIN'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(`\nFound ${approvers.length} potential approvers:`);
    approvers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
    });
  } catch (error) {
    console.error('Error checking approvals:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApprovals();
