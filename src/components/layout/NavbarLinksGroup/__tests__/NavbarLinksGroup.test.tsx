import { render, screen, fireEvent } from '@/utils/test-utils';
import { LinksGroup } from '../NavbarLinksGroup';
import { useRouter, usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('LinksGroup', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a direct link correctly', () => {
    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Dashboard"
        link="/dashboard"
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('renders a group with sub-links correctly', () => {
    const links = [
      { label: 'All Content', link: '/content' },
      { label: 'Create Content', link: '/content/create' },
    ];

    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Content Management"
        links={links}
      />
    );

    expect(screen.getByText('Content Management')).toBeInTheDocument();
    expect(screen.getByText('All Content')).toBeInTheDocument();
    expect(screen.getByText('Create Content')).toBeInTheDocument();
  });

  it('navigates when direct link is clicked', () => {
    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Dashboard"
        link="/dashboard"
      />
    );

    fireEvent.click(screen.getByText('Dashboard'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates when sub-link is clicked', () => {
    const links = [
      { label: 'All Content', link: '/content' },
      { label: 'Create Content', link: '/content/create' },
    ];

    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Content Management"
        links={links}
      />
    );

    fireEvent.click(screen.getByText('All Content'));
    expect(mockPush).toHaveBeenCalledWith('/content');
  });

  it('toggles group when parent is clicked', () => {
    const links = [
      { label: 'All Content', link: '/content' },
      { label: 'Create Content', link: '/content/create' },
    ];

    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Content Management"
        links={links}
      />
    );

    // Initially closed
    expect(screen.getByText('All Content')).toBeInTheDocument();
    expect(screen.getByText('Create Content')).toBeInTheDocument();

    // Click parent to toggle
    fireEvent.click(screen.getByText('Content Management'));

    // Should not navigate since it's a group
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('applies active styling to direct link when active', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Dashboard"
        link="/dashboard"
      />
    );

    const link = screen.getByText('Dashboard').closest('button');
    expect(link).toHaveAttribute('data-active');
  });

  it('applies active styling to sub-link when active', () => {
    mockUsePathname.mockReturnValue('/content');

    const links = [
      { label: 'All Content', link: '/content' },
      { label: 'Create Content', link: '/content/create' },
    ];

    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Content Management"
        links={links}
      />
    );

    const activeLink = screen.getByText('All Content');
    expect(activeLink).toHaveAttribute('data-active');
  });

  it('applies active styling to parent when child is active', () => {
    mockUsePathname.mockReturnValue('/content');

    const links = [
      { label: 'All Content', link: '/content' },
      { label: 'Create Content', link: '/content/create' },
    ];

    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Content Management"
        links={links}
      />
    );

    const parent = screen.getByText('Content Management').closest('button');
    expect(parent).toHaveAttribute('data-active');
  });

  it('closes parent menu when navigating to different main nav option', () => {
    // Start with content management active
    mockUsePathname.mockReturnValue('/content');

    const links = [
      { label: 'All Content', link: '/content' },
      { label: 'Create Content', link: '/content/create' },
    ];

    const { rerender } = render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Content Management"
        links={links}
      />
    );

    // Parent should be active when child is active
    const parent = screen.getByText('Content Management').closest('button');
    expect(parent).toHaveAttribute('data-active');

    // Now navigate to dashboard (different main nav)
    mockUsePathname.mockReturnValue('/dashboard');
    rerender(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Content Management"
        links={links}
      />
    );

    // Parent should no longer be active
    const updatedParent = screen
      .getByText('Content Management')
      .closest('button');
    expect(updatedParent).not.toHaveAttribute('data-active');
  });

  it('does not apply active styling to parent when on unrelated route', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    const links = [
      { label: 'All Content', link: '/content' },
      { label: 'Create Content', link: '/content/create' },
    ];

    render(
      <LinksGroup
        icon={() => <div>Icon</div>}
        label="Content Management"
        links={links}
      />
    );

    const parent = screen.getByText('Content Management').closest('button');
    expect(parent).not.toHaveAttribute('data-active');
  });
});
