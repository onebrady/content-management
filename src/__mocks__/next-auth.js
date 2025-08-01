// Mock for next-auth
module.exports = {
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })),
  getToken: jest.fn(() => Promise.resolve('mock-token')),
  getCsrfToken: jest.fn(() => Promise.resolve('mock-csrf-token')),
  getProviders: jest.fn(() => Promise.resolve({})),
  getSession: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      email: 'test@example.com',
      role: 'ADMIN',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })),
}; 