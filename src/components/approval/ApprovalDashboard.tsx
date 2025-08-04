'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tabs,
  Text,
  Divider,
  Loader,
  Alert,
  useMantineColorScheme,
} from '@mantine/core';
import { ApprovalStats } from './ApprovalStats';
import { ApprovalList } from './ApprovalList';
import { ApprovalFilters } from './ApprovalFilters';
import { useAuth } from '@/hooks/useAuth';

// Define filter types
export interface ApprovalFilters {
  status: string[];
  contentType: string[];
  dateRange: [Date | null, Date | null];
  authorId?: string;
  searchQuery: string;
}

export function ApprovalDashboard() {
  const { user } = useAuth();
  const { colorScheme } = useMantineColorScheme();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  const isDark = colorScheme === 'dark';

  // Filter state
  const [filters, setFilters] = useState<ApprovalFilters>({
    status: [],
    contentType: [],
    dateRange: [null, null],
    searchQuery: '',
  });

  // Fetch approvals data with proper error handling and loading states
  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params based on filters
      const params = new URLSearchParams();

      if (filters.status.length > 0) {
        params.append('status', filters.status.join(','));
      }

      if (filters.contentType.length > 0) {
        params.append('contentType', filters.contentType.join(','));
      }

      if (filters.dateRange[0]) {
        params.append('startDate', filters.dateRange[0].toISOString());
      }

      if (filters.dateRange[1]) {
        params.append('endDate', filters.dateRange[1].toISOString());
      }

      if (filters.searchQuery) {
        params.append('search', filters.searchQuery);
      }

      // Add tab-specific filters
      if (activeTab === 'pending') {
        // Only show pending approvals
        params.append('status', 'PENDING');
      } else if (activeTab === 'assigned') {
        // Assigned to me - content assigned to current user
        params.append('assignedTo', user?.id || '');
      } else if (activeTab === 'my-approvals') {
        // My approvals - approvals created by current user
        params.append('approvedBy', user?.id || '');
      }
      // 'all' tab shows everything without additional filters

      // Fetch data
      const response = await fetch(`/api/approvals?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch approvals: ${response.statusText}`);
      }

      const data = await response.json();
      setApprovals(data.approvals || []);
      setStats(
        data.stats || {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0,
        }
      );
    } catch (err) {
      console.error('Error fetching approvals:', err);
      setError('Failed to load approvals. Please try again.');
      setApprovals([]);
      setStats({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, user?.id]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<ApprovalFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handle status change - refresh data after approval actions
  const handleStatusChange = useCallback(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Handle tab change
  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value);
    }
  };

  return (
    <Box w="100%">
      {/* Tabs */}
      <Box
        style={{
          borderBottom: `1px solid ${
            isDark
              ? 'var(--mantine-color-dark-4)'
              : 'var(--mantine-color-gray-3)'
          }`,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="pills"
          color="blue"
        >
          <Tabs.List>
            <Tabs.Tab value="all">All Approvals</Tabs.Tab>
            <Tabs.Tab value="pending">Pending Review</Tabs.Tab>
            <Tabs.Tab value="assigned">Assigned to Me</Tabs.Tab>
            <Tabs.Tab value="my-approvals">My Approvals</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Box>

      {/* Stats */}
      <Box p="lg">
        <ApprovalStats stats={stats} loading={loading} />
      </Box>

      <Divider />

      {/* Filters */}
      <Box
        p="lg"
        style={{
          backgroundColor: isDark
            ? 'var(--mantine-color-dark-6)'
            : 'var(--mantine-color-white)',
        }}
      >
        <ApprovalFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </Box>

      <Divider />

      {/* Content */}
      <Box p={0}>
        {loading ? (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 32,
            }}
          >
            <Loader size="lg" />
          </Box>
        ) : error ? (
          <Alert color="red" m="md">
            {error}
          </Alert>
        ) : approvals.length === 0 ? (
          <Box p="xl" ta="center">
            <Text c="dimmed">
              {activeTab === 'all' &&
                'No approvals found matching your criteria'}
              {activeTab === 'pending' && 'No pending approvals found'}
              {activeTab === 'assigned' &&
                'No content assigned to you for approval'}
              {activeTab === 'my-approvals' &&
                "You haven't made any approvals yet"}
            </Text>
          </Box>
        ) : (
          <ApprovalList
            approvals={approvals}
            onStatusChange={handleStatusChange}
          />
        )}
      </Box>
    </Box>
  );
}
