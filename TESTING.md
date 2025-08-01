# Testing Guide

This project uses Jest for unit testing and Playwright for end-to-end testing. For detailed documentation, see [docs/testing.md](docs/testing.md).

## Quick Start

### Unit Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test categories
npm run test:component  # Components
npm run test:api        # API routes
npm run test:hooks      # React hooks
npm run test:lib        # Library functions
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# View test reports
npm run test:e2e:report
```

## Test Structure

- **Unit Tests**: Located in `__tests__` folders next to the files they test
- **E2E Tests**: Located in the `e2e` directory

## Current Status

- Unit test coverage: ~11% (target: 70%)
- E2E tests: Basic authentication and user journey tests implemented
- Known issues: Some component tests need fixes (see [docs/testing_setup_summary.md](docs/testing_setup_summary.md))

## Writing Tests

### Component Test Example

```tsx
import { render, screen } from '@/utils/test-utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### API Route Test Example

```tsx
// Mock Next.js server components first
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    nextUrl: new URL(url),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data) => ({
      json: () => Promise.resolve(data),
    })),
  },
}));

// Import after mocking
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../route';

describe('API Route', () => {
  it('should return data', async () => {
    const request = new NextRequest('http://localhost:3000/api/endpoint');
    const response = await GET(request);
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
  });
});
```

For more examples and detailed guidance, refer to the [testing documentation](docs/testing.md).
