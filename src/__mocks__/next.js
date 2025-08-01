// Mock for Next.js server utilities
module.exports = {
  headers: jest.fn(() => new Map([
    ['authorization', 'Bearer mock-token'],
    ['cookie', 'mock-session-cookie'],
  ])),
  cookies: jest.fn(() => ({
    get: jest.fn(() => 'mock-session-cookie'),
    set: jest.fn(),
    delete: jest.fn(),
  })),
  redirect: jest.fn(),
  notFound: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
    redirect: jest.fn(),
    next: jest.fn(),
  },
}; 