// Mock for preact-render-to-string module
module.exports = {
  render: jest.fn(),
  renderToString: jest.fn(),
  renderToStaticMarkup: jest.fn(),
  shallowRender: jest.fn(),
};
