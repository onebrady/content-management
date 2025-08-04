import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This is a simplified example. In a real application, you would have a more robust way of managing settings.
const SETTINGS_KEY = 'system_settings';

interface SystemSettings {
  siteName: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  companyLogo?: string;
  [key: string]: any;
}

// GET /api/settings - Get system settings (public endpoint)
export async function GET(req: NextRequest) {
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
        companyLogo: '',
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
} 