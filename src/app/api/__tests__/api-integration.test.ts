import { POST as createProject, GET as getProjects } from '../projects/route';
import { GET as getBoardData } from '../projects/[id]/board/route';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware/auth';

// Mock NextRequest for testing
function createMockRequest(
  url: string,
  options: { method?: string; body?: string } = {}
) {
  const { method = 'GET', body } = options;

  return {
    url,
    method,
    headers: new Map(),
    json: jest.fn().mockImplementation(async () => {
      try {
        return body ? JSON.parse(body) : {};
      } catch {
        // Simulate real NextRequest.json throwing on invalid JSON
        throw new SyntaxError('Invalid JSON');
      }
    }),
    text: jest.fn().mockResolvedValue(body || ''),
  } as any;
}

// Mock the auth middleware
jest.mock('@/lib/middleware/auth');
const mockWithAuth = withAuth as jest.MockedFunction<typeof withAuth>;

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    projectMember: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock BoardUtils
jest.mock('@/lib/board-utils', () => ({
  BoardUtils: {
    getBoardData: jest.fn(),
  },
}));

// Mock rate limiting
jest.mock('@/lib/middleware/auth', () => ({
  withAuth: jest.fn(),
  withRateLimit: jest.fn(() => true),
}));

const mockPrisma = prisma as any;

describe('API Integration Tests', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'CONTRIBUTOR',
  };

  const mockProject = {
    id: 'project-1',
    title: 'Test Project',
    description: 'Test project description',
    color: '#3b82f6',
    archived: false,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-08T00:00:00.000Z'),
    background: '#f8f9fa',
    visibility: 'TEAM',
    starred: false,
    template: false,
    ownerId: 'user-1',
  };

  const mockProjectWithLists = {
    ...mockProject,
    owner: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
    members: [],
    lists: [
      {
        id: 'list-1',
        title: 'To Do',
        position: 1000,
        archived: false,
        color: 'blue',
        cards: [
          {
            id: 'card-1',
            title: 'First Task',
            description: 'Task description',
            position: 1000,
            dueDate: null,
            assignees: [],
            labels: [],
            checklists: [],
          },
        ],
        _count: { cards: 1 },
      },
      {
        id: 'list-2',
        title: 'In Progress',
        position: 2000,
        archived: false,
        color: 'yellow',
        cards: [],
        _count: { cards: 0 },
      },
    ],
    _count: {
      lists: 2,
      cards: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWithAuth.mockResolvedValue({ user: mockUser });
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
  });

  describe('GET /api/projects - Projects Listing', () => {
    it('should return projects with new schema (lists/cards counts)', async () => {
      const mockProjectsResponse = [mockProjectWithLists];

      mockPrisma.project.findMany.mockResolvedValue(mockProjectsResponse);
      mockPrisma.project.count.mockResolvedValue(1);

      const request = createMockRequest('http://localhost:3000/api/projects');
      const response = await getProjects(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.projects).toHaveLength(1);

      const project = data.data.projects[0];
      expect(project.lists).toBeDefined();
      expect(project.lists).toHaveLength(2);
      expect(project._count.lists).toBe(2);
      expect(project._count.cards).toBe(1);

      // Should include list details
      expect(project.lists[0].title).toBe('To Do');
      expect(project.lists[0].cards).toHaveLength(1);
      expect(project.lists[1].title).toBe('In Progress');
      expect(project.lists[1].cards).toHaveLength(0);
    });

    it('should handle pagination correctly', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProjectWithLists]);
      mockPrisma.project.count.mockResolvedValue(25);

      const request = createMockRequest(
        'http://localhost:3000/api/projects?page=2&limit=10'
      );
      const response = await getProjects(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });

      // Verify skip/take parameters
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page 2 - 1) * limit 10
          take: 10,
        })
      );
    });

    it('should handle search functionality', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProjectWithLists]);
      mockPrisma.project.count.mockResolvedValue(1);

      const request = createMockRequest(
        'http://localhost:3000/api/projects?search=test'
      );
      const response = await getProjects(request);

      expect(response.status).toBe(200);

      // Verify search was applied in where clause
      const findManyCall = mockPrisma.project.findMany.mock.calls[0][0];
      expect(findManyCall.where.AND).toBeDefined();
      expect(findManyCall.where.AND[1].OR).toEqual([
        { title: { contains: 'test', mode: 'insensitive' } },
        { description: { contains: 'test', mode: 'insensitive' } },
      ]);
    });

    it('should include proper nested data', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProjectWithLists]);
      mockPrisma.project.count.mockResolvedValue(1);

      const request = createMockRequest('http://localhost:3000/api/projects');
      const response = await getProjects(request);

      // Verify include clause has lists instead of columns
      const findManyCall = mockPrisma.project.findMany.mock.calls[0][0];
      expect(findManyCall.include.lists).toBeDefined();
      expect(findManyCall.include.columns).toBeUndefined();
      expect(findManyCall.include._count.select.lists).toBeDefined();
      expect(findManyCall.include._count.select.cards).toBeDefined();
    });
  });

  describe('POST /api/projects - Project Creation', () => {
    it('should create project with default lists instead of columns', async () => {
      const mockCreatedProject = {
        ...mockProject,
        lists: [
          {
            id: 'list-1',
            title: 'To Do',
            color: 'gray',
            position: 1000,
            projectId: 'project-1',
          },
          {
            id: 'list-2',
            title: 'In Progress',
            color: 'blue',
            position: 2000,
            projectId: 'project-1',
          },
          {
            id: 'list-3',
            title: 'Done',
            color: 'green',
            position: 3000,
            projectId: 'project-1',
          },
        ],
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          project: {
            create: jest.fn().mockResolvedValue(mockProject),
          },
          projectList: {
            create: jest.fn().mockImplementation((data) => ({
              id: `list-${data.data.position / 1000}`,
              ...data.data,
            })),
          },
        });
      });

      const requestBody = {
        title: 'Test Project',
        description: 'Test description',
        defaultLists: [
          { title: 'To Do', color: 'gray' },
          { title: 'In Progress', color: 'blue' },
          { title: 'Done', color: 'green' },
        ],
      };

      const request = createMockRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createProject(request);

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Test Project');
    });

    it('should validate required fields', async () => {
      const request = createMockRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await createProject(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Project title is required');
    });

    it('should limit maximum number of default lists', async () => {
      const requestBody = {
        title: 'Test Project',
        defaultLists: Array.from({ length: 15 }, (_, i) => ({
          title: `List ${i + 1}`,
          color: 'blue',
        })),
      };

      const request = createMockRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createProject(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Maximum 10 lists allowed per project');
    });
  });

  describe('GET /api/projects/[id]/board - Board Data', () => {
    const mockBoardData = {
      id: 'project-1',
      title: 'Test Project',
      description: 'Test project description',
      background: '#f8f9fa',
      visibility: 'TEAM',
      starred: false,
      ownerId: 'user-1',
      lists: [
        {
          id: 'list-1',
          title: 'To Do',
          position: 1000,
          archived: false,
          color: 'blue',
          cards: [
            {
              id: 'card-1',
              title: 'First Task',
              description: 'Task description',
              position: 1000,
              dueDate: null,
              assignees: [],
              labels: [],
              checklists: [],
            },
          ],
        },
      ],
      members: [],
      labels: [],
    };

    it('should return complete board data with lists and cards', async () => {
      // Mock project member check - user is a member
      mockPrisma.projectMember.findFirst.mockResolvedValue({
        projectId: 'project-1',
        userId: 'user-1',
      });

      // Mock BoardUtils
      const { BoardUtils } = require('@/lib/board-utils');
      BoardUtils.getBoardData.mockResolvedValue(mockBoardData);

      const request = createMockRequest(
        'http://localhost:3000/api/projects/project-1/board'
      );
      const response = await getBoardData(request, {
        params: { id: 'project-1' },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.lists).toBeDefined();
      expect(data.data.lists).toHaveLength(1);
      expect(data.data.lists[0].cards).toHaveLength(1);
    });

    it('should check project access permissions', async () => {
      // Mock project member check - user is not a member
      mockPrisma.projectMember.findFirst.mockResolvedValue(null);

      // Mock project check - user is not owner and project is private
      mockPrisma.project.findUnique.mockResolvedValue({
        ownerId: 'other-user',
        visibility: 'PRIVATE',
      });

      const request = createMockRequest(
        'http://localhost:3000/api/projects/project-1/board'
      );
      const response = await getBoardData(request, {
        params: { id: 'project-1' },
      });

      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toBe('Access denied');
    });

    it('should allow access for project owner', async () => {
      // Mock project member check - user is not a member
      mockPrisma.projectMember.findFirst.mockResolvedValue(null);

      // Mock project check - user is the owner
      mockPrisma.project.findUnique.mockResolvedValue({
        ownerId: 'user-1', // Same as mockUser.id
        visibility: 'PRIVATE',
      });

      // Mock BoardUtils
      const { BoardUtils } = require('@/lib/board-utils');
      BoardUtils.getBoardData.mockResolvedValue(mockBoardData);

      const request = createMockRequest(
        'http://localhost:3000/api/projects/project-1/board'
      );
      const response = await getBoardData(request, {
        params: { id: 'project-1' },
      });

      expect(response.status).toBe(200);
    });

    it('should allow access for public projects', async () => {
      // Mock project member check - user is not a member
      mockPrisma.projectMember.findFirst.mockResolvedValue(null);

      // Mock project check - project is public
      mockPrisma.project.findUnique.mockResolvedValue({
        ownerId: 'other-user',
        visibility: 'PUBLIC',
      });

      // Mock BoardUtils
      const { BoardUtils } = require('@/lib/board-utils');
      BoardUtils.getBoardData.mockResolvedValue(mockBoardData);

      const request = createMockRequest(
        'http://localhost:3000/api/projects/project-1/board'
      );
      const response = await getBoardData(request, {
        params: { id: 'project-1' },
      });

      expect(response.status).toBe(200);
    });

    it('should handle non-existent projects', async () => {
      // Mock project member check - user is not a member
      mockPrisma.projectMember.findFirst.mockResolvedValue(null);

      // Mock project check - project doesn't exist
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const request = createMockRequest(
        'http://localhost:3000/api/projects/nonexistent/board'
      );
      const response = await getBoardData(request, {
        params: { id: 'nonexistent' },
      });

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Project not found');
    });
  });

  describe('API Error Handling', () => {
    it('should handle authentication errors', async () => {
      mockWithAuth.mockRejectedValue(new Error('Authentication failed'));

      const request = createMockRequest('http://localhost:3000/api/projects');
      const response = await getProjects(request);

      expect(response.status).toBe(500);
    });

    it('should handle database errors', async () => {
      mockPrisma.project.findMany.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createMockRequest('http://localhost:3000/api/projects');
      const response = await getProjects(request);

      expect(response.status).toBe(500);
    });

    it('should handle invalid JSON in request body', async () => {
      const request = createMockRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await createProject(request);

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/projects/[id] - Ordering and status', () => {
    it('computes statusOrder using destIndex when provided', async () => {
      const { PATCH } = require('../projects/[id]/route');
      // Existing project status and owner
      mockPrisma.project.findUnique.mockResolvedValue({
        ownerId: 'user-1',
        status: 'planning',
      });
      // Target column has two items with large gaps
      mockPrisma.project.findMany.mockResolvedValue([
        { id: 'a', statusOrder: 1000 },
        { id: 'b', statusOrder: 5000 },
      ]);
      mockPrisma.project.update.mockResolvedValue({
        id: 'p1',
        status: 'in-progress',
        statusOrder: 3000,
      });

      const req = createMockRequest('http://localhost:3000/api/projects/p1', {
        method: 'PATCH',
        body: JSON.stringify({ destStatus: 'In Progress', destIndex: 1 }),
      });

      const res = await PATCH(req, { params: { id: 'p1' } });
      expect(res.status).toBe(200);
      // Ensure compute used neighboring orders and set status
      expect(mockPrisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'in-progress',
            statusOrder: expect.any(Number),
          }),
        })
      );
    });

    it('PATCH followed by GET reflects updated status (persistence across refetch)', async () => {
      const { PATCH } = require('../projects/[id]/route');
      const { GET: listProjects } = require('../projects/route');

      // Existing project status and owner
      mockPrisma.project.findUnique.mockResolvedValue({
        ownerId: 'user-1',
        status: 'planning',
      });
      // Target column neighbors for compute
      mockPrisma.project.findMany.mockResolvedValueOnce([
        { id: 'a', statusOrder: 1000 },
        { id: 'b', statusOrder: 5000 },
      ]);
      // Update result
      mockPrisma.project.update.mockResolvedValue({
        id: 'p1',
        status: 'in-progress',
        statusOrder: 3000,
      });

      const patchReq = createMockRequest(
        'http://localhost:3000/api/projects/p1',
        {
          method: 'PATCH',
          body: JSON.stringify({ destStatus: 'In Progress', destIndex: 1 }),
        }
      );
      const patchRes = await PATCH(patchReq, { params: { id: 'p1' } });
      expect(patchRes.status).toBe(200);

      // Now GET projects should reflect updated status
      mockPrisma.project.findMany.mockResolvedValueOnce([
        {
          id: 'p1',
          title: 'Test',
          description: '',
          color: '#3b82f6',
          archived: false,
          status: 'in-progress',
          statusOrder: 3000,
          createdAt: new Date(),
          updatedAt: new Date(),
          background: null,
          visibility: 'TEAM',
          starred: false,
          template: false,
          ownerId: 'user-1',
          owner: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
          members: [],
          lists: [],
          _count: { lists: 0 },
        },
      ]);
      mockPrisma.project.count.mockResolvedValueOnce(1);

      const listReq = createMockRequest('http://localhost:3000/api/projects');
      const listRes = await listProjects(listReq);
      expect(listRes.status).toBe(200);
      const listJson = await listRes.json();
      const listed = listJson?.data?.projects?.[0];
      expect(listed.status).toBe('in-progress');
    });
  });
});
