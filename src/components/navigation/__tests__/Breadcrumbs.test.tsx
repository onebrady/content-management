import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { Breadcrumbs } from '../Breadcrumbs';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
  usePathname: jest.fn().mockReturnValue('/content/123'),
}));

describe('Breadcrumbs Component', () => {
  it('should render breadcrumb items based on path', () => {
    render(<Breadcrumbs />);

    // Check for breadcrumb items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('should render with custom items when provided', () => {
    const customItems = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Projects', href: '/projects' },
      { label: 'Project Details', href: '/projects/1' },
    ];

    render(<Breadcrumbs items={customItems} />);

    // Check for custom breadcrumb items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Project Details')).toBeInTheDocument();
  });

  it('should handle empty path correctly', () => {
    // Override the mock for this test
    require('next/navigation').usePathname.mockReturnValueOnce('');

    render(<Breadcrumbs />);

    // Should only show Home
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should handle root path correctly', () => {
    // Override the mock for this test
    require('next/navigation').usePathname.mockReturnValueOnce('/');

    render(<Breadcrumbs />);

    // Should only show Home
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
