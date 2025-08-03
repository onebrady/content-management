import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { ContentForm } from '../ContentForm';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the UploadThing hook
jest.mock('@uploadthing/react', () => ({
  generateReactHelpers: () => ({
    useUploadThing: () => ({
      startUpload: jest.fn(),
      isUploading: false,
    }),
  }),
}));

// Mock the TiptapEditor component
jest.mock('@/components/editor/TiptapEditor', () => ({
  TiptapEditor: ({ content, onChange }: any) => (
    <textarea
      data-testid="tiptap-editor"
      value={content}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock the FileUpload component
jest.mock('@/components/upload/FileUpload', () => ({
  FileUpload: ({ onUploadComplete }: any) => (
    <button
      data-testid="file-upload"
      onClick={() =>
        onUploadComplete([{ url: 'test-url', name: 'test.pdf', size: 1000 }])
      }
    >
      Upload File
    </button>
  ),
}));

// Mock the FilePreview component
jest.mock('@/components/upload/FilePreview', () => ({
  FilePreview: ({ files, onRemove }: any) => (
    <div data-testid="file-preview">
      {files.map((file: any, index: number) => (
        <div key={index}>
          {file.name}
          <button onClick={() => onRemove(index)}>Remove</button>
        </div>
      ))}
    </div>
  ),
}));

describe('ContentForm', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'CONTRIBUTOR',
  };

  const mockTags = [
    { id: 'tag-1', name: 'Technology' },
    { id: 'tag-2', name: 'Business' },
  ];

  const mockUsers = [
    { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    { id: 'user-2', name: 'Another User', email: 'another@example.com' },
  ];

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });
  });

  it('renders hero image upload button when no hero image is set', () => {
    render(
      <ContentForm
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        tags={mockTags}
        users={mockUsers}
      />
    );

    expect(screen.getByLabelText('Upload hero image')).toBeInTheDocument();
  });

  it('displays hero image when one is provided in initial data', () => {
    const initialData = {
      title: 'Test Content',
      body: 'Test body',
      heroImage: 'https://example.com/hero.jpg',
    };

    render(
      <ContentForm
        initialData={initialData}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        tags={mockTags}
        users={mockUsers}
      />
    );

    const heroImage = screen.getByAltText('Hero');
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src', 'https://example.com/hero.jpg');
  });

  it('submits form with hero image data', async () => {
    const mockOnSubmit = jest.fn();
    const initialData = {
      title: 'Test Content',
      body: 'Test body',
      heroImage: 'https://example.com/hero.jpg',
    };

    render(
      <ContentForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={jest.fn()}
        tags={mockTags}
        users={mockUsers}
      />
    );

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          heroImage: 'https://example.com/hero.jpg',
        })
      );
    });
  });

  it('includes hero image field in form data', () => {
    const initialData = {
      title: 'Test Content',
      body: 'Test body',
      heroImage: 'https://example.com/hero.jpg',
    };

    render(
      <ContentForm
        initialData={initialData}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
        tags={mockTags}
        users={mockUsers}
      />
    );

    // Verify that the hero image is displayed
    expect(screen.getByAltText('Hero')).toBeInTheDocument();
    expect(screen.getByAltText('Hero')).toHaveAttribute(
      'src',
      'https://example.com/hero.jpg'
    );
  });
});
