'use client';

import { Suspense } from 'react';
import SearchClient from './search-client';

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchClient searchParams={searchParams} />
    </Suspense>
  );
}
