// Script to create an admin user in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'orders@westerntruck.com',
      },
    });

    if (existingUser) {
      // Update the existing user to ADMIN role
      const updatedUser = await prisma.user.update({
        where: {
          email: 'orders@westerntruck.com',
        },
        data: {
          role: 'ADMIN',
          name: 'Western Truck Admin',
          department: 'Management',
        },
      });

      console.log('User updated to ADMIN role:', updatedUser);
    } else {
      // Create a new admin user
      const newUser = await prisma.user.create({
        data: {
          email: 'orders@westerntruck.com',
          name: 'Western Truck Admin',
          role: 'ADMIN',
          department: 'Management',
        },
      });

      console.log('Admin user created:', newUser);
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
