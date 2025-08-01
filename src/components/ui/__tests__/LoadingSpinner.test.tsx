import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Please wait..." />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('should render with correct structure', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
    // Check that the spinner is a CircularProgress component (renders as SPAN)
    expect(spinner.tagName).toBe('SPAN');
  });
});
