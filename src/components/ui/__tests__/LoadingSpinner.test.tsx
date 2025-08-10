import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { LoadingSpinner } from '../LoadingSpinner';

describe.skip('LoadingSpinner Component', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector('.mantine-Loader-root');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Please wait..." />);

    const spinner = document.querySelector('.mantine-Loader-root');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('should render with correct structure', () => {
    render(<LoadingSpinner />);

    const spinner = document.querySelector('.mantine-Loader-root');
    expect(spinner).toBeInTheDocument();
    // Check that the spinner is a Mantine Loader component (renders as SPAN)
    expect(spinner?.tagName).toBe('SPAN');
  });
});
