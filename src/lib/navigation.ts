import {
  IconAdjustments,
  IconCalendarStats,
  IconFileAnalytics,
  IconGauge,
  IconLock,
  IconNotes,
  IconPresentationAnalytics,
  IconUsers,
  IconShield,
  IconSearch,
  IconSettings,
  IconArticle,
  IconCheck,
  IconPlus,
  IconChartBar,
} from '@tabler/icons-react';

export interface NavigationItem {
  label: string;
  icon: React.FC<any>;
  link?: string;
  initiallyOpened?: boolean;
  links?: NavigationSubItem[];
  roles?: string[];
}

export interface NavigationSubItem {
  label: string;
  link: string;
  roles?: string[];
}

export const navigationConfig: NavigationItem[] = [
  {
    label: 'Dashboard',
    icon: IconGauge,
    link: '/dashboard',
    roles: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN', 'VIEWER'],
  },
  {
    label: 'Content Management',
    icon: IconNotes,
    initiallyOpened: true,
    roles: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
    links: [
      {
        label: 'All Content',
        link: '/content',
        roles: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
      },
      {
        label: 'Create Content',
        link: '/content?mode=create',
        roles: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
      },
      {
        label: 'Content Analytics',
        link: '/analytics',
        roles: ['MODERATOR', 'ADMIN'],
      },
      {
        label: 'Approvals',
        link: '/approvals',
        roles: ['MODERATOR', 'ADMIN'],
      },
    ],
  },
  {
    label: 'Administration',
    icon: IconCalendarStats,
    roles: ['ADMIN'],
    links: [
      {
        label: 'Users',
        link: '/admin/users',
        roles: ['ADMIN'],
      },
      {
        label: 'Settings',
        link: '/admin/settings',
        roles: ['ADMIN'],
      },
      {
        label: 'Permissions',
        link: '/admin/permissions',
        roles: ['ADMIN'],
      },
    ],
  },
  {
    label: 'Analytics',
    icon: IconPresentationAnalytics,
    link: '/analytics',
    roles: ['MODERATOR', 'ADMIN'],
  },
  {
    label: 'Search',
    icon: IconSearch,
    link: '/search',
    roles: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN', 'VIEWER'],
  },
  {
    label: 'Settings',
    icon: IconSettings,
    link: '/admin/settings',
    roles: ['ADMIN'],
  },
  {
    label: 'Security',
    icon: IconLock,
    roles: ['ADMIN'],
    links: [
      {
        label: 'Enable 2FA',
        link: '/security/2fa',
        roles: ['ADMIN'],
      },
      {
        label: 'Change password',
        link: '/security/password',
        roles: ['ADMIN'],
      },
      {
        label: 'Recovery codes',
        link: '/security/recovery',
        roles: ['ADMIN'],
      },
    ],
  },
];

export const quickActions = [
  {
    title: 'Create Content',
    description: 'Create new articles, blog posts, and documents',
    icon: IconPlus,
    href: '/content?mode=create',
    roles: ['CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
  },
  {
    title: 'Review Approvals',
    description: 'Review and approve pending content',
    icon: IconCheck,
    href: '/approvals',
    roles: ['MODERATOR', 'ADMIN'],
  },
  {
    title: 'Manage Users',
    description: 'Manage user roles and permissions',
    icon: IconUsers,
    href: '/admin/users',
    roles: ['ADMIN'],
  },
  {
    title: 'System Settings',
    description: 'Configure system settings and preferences',
    icon: IconSettings,
    href: '/admin/settings',
    roles: ['ADMIN'],
  },
];

export const dashboardStats = [
  {
    title: 'Total Content',
    icon: IconArticle,
    color: 'blue',
    key: 'totalContent',
  },
  {
    title: 'In Review',
    icon: IconCheck,
    color: 'orange',
    key: 'pendingApprovals', // Keep the key the same for backward compatibility
  },
  {
    title: 'Active Users',
    icon: IconUsers,
    color: 'green',
    key: 'activeUsers',
  },
  {
    title: 'Recent Activity',
    icon: IconChartBar,
    color: 'cyan',
    key: 'recentActivity',
  },
];

export function filterNavigationByRole(
  navigation: NavigationItem[],
  userRole?: string
): NavigationItem[] {
  return navigation.filter((item) => {
    // Check if user has access to this item
    if (item.roles && userRole && !item.roles.includes(userRole)) {
      return false;
    }

    // Filter sub-links by role
    if (item.links) {
      const filteredLinks = item.links.filter((link) => {
        if (link.roles && userRole && !link.roles.includes(userRole)) {
          return false;
        }
        return true;
      });

      // Only show items with accessible sub-links
      return filteredLinks.length > 0;
    }

    return true;
  });
}
