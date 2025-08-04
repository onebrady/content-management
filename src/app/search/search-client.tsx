'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  Box,
  Container,
  Text,
  Paper,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useSearch } from '@/hooks/useSearch';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { AppLayout } from '@/components/layout/AppLayout';

export default function SearchClient({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useMantineColorScheme();

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

  const isDark = colorScheme === 'dark';

  return (
    <PermissionGuard permission={PERMISSIONS.CONTENT_VIEW}>
      <AppLayout>
        <Box p="xl">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: '', href: '/dashboard' },
              { label: 'Search', href: '/search' },
            ]}
            showHomeIcon={true}
            homeLabel=""
          />

          <Title order={1} mb="xl">
            Search Content
          </Title>

          <Paper
            p="lg"
            mb="xl"
            withBorder
            style={{
              backgroundColor: isDark
                ? 'var(--mantine-color-dark-6)'
                : 'var(--mantine-color-white)',
              borderColor: isDark
                ? 'var(--mantine-color-dark-4)'
                : 'var(--mantine-color-gray-3)',
            }}
          >
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
        </Box>
      </AppLayout>
    </PermissionGuard>
  );
}
