'use client';

import { Button, Card, Text, Box, Alert } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';
import ErrorClient from './error-client';

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorClient searchParams={searchParams} />
    </Suspense>
  );
}
