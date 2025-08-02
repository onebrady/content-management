import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    // Only allow in production
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: 'Migration endpoint only available in production' },
        { status: 403 }
      );
    }

    console.log('Manual migration triggered via API');

    // Run migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env },
    });

    return NextResponse.json({
      success: true,
      message: 'Migrations completed successfully',
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
