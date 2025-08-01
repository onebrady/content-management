import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getDashboardAnalytics } from '@/lib/analytics';

// GET /api/analytics/dashboard - Get dashboard analytics data
export const GET = createProtectedHandler(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let timeRange;

    if (startDateParam && endDateParam) {
      timeRange = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
      };
    }

    const analytics = await getDashboardAnalytics(timeRange);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.ANALYTICS_VIEW));
