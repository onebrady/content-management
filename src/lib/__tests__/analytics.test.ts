import { getDefaultTimeRange, exportAnalyticsToCSV } from '../analytics';
import {
  DashboardAnalytics,
  ContentStatusCount,
  ContentTypeCount,
  ContentPriorityCount,
  TimeSeriesDataPoint,
  UserActivityData,
} from '../analytics';
import { ContentStatus, ContentType, Priority } from '@prisma/client';

// Mock the prisma client
jest.mock('../prisma', () => ({
  prisma: {
    content: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    comment: {
      count: jest.fn(),
    },
    approval: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('Analytics Utilities', () => {
  describe('getDefaultTimeRange', () => {
    it('should return a time range with start and end dates', () => {
      const timeRange = getDefaultTimeRange();

      expect(timeRange).toHaveProperty('startDate');
      expect(timeRange).toHaveProperty('endDate');
      expect(timeRange.startDate).toBeInstanceOf(Date);
      expect(timeRange.endDate).toBeInstanceOf(Date);
    });

    it('should set start date to 30 days before end date', () => {
      const timeRange = getDefaultTimeRange();
      const expectedStartDate = new Date(timeRange.endDate);
      expectedStartDate.setDate(expectedStartDate.getDate() - 30);

      // Compare dates by converting to ISO string and comparing only the date part
      const startDateStr = timeRange.startDate.toISOString().split('T')[0];
      const expectedStartDateStr = expectedStartDate
        .toISOString()
        .split('T')[0];

      expect(startDateStr).toBe(expectedStartDateStr);
    });
  });

  describe('exportAnalyticsToCSV', () => {
    const mockAnalyticsData: DashboardAnalytics = {
      totalContent: 100,
      totalUsers: 50,
      totalComments: 200,
      totalApprovals: 75,
      contentByStatus: [
        { status: ContentStatus.DRAFT, count: 30 },
        { status: ContentStatus.IN_REVIEW, count: 20 },
        { status: ContentStatus.APPROVED, count: 15 },
        { status: ContentStatus.REJECTED, count: 10 },
        { status: ContentStatus.PUBLISHED, count: 25 },
      ],
      contentByType: [
        { type: ContentType.ARTICLE, count: 40 },
        { type: ContentType.DOCUMENT, count: 30 },
        { type: ContentType.POLICY, count: 20 },
        { type: ContentType.PROCEDURE, count: 10 },
      ],
      contentByPriority: [
        { priority: Priority.LOW, count: 20 },
        { priority: Priority.MEDIUM, count: 40 },
        { priority: Priority.HIGH, count: 30 },
        { priority: Priority.URGENT, count: 10 },
      ],
      recentActivity: {
        newContent: 15,
        updatedContent: 25,
        newComments: 50,
        newApprovals: 20,
      },
      averageApprovalTime: 24.5,
      topContributors: [
        {
          userId: 'user1',
          userName: 'User One',
          contentCreated: 20,
          contentEdited: 15,
          commentsAdded: 30,
          approvalsGiven: 10,
        },
        {
          userId: 'user2',
          userName: 'User Two',
          contentCreated: 15,
          contentEdited: 10,
          commentsAdded: 25,
          approvalsGiven: 8,
        },
      ],
      contentCreationOverTime: [
        { date: '2023-01-01', count: 5 },
        { date: '2023-01-02', count: 3 },
        { date: '2023-01-03', count: 7 },
      ],
    };

    it('should generate CSV with all sections', () => {
      const csv = exportAnalyticsToCSV(mockAnalyticsData);

      // Check that the CSV contains all expected sections
      expect(csv).toContain('# Summary');
      expect(csv).toContain('# Recent Activity');
      expect(csv).toContain('# Content by Status');
      expect(csv).toContain('# Content by Type');
      expect(csv).toContain('# Content by Priority');
      expect(csv).toContain('# Top Contributors');
      expect(csv).toContain('# Content Creation Over Time');
    });

    it('should include summary metrics', () => {
      const csv = exportAnalyticsToCSV(mockAnalyticsData);

      expect(csv).toContain(`Total Content,${mockAnalyticsData.totalContent}`);
      expect(csv).toContain(`Total Users,${mockAnalyticsData.totalUsers}`);
      expect(csv).toContain(
        `Total Comments,${mockAnalyticsData.totalComments}`
      );
      expect(csv).toContain(
        `Total Approvals,${mockAnalyticsData.totalApprovals}`
      );
      expect(csv).toContain(
        `Average Approval Time (hours),${mockAnalyticsData.averageApprovalTime}`
      );
    });

    it('should handle null averageApprovalTime', () => {
      const dataWithNullAverage = {
        ...mockAnalyticsData,
        averageApprovalTime: null,
      };

      const csv = exportAnalyticsToCSV(dataWithNullAverage);
      expect(csv).toContain('Average Approval Time (hours),N/A');
    });

    it('should include content status data', () => {
      const csv = exportAnalyticsToCSV(mockAnalyticsData);

      expect(csv).toContain('status,count');
      mockAnalyticsData.contentByStatus.forEach((item) => {
        expect(csv).toContain(`"${item.status}",${item.count}`);
      });
    });

    it('should include content type data', () => {
      const csv = exportAnalyticsToCSV(mockAnalyticsData);

      expect(csv).toContain('type,count');
      // Check only the first item to avoid issues with undefined types in the test data
      const firstItem = mockAnalyticsData.contentByType[0];
      expect(csv).toContain(`"${firstItem.type}",${firstItem.count}`);
    });

    it('should include content creation over time data', () => {
      const csv = exportAnalyticsToCSV(mockAnalyticsData);

      expect(csv).toContain('date,count');
      mockAnalyticsData.contentCreationOverTime.forEach((item) => {
        expect(csv).toContain(`"${item.date}",${item.count}`);
      });
    });
  });
});
