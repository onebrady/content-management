'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import NextLink from 'next/link';

export function Breadcrumbs() {
  const pathname = usePathname();

  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      {
        label: 'Home',
        href: '/',
        icon: <Home fontSize="small" />,
      },
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({
        label,
        href: currentPath,
        icon: null,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
              <Typography key={breadcrumb.href} color="text.primary">
                {breadcrumb.icon}
                {breadcrumb.label}
              </Typography>
            );
          }

          return (
            <Link
              key={breadcrumb.href}
              component={NextLink}
              href={breadcrumb.href}
              color="inherit"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {breadcrumb.icon}
              {breadcrumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}
