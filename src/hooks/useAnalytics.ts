'use client';

import { useState, useEffect } from 'react';
import {
  AnalyticsTimeRange,
  DashboardAnalytics,
  getDefaultTimeRange,
} from '@/lib/analytics';

export function useAnalytics() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>(
    getDefaultTimeRange()
  );
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const startDate = timeRange.startDate.toISOString();
        const endDate = timeRange.endDate.toISOString();

        const response = await fetch(
          `/api/analytics/dashboard?startDate=${startDate}&endDate=${endDate}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Update time range
  const updateTimeRange = (newTimeRange: AnalyticsTimeRange) => {
    setTimeRange(newTimeRange);
  };

  // Export analytics data
  const exportAnalytics = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const startDate = timeRange.startDate.toISOString();
      const endDate = timeRange.endDate.toISOString();

      const url = `/api/analytics/export?startDate=${startDate}&endDate=${endDate}&format=${format}`;

      if (format === 'json') {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to export analytics data');
        }
        return await response.json();
      } else {
        // For CSV, trigger a file download
        window.open(url, '_blank');
        return true;
      }
    } catch (err) {
      console.error('Error exporting analytics:', err);
      setError('Failed to export analytics data. Please try again.');
      return false;
    }
  };

  // Set predefined time ranges
  const setLastDays = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    setTimeRange({ startDate, endDate });
  };

  // Set custom date range
  const setCustomDateRange = (startDate: Date, endDate: Date) => {
    setTimeRange({ startDate, endDate });
  };

  return {
    analytics,
    timeRange,
    loading,
    error,
    updateTimeRange,
    exportAnalytics,
    setLastDays,
    setCustomDateRange,
  };
}
