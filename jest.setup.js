// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
  })),
  usePathname: jest.fn(() => '/test-path'),
}));

// Mock Next Auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
);

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock TextEncoder/TextDecoder for tests that require it (like uploadthing)
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock Mantine Dates components to avoid rendering issues in jsdom
jest.mock('@mantine/dates', () => {
  const React = require('react');
  const DatePickerInput = ({ value, onChange, ...props }) =>
    React.createElement('input', {
      'data-testid': 'date-input',
      value: value ? 'hasDate' : '',
      onChange: () => onChange && onChange(new Date()),
      ...props,
    });
  const DatesProvider = ({ children }) =>
    React.createElement(React.Fragment, null, children);
  return { __esModule: true, DatePickerInput, DatesProvider };
});

// Lightweight Mantine core mock to stabilize tests (map to simple DOM elements)
jest.mock('@mantine/core', () => {
  const React = require('react');
  const create = (tag) =>
    React.forwardRef((props, ref) =>
      React.createElement(tag, { ref, ...props }, props.children)
    );

  const Modal = ({ opened, children, ...rest }) =>
    opened
      ? React.createElement(
          'div',
          { 'data-testid': 'mantine-modal', ...rest },
          children
        )
      : null;

  const Menu = ({ children }) => React.createElement('div', null, children);
  Menu.Target = create('div');
  Menu.Dropdown = create('div');
  Menu.Item = create('div');
  Menu.Divider = create('hr');
  Menu.Label = create('div');

  const Badge = (props) => {
    const { rightSection, children, ...rest } = props || {};
    return React.createElement(
      'span',
      { ...rest },
      children,
      rightSection || null
    );
  };

  // Special Paper that honors component="form"
  const Paper = (props) => {
    const { component, children, ...rest } = props || {};
    const tag = component === 'form' ? 'form' : 'div';
    return React.createElement(tag, { ...rest }, children);
  };

  // AppShell mock with subcomponents
  const AppShell = ({ children, ...rest }) =>
    React.createElement('div', { 'data-appshell': true, ...rest }, children);
  AppShell.Navbar = create('div');
  AppShell.Main = create('div');

  return {
    __esModule: true,
    MantineProvider: create('div'),
    useMantineTheme: () => ({ colors: {}, primaryColor: 'blue' }),
    useMantineColorScheme: () => ({
      colorScheme: 'light',
      setColorScheme: jest.fn(),
    }),
    rem: (value) => String(value),
    Modal,
    UnstyledButton: create('button'),
    Stack: create('div'),
    Group: create('div'),
    Text: create('span'),
    TextInput: create('input'),
    Textarea: create('textarea'),
    Button: create('button'),
    Badge,
    Avatar: create('div'),
    ActionIcon: create('button'),
    Divider: create('hr'),
    Box: create('div'),
    Paper,
    Title: create('h2'),
    ScrollArea: create('div'),
    Checkbox: React.forwardRef((props, ref) =>
      React.createElement('input', { type: 'checkbox', ref, ...props })
    ),
    Menu,
    Select: create('select'),
    Switch: React.forwardRef((props, ref) =>
      React.createElement('input', { type: 'checkbox', ref, ...props })
    ),
    Code: create('code'),
    LoadingOverlay: ({ visible }) =>
      visible
        ? React.createElement('div', {
            className: 'mantine-LoadingOverlay-root',
          })
        : null,
    Container: create('div'),
    Alert: create('div'),
    AppShell,
    Collapse: ({ in: open, children }) =>
      open ? React.createElement('div', null, children) : null,
    Tooltip: ({ children }) => React.createElement('span', null, children),
    Indicator: ({ children }) => React.createElement('span', null, children),
  };
});

// Mock UserPresence component used in realtime integration tests (virtual mock for alias path)
jest.mock(
  '@/components/realtime/UserPresence',
  () => {
    const React = require('react');
    const UserPresence = ({ users }) =>
      React.createElement(
        'div',
        { 'data-testid': 'user-presence' },
        (users || []).map((u) =>
          React.createElement('span', { key: u.id }, u.name)
        )
      );
    return { __esModule: true, default: UserPresence, UserPresence };
  },
  { virtual: true }
);

// Mock @hello-pangea/dnd to avoid context invariants in tests
jest.mock('@hello-pangea/dnd', () => {
  const React = require('react');
  const DragDropContext = ({ children }) =>
    React.createElement('div', { 'data-dnd-context': true }, children);
  const Droppable = ({ droppableId, children }) => {
    const provided = {
      innerRef: () => {},
      droppableProps: { 'data-rbd-droppable-id': droppableId },
      placeholder: null,
    };
    const snapshot = { isDraggingOver: false };
    return React.createElement(
      'div',
      { 'data-droppable': droppableId },
      typeof children === 'function' ? children(provided, snapshot) : children
    );
  };
  const Draggable = ({ draggableId, index, children }) => {
    const provided = {
      innerRef: () => {},
      draggableProps: { 'data-rbd-draggable-id': draggableId },
      dragHandleProps: { 'data-rbd-drag-handle-draggable-id': draggableId },
    };
    const snapshot = { isDragging: false, isDropAnimating: false };
    return React.createElement(
      'div',
      { 'data-draggable': draggableId },
      typeof children === 'function' ? children(provided, snapshot) : children
    );
  };
  return { __esModule: true, DragDropContext, Droppable, Draggable };
});

// Mock Mantine Notifications to avoid element type issues in tests
jest.mock('@mantine/notifications', () => {
  return {
    __esModule: true,
    Notifications: ({ children }) => children || null,
    notifications: {
      show: jest.fn(),
      update: jest.fn(),
      hide: jest.fn(),
      clean: jest.fn(),
    },
  };
});

// Mock useAuth to ensure authenticated state in tests
jest.mock('@/hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => ({
    user: { id: 'test-user', role: 'ADMIN' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Simplify layout and auth guard in tests to avoid navigation/UI noise
jest.mock('@/components/layout/AppLayout', () => ({
  __esModule: true,
  AppLayout: ({ children }) => children,
}));

jest.mock('@/components/auth/AuthGuard', () => ({
  __esModule: true,
  AuthGuard: ({ children }) => children,
}));

// Mock useAuth to avoid real auth context in tests
jest.mock('@/hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => ({ user: { id: 'test-user', role: 'ADMIN' } }),
}));

// In-memory Socket.IO mocks to avoid engine.io/ws in tests
jest.mock('socket.io', () => {
  const { EventEmitter } = require('events');
  class MockServer extends EventEmitter {
    constructor() {
      super();
      this.rooms = new Map();
      this.clients = new Set();
      global.__MOCK_IO_SERVER__ = this;
    }
    to(room) {
      return {
        emit: (event, data) => {
          (global.__MOCK_IO_CLIENTS__ || []).forEach((c) => {
            if (c._room === room && !c._isSender) {
              setTimeout(() => c._receive(event, data), 0);
            }
          });
        },
      };
    }
    close() {}
    removeAllListeners() {
      super.removeAllListeners();
    }
  }
  return { Server: MockServer };
});

jest.mock('socket.io-client', () => {
  const { EventEmitter } = require('events');
  global.__MOCK_IO_CLIENTS__ = global.__MOCK_IO_CLIENTS__ || [];
  function io() {
    const client = new EventEmitter();
    client.connected = false;
    client._room = null;
    client._isSender = false;
    const server = global.__MOCK_IO_SERVER__;
    const serverSocket = new EventEmitter();
    serverSocket.join = (room) => {
      client._room = room;
    };
    serverSocket.to = (room) => ({
      emit: (event, data) => {
        (global.__MOCK_IO_CLIENTS__ || []).forEach((c) => {
          if (c !== client && c._room === room) {
            setTimeout(() => c._receive(event, data), 0);
          }
        });
      },
    });
    client.emit = (event, data) => {
      serverSocket.emit(event, data);
      return true;
    };
    client._receive = (event, data) =>
      EventEmitter.prototype.emit.call(client, event, data);
    client.disconnect = () => {
      client.connected = false;
      client._receive('disconnect');
    };
    client.connect = () => {
      if (!client.connected) {
        client.connected = true;
        setTimeout(() => client._receive('connect'), 0);
      }
    };
    setTimeout(() => {
      client.connected = true;
      client._receive('connect');
      if (server && typeof server.on === 'function') {
        server.emit('connection', serverSocket);
      }
    }, 0);
    global.__MOCK_IO_CLIENTS__.push(client);
    return client;
  }
  return { io };
});
