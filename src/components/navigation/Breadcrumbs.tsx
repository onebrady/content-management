'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumbs as MantineBreadcrumbs,
  Anchor,
  Text,
  Box,
} from '@mantine/core';
import { IconHome, IconChevronRight } from '@tabler/icons-react';
import NextLink from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  const generateBreadcrumbs = () => {
    // If custom items are provided, use them
    if (items) {
      return items.map((item, index) => ({
        label: item.label,
        href: item.href,
        icon: index === 0 ? <IconHome size={16} /> : null,
      }));
    }

    // Default breadcrumb generation
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      {
        label: 'Home',
        href: '/',
        icon: <IconHome size={16} />,
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
    <Box mb="md">
      <MantineBreadcrumbs
        separator={<IconChevronRight size={16} />}
        separatorMargin="md"
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
              <Text key={breadcrumb.href} size="sm" c="dimmed">
                {breadcrumb.icon}
                {breadcrumb.label}
              </Text>
            );
          }

          return (
            <Anchor
              key={breadcrumb.href}
              component={NextLink}
              href={breadcrumb.href}
              size="sm"
              c="blue"
            >
              {breadcrumb.icon}
              {breadcrumb.label}
            </Anchor>
          );
        })}
      </MantineBreadcrumbs>
    </Box>
  );
}
