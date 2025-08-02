'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/hooks/useSearch';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export default function SearchClient({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();

  // Unwrap searchParams using React.use()
  const unwrappedSearchParams = React.use(searchParams);
  const initialQuery = unwrappedSearchParams.q || '';

  const {
    filters,
    results,
    pagination,
    loading,
    error,
    updateFilters,
    resetFilters,
    setPage,
  } = useSearch({
    query: initialQuery,
  });

  // Handle navigation to content
  const handleViewContent = (id: string) => {
    router.push(`/content/${id}`);
  };

  const handleEditContent = (id: string) => {
    router.push(`/content/${id}/edit`);
  };

  const handleDeleteContent = (id: string) => {
    // This would typically show a confirmation dialog first
    router.push(`/content/${id}?action=delete`);
  };

  return (
    <PermissionGuard permission={PERMISSIONS.CONTENT_VIEW}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography color="text.primary">Search</Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Search Content
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <SearchFilters
            filters={filters}
            onFilterChange={updateFilters}
            onResetFilters={resetFilters}
          />
        </Paper>

        <SearchResults
          results={results}
          pagination={pagination}
          loading={loading}
          error={error}
          onPageChange={setPage}
          onViewContent={handleViewContent}
          onEditContent={handleEditContent}
          onDeleteContent={handleDeleteContent}
        />
      </Container>
    </PermissionGuard>
  );
}
