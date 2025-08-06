const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function restoreAdminUser() {
  try {
    console.log('Restoring Brady Freeman admin user...');

    const email = 'onebrady@gmail.com';
    const name = 'Brady Freeman';
    const password = 'C&CREM&q5j&4fN';
    const role = 'ADMIN';

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      console.log('User already exists, updating...');
      // Update existing user
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role,
        },
      });
    } else {
      console.log('Creating new admin user...');
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
        },
      });
    }

    console.log('✅ Brady Freeman admin user restored successfully!');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Role: ${role}`);
    console.log(`User ID: ${user.id}`);
  } catch (error) {
    console.error('❌ Error restoring admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAdminUser();
