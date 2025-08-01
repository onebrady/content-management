'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
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
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  // Filter state
  const [filters, setFilters] = useState<ApprovalFilters>({
    status: [],
    contentType: [],
    dateRange: [null, null],
    searchQuery: '',
  });

  // Fetch approvals data
  useEffect(() => {
    const fetchApprovals = async () => {
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
        if (activeTab === 1) {
          // Assigned to me
          params.append('assignedTo', user?.id || '');
        } else if (activeTab === 2) {
          // My approvals
          params.append('approvedBy', user?.id || '');
        }

        // Fetch data
        const response = await fetch(`/api/approvals?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch approvals');
        }

        const data = await response.json();
        setApprovals(data.approvals);
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching approvals:', err);
        setError('Failed to load approvals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [activeTab, filters, user?.id]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<ApprovalFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="approval dashboard tabs"
        >
          <Tab label="All Approvals" />
          <Tab label="Pending Review" />
          <Tab label="My Approvals" />
        </Tabs>
      </Box>

      {/* Stats */}
      <Box sx={{ p: 3 }}>
        <ApprovalStats stats={stats} loading={loading} />
      </Box>

      <Divider />

      {/* Filters */}
      <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
        <ApprovalFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </Box>

      <Divider />

      {/* Content */}
      <Box sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : approvals.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No approvals found matching your criteria
            </Typography>
          </Box>
        ) : (
          <ApprovalList
            approvals={approvals}
            onStatusChange={() => {
              // Refresh data when status changes
              const fetchApprovals = async () => {
                setLoading(true);
                // Fetch updated data...
              };
              fetchApprovals();
            }}
          />
        )}
      </Box>
    </Box>
  );
}
