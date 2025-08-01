'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ContentCreatePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main content page with create mode
    router.replace('/content?mode=create');
  }, [router]);

  return <LoadingSpinner />;
}
