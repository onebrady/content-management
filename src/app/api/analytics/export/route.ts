import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler, requirePermission } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getDashboardAnalytics, exportAnalyticsToCSV } from '@/lib/analytics';

// GET /api/analytics/export - Export analytics data as CSV
export const GET = createProtectedHandler(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv';

    let timeRange;

    if (startDateParam && endDateParam) {
      timeRange = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
      };
    }

    const analytics = await getDashboardAnalytics(timeRange);

    if (format === 'json') {
      return NextResponse.json(analytics);
    }

    // Default to CSV
    const csvData = exportAnalyticsToCSV(analytics);

    // Create response with CSV content
    const response = new NextResponse(csvData);

    // Set headers for file download
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="analytics-export-${new Date().toISOString().split('T')[0]}.csv"`
    );

    return response;
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}, requirePermission(PERMISSIONS.ANALYTICS_VIEW));
