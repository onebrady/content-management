// Mock for openid-client module
module.exports = {
  Issuer: {
    discover: jest.fn(),
  },
  Client: jest.fn(),
  generators: {
    random: jest.fn(),
    state: jest.fn(),
    codeVerifier: jest.fn(),
    codeChallenge: jest.fn(),
    nonce: jest.fn(),
  },
  custom: {
    http: jest.fn(),
  },
};
