const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTempAdmin() {
  try {
    console.log('Cleaning up temporary admin user...');

    const result = await prisma.user.deleteMany({
      where: {
        email: 'admin@local.dev',
      },
    });

    console.log(
      `✅ Temporary admin user removed: ${result.count} users deleted`
    );

    // Verify Brady Freeman is the only admin
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true },
    });

    console.log('Current admin users:');
    admins.forEach((admin) => {
      console.log(`- ${admin.name} (${admin.email}) - ${admin.role}`);
    });
  } catch (error) {
    console.error('Error cleaning up temp admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTempAdmin();
