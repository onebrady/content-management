import { prisma } from '@/lib/prisma';
import { ContentStatus, ContentType, Priority, UserRole } from '@prisma/client';

export interface AnalyticsTimeRange {
  startDate: Date;
  endDate: Date;
}

export interface ContentStatusCount {
  status: ContentStatus;
  count: number;
}

export interface ContentTypeCount {
  type: ContentType;
  count: number;
}

export interface ContentPriorityCount {
  priority: Priority;
  count: number;
}

export interface UserActivityData {
  userId: string;
  userName: string;
  contentCreated: number;
  contentEdited: number;
  commentsAdded: number;
  approvalsGiven: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  count: number;
}

export interface DashboardAnalytics {
  totalContent: number;
  totalUsers: number;
  totalComments: number;
  totalApprovals: number;
  contentByStatus: ContentStatusCount[];
  contentByType: ContentTypeCount[];
  contentByPriority: ContentPriorityCount[];
  recentActivity: {
    newContent: number;
    updatedContent: number;
    newComments: number;
    newApprovals: number;
  };
  averageApprovalTime: number | null;
  topContributors: UserActivityData[];
  contentCreationOverTime: TimeSeriesDataPoint[];
}

/**
 * Get default time range for analytics (last 30 days)
 */
export function getDefaultTimeRange(): AnalyticsTimeRange {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  return { startDate, endDate };
}

/**
 * Get dashboard analytics data
 */
export async function getDashboardAnalytics(
  timeRange?: AnalyticsTimeRange
): Promise<DashboardAnalytics> {
  const { startDate, endDate } = timeRange || getDefaultTimeRange();

  // Get total counts
  const [totalContent, totalUsers, totalComments, totalApprovals] =
    await Promise.all([
      prisma.content.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.approval.count(),
    ]);

  // Get content by status
  const contentByStatusRaw = await prisma.content.groupBy({
    by: ['status'],
    _count: true,
  });

  const contentByStatus: ContentStatusCount[] = contentByStatusRaw.map(
    (item) => ({
      status: item.status,
      count: item._count,
    })
  );

  // Get content by type
  const contentByTypeRaw = await prisma.content.groupBy({
    by: ['type'],
    _count: true,
  });

  const contentByType: ContentTypeCount[] = contentByTypeRaw.map((item) => ({
    type: item.type,
    count: item._count,
  }));

  // Get content by priority
  const contentByPriorityRaw = await prisma.content.groupBy({
    by: ['priority'],
    _count: true,
  });

  const contentByPriority: ContentPriorityCount[] = contentByPriorityRaw.map(
    (item) => ({
      priority: item.priority,
      count: item._count,
    })
  );

  // Get recent activity
  const [newContent, updatedContent, newComments, newApprovals] =
    await Promise.all([
      prisma.content.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.content.count({
        where: {
          updatedAt: {
            gte: startDate,
            lte: endDate,
          },
          createdAt: {
            lt: startDate,
          },
        },
      }),
      prisma.comment.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.approval.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

  // Calculate average approval time
  const approvals = await prisma.approval.findMany({
    where: {
      status: {
        in: ['APPROVED', 'REJECTED'],
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  let averageApprovalTime: number | null = null;

  if (approvals.length > 0) {
    const totalTime = approvals.reduce((sum, approval) => {
      const creationTime = new Date(approval.createdAt).getTime();
      const updateTime = new Date(approval.updatedAt).getTime();
      return sum + (updateTime - creationTime);
    }, 0);

    // Average time in hours
    averageApprovalTime = totalTime / approvals.length / (1000 * 60 * 60);
  }

  // Get top contributors
  const users = await prisma.user.findMany({
    where: {
      role: {
        not: UserRole.VIEWER,
      },
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          createdContent: true,
          comments: true,
          approvals: true,
        },
      },
    },
    orderBy: {
      createdContent: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  const topContributors: UserActivityData[] = users.map((user) => ({
    userId: user.id,
    userName: user.name || 'Unknown',
    contentCreated: user._count.createdContent,
    contentEdited: 0, // This would require additional tracking
    commentsAdded: user._count.comments,
    approvalsGiven: user._count.approvals,
  }));

  // Get content creation over time
  const contentOverTime = await getContentCreationOverTime(startDate, endDate);

  return {
    totalContent,
    totalUsers,
    totalComments,
    totalApprovals,
    contentByStatus,
    contentByType,
    contentByPriority,
    recentActivity: {
      newContent,
      updatedContent,
      newComments,
      newApprovals,
    },
    averageApprovalTime,
    topContributors,
    contentCreationOverTime: contentOverTime,
  };
}

/**
 * Get content creation over time
 */
async function getContentCreationOverTime(
  startDate: Date,
  endDate: Date
): Promise<TimeSeriesDataPoint[]> {
  // Get all content created in the time range
  const contents = await prisma.content.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group by day
  const contentByDay = new Map<string, number>();

  // Initialize all days in the range with 0
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    contentByDay.set(dateString, 0);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count content per day
  contents.forEach((content) => {
    const dateString = new Date(content.createdAt).toISOString().split('T')[0];
    const currentCount = contentByDay.get(dateString) || 0;
    contentByDay.set(dateString, currentCount + 1);
  });

  // Convert to array of data points
  return Array.from(contentByDay.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

/**
 * Get content approval time statistics
 */
export async function getApprovalTimeStats(
  timeRange?: AnalyticsTimeRange
): Promise<{ average: number | null; min: number | null; max: number | null }> {
  const { startDate, endDate } = timeRange || getDefaultTimeRange();

  const approvals = await prisma.approval.findMany({
    where: {
      status: {
        in: ['APPROVED', 'REJECTED'],
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      updatedAt: true,
    },
  });

  if (approvals.length === 0) {
    return { average: null, min: null, max: null };
  }

  let total = 0;
  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;

  approvals.forEach((approval) => {
    const creationTime = new Date(approval.createdAt).getTime();
    const updateTime = new Date(approval.updatedAt).getTime();
    const timeDiff = (updateTime - creationTime) / (1000 * 60 * 60); // hours

    total += timeDiff;
    min = Math.min(min, timeDiff);
    max = Math.max(max, timeDiff);
  });

  return {
    average: total / approvals.length,
    min: min === Number.MAX_SAFE_INTEGER ? null : min,
    max: max === 0 ? null : max,
  };
}

/**
 * Get user activity statistics
 */
export async function getUserActivityStats(
  timeRange?: AnalyticsTimeRange
): Promise<UserActivityData[]> {
  const { startDate, endDate } = timeRange || getDefaultTimeRange();

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          createdContent: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
        {
          comments: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
        {
          approvals: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          createdContent: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          comments: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          approvals: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdContent: {
        _count: 'desc',
      },
    },
  });

  return users.map((user) => ({
    userId: user.id,
    userName: user.name || 'Unknown',
    contentCreated: user._count.createdContent,
    contentEdited: 0, // This would require additional tracking
    commentsAdded: user._count.comments,
    approvalsGiven: user._count.approvals,
  }));
}

/**
 * Export analytics data to CSV format
 */
export function exportAnalyticsToCSV(data: DashboardAnalytics): string {
  // Helper function to convert array to CSV
  const arrayToCSV = (arr: any[], headers: string[]): string => {
    const headerRow = headers.join(',');
    const rows = arr.map((item) =>
      headers.map((header) => JSON.stringify(item[header] ?? '')).join(',')
    );
    return [headerRow, ...rows].join('\n');
  };

  // Create sections
  const sections = [];

  // Summary section
  sections.push('# Summary');
  sections.push('Metric,Value');
  sections.push(`Total Content,${data.totalContent}`);
  sections.push(`Total Users,${data.totalUsers}`);
  sections.push(`Total Comments,${data.totalComments}`);
  sections.push(`Total Approvals,${data.totalApprovals}`);
  sections.push(
    `Average Approval Time (hours),${data.averageApprovalTime || 'N/A'}`
  );
  sections.push('');

  // Recent Activity section
  sections.push('# Recent Activity');
  sections.push('Metric,Value');
  sections.push(`New Content,${data.recentActivity.newContent}`);
  sections.push(`Updated Content,${data.recentActivity.updatedContent}`);
  sections.push(`New Comments,${data.recentActivity.newComments}`);
  sections.push(`New Approvals,${data.recentActivity.newApprovals}`);
  sections.push('');

  // Content by Status section
  sections.push('# Content by Status');
  sections.push(arrayToCSV(data.contentByStatus, ['status', 'count']));
  sections.push('');

  // Content by Type section
  sections.push('# Content by Type');
  sections.push(arrayToCSV(data.contentByType, ['type', 'count']));
  sections.push('');

  // Content by Priority section
  sections.push('# Content by Priority');
  sections.push(arrayToCSV(data.contentByPriority, ['priority', 'count']));
  sections.push('');

  // Top Contributors section
  sections.push('# Top Contributors');
  sections.push(
    arrayToCSV(data.topContributors, [
      'userName',
      'contentCreated',
      'commentsAdded',
      'approvalsGiven',
    ])
  );
  sections.push('');

  // Content Creation Over Time section
  sections.push('# Content Creation Over Time');
  sections.push(arrayToCSV(data.contentCreationOverTime, ['date', 'count']));

  return sections.join('\n');
}
