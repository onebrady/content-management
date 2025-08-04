import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import ContentPage from '../page';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

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

describe('ContentPage', () => {
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

    // Wait for content to load and check for any instance of the title
    await waitFor(() => {
      expect(screen.getAllByText('Test Content').length).toBeGreaterThan(0);
    });

    // Check that hero image is displayed
    const heroImage = screen.getByAltText('Hero image for Test Content');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src', 'https://example.com/hero.jpg');
  });

  it('renders content page successfully', async () => {
    render(<ContentPage />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('ContentFlow')).toBeInTheDocument();
    });

    // Verify that the page renders without errors
    expect(screen.getByText('ContentFlow')).toBeInTheDocument();
  });
});
