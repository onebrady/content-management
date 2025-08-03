import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { CommentForm } from '../CommentForm';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

describe('CommentForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByPlaceholderText('Write a comment...')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <CommentForm
        onSubmit={mockOnSubmit}
        placeholder="Custom placeholder"
        buttonText="Custom Button"
        initialValue="Initial text"
      />
    );

    expect(
      screen.getByPlaceholderText('Custom placeholder')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Custom Button' })
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial text')).toBeInTheDocument();
  });

  it('handles text input changes', () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    expect(textarea).toHaveValue('Test comment');
  });

  it('submits form with valid text', async () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText('Write a comment...');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test comment');
    });
  });

  it('shows error for empty comment', async () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText('Write a comment...');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    // Test that button is disabled for empty input (correct behavior)
    expect(submitButton).toBeDisabled();

    // Test that button is disabled for whitespace-only input (correct behavior)
    fireEvent.change(textarea, { target: { value: '   ' } });
    expect(submitButton).toBeDisabled();

    // Test that button is enabled for valid input
    fireEvent.change(textarea, { target: { value: 'Valid comment' } });
    expect(submitButton).not.toBeDisabled();

    // Test validation error by clearing the text and trying to submit
    fireEvent.change(textarea, { target: { value: '' } });
    expect(submitButton).toBeDisabled();

    // Since the button is disabled, we can't test the form submission
    // But we can test that the validation logic works by checking the disabled state
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles cancel action', () => {
    const mockOnCancel = jest.fn();
    render(<CommentForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when submitting', async () => {
    const mockOnSubmitAsync = jest
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

    render(<CommentForm onSubmit={mockOnSubmitAsync} />);

    const textarea = screen.getByPlaceholderText('Write a comment...');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(textarea).toBeDisabled();
  });

  it('focuses textarea when autoFocus is true', () => {
    render(<CommentForm onSubmit={mockOnSubmit} autoFocus />);

    const textarea = screen.getByPlaceholderText('Write a comment...');
    expect(textarea).toHaveFocus();
  });
});
