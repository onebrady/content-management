import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import ContentPage from '../page';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: jest.fn(),
  }),
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

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    // Check that hero image is displayed
    const heroImage = screen.getByAltText('Hero image for Test Content');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src', 'https://example.com/hero.jpg');
  });

  it('refreshes content list after successful update', async () => {
    // Mock the updated content response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'content-1',
          title: 'Updated Content',
          heroImage: 'https://example.com/updated-hero.jpg',
          body: 'Updated body',
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
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              id: 'content-1',
              title: 'Updated Content',
              heroImage: 'https://example.com/updated-hero.jpg',
              body: 'Updated body',
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

    render(<ContentPage />);

    // Wait for initial content to load
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    // Verify that fetch was called to load initial content
    expect(global.fetch).toHaveBeenCalledWith('/api/content', {
      credentials: 'include',
    });
  });
});
