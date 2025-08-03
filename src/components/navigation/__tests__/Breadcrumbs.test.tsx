import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../Breadcrumbs';
import { render as customRender } from '@/utils/test-utils';

// Mock next/navigation
const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('Breadcrumbs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render breadcrumbs based on current path', () => {
    mockUsePathname.mockReturnValue('/content/123');

    customRender(<Breadcrumbs />);

    // Check for Content breadcrumb
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Check for the last breadcrumb (123)
    expect(screen.getByText('123')).toBeInTheDocument();

    // Check that Dashboard link exists (icon only, no text)
    const dashboardLink = screen.getByRole('link', { name: '' });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard');
  });

  it('should render with correct navigation structure', () => {
    mockUsePathname.mockReturnValue('/content/123');

    customRender(<Breadcrumbs />);

    // Check for links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2); // Dashboard and Content links

    // Check that the last item is not a link (it's just text)
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('should handle root path', () => {
    mockUsePathname.mockReturnValue('/');

    customRender(<Breadcrumbs />);

    // For root path, Dashboard should be the last item (paragraph, not link)
    const dashboardElement = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'p' &&
        element?.querySelector('svg') !== null
      );
    });
    expect(dashboardElement).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should render with custom items', () => {
    const customItems = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Content', href: '/content' },
      { label: 'Test Page', href: '/content/test' },
    ];

    customRender(<Breadcrumbs items={customItems} />);

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Test Page')).toBeInTheDocument();

    // Check Dashboard link exists
    const dashboardLink = screen.getByRole('link', { name: '' });
    expect(dashboardLink).toBeInTheDocument();
  });

  it('should handle custom home label', () => {
    mockUsePathname.mockReturnValue('/content/123');

    customRender(<Breadcrumbs homeLabel="Home" />);

    // Check that Home link exists
    const homeLink = screen.getByRole('link', { name: '' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.getAttribute('href')).toBe('/dashboard');
  });
});
