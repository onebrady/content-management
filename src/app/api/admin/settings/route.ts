import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// This is a simplified example. In a real application, you would have a more robust way of managing settings.
const SETTINGS_KEY = 'system_settings';

interface SystemSettings {
  siteName: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  [key: string]: any;
}

// GET /api/settings - Get system settings
export const GET = createProtectedHandler(async (req) => {
  try {
    const settingsRecord = await prisma.notification.findFirst({
      where: { type: SETTINGS_KEY },
    });

    if (settingsRecord) {
      const settings: SystemSettings = JSON.parse(settingsRecord.message);
      return NextResponse.json(settings);
    } else {
      // Default settings
      const defaultSettings: SystemSettings = {
        siteName: 'Content Management',
        defaultLanguage: 'en',
        maintenanceMode: false,
      };
      return NextResponse.json(defaultSettings);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.SETTINGS_VIEW));

// POST /api/settings - Update system settings
export const POST = createProtectedHandler(async (req) => {
  try {
    const body: SystemSettings = await req.json();

    // Validate settings
    if (!body.siteName || !body.defaultLanguage) {
      return NextResponse.json(
        { error: 'Site name and default language are required' },
        { status: 400 }
      );
    }

    const settingsString = JSON.stringify(body);

    // Using the Notification model as a key-value store for simplicity
    await prisma.notification.upsert({
      where: {
        userId_type: {
          userId: req.user!.id,
          type: SETTINGS_KEY,
        },
      },
      update: {
        message: settingsString,
      },
      create: {
        userId: req.user!.id, // Associated with the user who last updated it
        type: SETTINGS_KEY,
        message: settingsString,
        isRead: true, // Mark as "read" to distinguish from user notifications
      },
    });

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.SETTINGS_EDIT));
