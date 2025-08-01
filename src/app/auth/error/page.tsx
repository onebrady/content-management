'use client';

import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Error, ArrowBack } from '@mui/icons-material';
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
