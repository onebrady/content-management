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

    // Run migrations with retry logic
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Migration attempt ${attempt}/${maxRetries}...`);

        execSync('npx prisma migrate deploy', {
          stdio: 'inherit',
          env: { ...process.env },
          timeout: 30000, // 30 seconds timeout
        });

        return NextResponse.json({
          success: true,
          message: 'Migrations completed successfully',
        });
      } catch (error) {
        lastError = error;
        console.error(`Migration attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          console.log(`Retrying in 5 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    // If we get here, all attempts failed
    return NextResponse.json(
      {
        error: 'Migration failed after all retries',
        details:
          lastError instanceof Error ? lastError.message : 'Unknown error',
      },
      { status: 500 }
    );
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
