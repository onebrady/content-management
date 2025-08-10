import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
// Render the inner client component directly to avoid Suspense/Auth wrapper issues in tests
import ContentPage from '../page';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));
const mockUseAuth = useAuth as unknown as jest.MockedFunction<typeof useAuth>;

// Mock mantine dropzone in test environment to avoid context mismatch
jest.mock('@mantine/dropzone', () => ({
  Dropzone: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropzone">{children}</div>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation with all required hooks
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/content',
}));

// Mock the components that are used in the page
jest.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

jest.mock('@/components/navigation/Breadcrumbs', () => ({
  Breadcrumbs: ({ items }: { items: any[] }) => (
    <div data-testid="breadcrumbs">Breadcrumbs</div>
  ),
}));

jest.mock('@/components/content/ContentList', () => ({
  ContentList: ({ content }: { content: any[] }) => (
    <div data-testid="content-list">
      {content.map((item) => (
        <div key={item.id} data-testid={`content-item-${item.id}`}>
          {item.title}
          {item.heroImage && (
            <img
              src={item.heroImage}
              alt={`Hero image for ${item.title}`}
              data-testid={`hero-image-${item.id}`}
            />
          )}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/auth/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-guard">{children}</div>
  ),
}));

describe.skip('ContentPage', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'CONTRIBUTOR',
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    // Mock successful API responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            id: 'content-1',
            title: 'Test Content',
            heroImage: 'https://example.com/hero.jpg',
            body: 'Test body',
            status: 'DRAFT',
            type: 'ARTICLE',
            priority: 'MEDIUM',
            author: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'CONTRIBUTOR',
            },
            tags: [],
            attachments: [],
            comments: [],
            approvals: [],
            _count: { comments: 0, approvals: 0, attachments: 0 },
          },
        ],
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders content list with hero images', async () => {
    render(<ContentPage />);

    // Wait for content to load and check for the content list
    await waitFor(() => {
      expect(screen.getByTestId('content-list')).toBeInTheDocument();
    });

    // Check that the content item is rendered
    expect(screen.getByTestId('content-item-content-1')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Check that hero image is displayed
    const heroImage = screen.getByTestId('hero-image-content-1');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src', 'https://example.com/hero.jpg');
  });

  it('renders content page successfully', async () => {
    render(<ContentPage />);

    // Wait for the component to render and loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });

    // Wait for loading to complete and content to load
    await waitFor(() => {
      expect(screen.getByTestId('content-list')).toBeInTheDocument();
    });

    // Verify that the page renders without errors
    expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });
});
