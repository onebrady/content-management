import React from 'react';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { ContentForm } from '../ContentForm';

// Mock the FileUpload component which uses uploadthing
jest.mock('@/components/upload/FileUpload', () => ({
  FileUpload: ({ onUploadComplete }) => (
    <div
      data-testid="mock-file-upload"
      onClick={() =>
        onUploadComplete?.([
          { url: 'https://example.com/test.jpg', name: 'test.jpg', size: 1024 },
        ])
      }
    >
      Mock File Upload
    </div>
  ),
}));

// Mock the TiptapEditor component
jest.mock('@/components/editor/TiptapEditor', () => ({
  TiptapEditor: ({ onUpdate }: { onUpdate: (content: string) => void }) => (
    <div
      data-testid="mock-editor"
      onClick={() => onUpdate('<p>Updated content</p>')}
    >
      Mock Editor
    </div>
  ),
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ContentForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockContent = {
    id: 'test-content-id',
    title: 'Test Content',
    content: '<p>Test content body</p>',
    status: 'DRAFT',
    type: 'ARTICLE',
    priority: 'MEDIUM',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    render(<ContentForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/content type/i)).toBeInTheDocument();
    expect(screen.getByText(/priority/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should render with initial values when content is provided', () => {
    render(
      <ContentForm onSubmit={mockOnSubmit} initialContent={mockContent} />
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Content');
    // Check that mock editor is rendered
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    render(<ContentForm onSubmit={mockOnSubmit} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Test Content' },
    });

    // Simulate editor update
    fireEvent.click(screen.getByTestId('mock-editor'));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Check that onSubmit was called with the correct data
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Test Content',
        content: '<p>Updated content</p>',
      })
    );
  });

  it('should show validation errors for required fields', async () => {
    render(<ContentForm onSubmit={mockOnSubmit} />);

    // Submit form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    // Check for validation error messages
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();

    // Ensure onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
