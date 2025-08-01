import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContentForm } from '../ContentForm';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock the TiptapEditor component
jest.mock('@/components/editor/TiptapEditor', () => ({
  TiptapEditor: ({ onChange, content }: any) => (
    <div
      data-testid="mock-editor"
      onClick={() => onChange('<p>Updated content</p>')}
    >
      Mock Editor
      {content && <div data-testid="initial-content">{content}</div>}
    </div>
  ),
}));

// Mock the FileUpload component
jest.mock('@/components/upload/FileUpload', () => ({
  FileUpload: ({ onUploadComplete }: any) => (
    <div data-testid="mock-file-upload">
      <button
        onClick={() =>
          onUploadComplete([{ url: 'test.jpg', name: 'test.jpg', size: 1000 }])
        }
      >
        Upload File
      </button>
    </div>
  ),
}));

// Mock the FilePreview component
jest.mock('@/components/upload/FilePreview', () => ({
  FilePreview: ({ files }: any) => (
    <div data-testid="mock-file-preview">
      {files.map((file: any, index: number) => (
        <div key={index} data-testid={`file-${index}`}>
          {file.name}
        </div>
      ))}
    </div>
  ),
}));

describe('ContentForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', role: 'ADMIN' },
      isAuthenticated: true,
      isLoading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      hasRole: jest.fn(),
      hasAnyRole: jest.fn(),
      isAdmin: true,
      isModerator: false,
      isContributor: false,
      isViewer: false,
    });
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('should render with initial data', () => {
    const initialData = {
      title: 'Test Content',
      body: '<p>Test body</p>',
      type: 'ARTICLE',
      priority: 'MEDIUM',
      dueDate: '2024-01-01',
      assigneeId: '1',
      tags: [{ id: '1', name: 'Test Tag' }],
    };

    render(
      <ContentForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check that form is populated with initial data
    expect(screen.getByDisplayValue('Test Content')).toBeInTheDocument();
    // Check that mock editor is rendered
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    render(<ContentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Test Content' },
    });

    // Click the mock editor to simulate content update
    fireEvent.click(screen.getByTestId('mock-editor'));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create content/i }));

    // Check that onSubmit was called with the correct data
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Test Content',
        body: '<p>Updated content</p>',
      })
    );
  });

  it('should show validation errors for required fields', async () => {
    render(<ContentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Find the form element by looking for the submit button and getting its form
    const submitButton = screen.getByRole('button', {
      name: /create content/i,
    });
    const form = submitButton.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    // Check for validation error messages - the error should appear as helperText
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<ContentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should handle file upload', () => {
    render(<ContentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Click to show file upload
    fireEvent.click(screen.getByRole('button', { name: /add files/i }));

    // Upload a file
    fireEvent.click(screen.getByText('Upload File'));

    // Check that file preview is shown
    expect(screen.getByTestId('mock-file-preview')).toBeInTheDocument();
    expect(screen.getByTestId('file-0')).toBeInTheDocument();
  });

  it('should render with update mode when initialData is provided', () => {
    const initialData = {
      id: '1',
      title: 'Existing Content',
      body: '<p>Existing body</p>',
    };

    render(
      <ContentForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check that the button text changes to "Update Content"
    expect(
      screen.getByRole('button', { name: /update content/i })
    ).toBeInTheDocument();
  });
});
