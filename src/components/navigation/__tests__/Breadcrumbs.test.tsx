import React from 'react';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../Breadcrumbs';

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

    render(<Breadcrumbs />);

    // Check for Home breadcrumb
    expect(screen.getByText('Home')).toBeInTheDocument();
    
    // Check for Content breadcrumb
    expect(screen.getByText('Content')).toBeInTheDocument();
    
    // Check for the last breadcrumb (123)
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('should render with correct navigation structure', () => {
    mockUsePathname.mockReturnValue('/content/123');

    render(<Breadcrumbs />);

    // Check that breadcrumbs are rendered
    expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument();
    
    // Check for links
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2); // Home and Content links
    
    // Check that the last item is not a link (it's just text)
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('should handle root path', () => {
    mockUsePathname.mockReturnValue('/');

    render(<Breadcrumbs />);

    // Only Home should be visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
