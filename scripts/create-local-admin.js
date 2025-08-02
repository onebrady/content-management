const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createLocalAdmin() {
  try {
    console.log('Creating local admin user...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@local.dev' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@local.dev',
        name: 'Local Admin',
        role: 'ADMIN',
        password: hashedPassword,
        department: 'IT',
      },
    });

    console.log('? Local admin user created successfully!');
    console.log('Email: admin@local.dev');
    console.log('Password: admin123');
    console.log('Role: ADMIN');
  } catch (error) {
    console.error('? Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createLocalAdmin();