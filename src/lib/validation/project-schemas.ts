import { z } from 'zod';

// Base schemas for reusable validation
export const prioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const projectColorSchema = z
  .string()
  .regex(
    /^(#[0-9A-F]{6}|blue|red|green|yellow|purple|orange|gray)$/i,
    'Color must be a valid hex code or predefined color'
  );

export const cuidSchema = z.string().cuid('Invalid ID format');

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  );

// Task-related schemas
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .nullable(),
  columnId: cuidSchema,
  position: z.number().int().min(0, 'Position must be non-negative'),
  priority: prioritySchema.default('MEDIUM'),
  dueDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional()
    .nullable(),
  assigneeId: cuidSchema.optional().nullable(),
  estimatedHours: z
    .number()
    .int()
    .min(0, 'Estimated hours must be non-negative')
    .max(9999, 'Estimated hours must be reasonable')
    .optional()
    .nullable(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .default([])
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .nullable(),
  columnId: cuidSchema.optional(),
  position: z.number().int().min(0, 'Position must be non-negative').optional(),
  priority: prioritySchema.optional(),
  dueDate: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .optional()
    .nullable(),
  completed: z.boolean().optional(),
  assigneeId: cuidSchema.optional().nullable(),
  estimatedHours: z
    .number()
    .int()
    .min(0, 'Estimated hours must be non-negative')
    .max(9999, 'Estimated hours must be reasonable')
    .optional()
    .nullable(),
  actualHours: z
    .number()
    .int()
    .min(0, 'Actual hours must be non-negative')
    .max(9999, 'Actual hours must be reasonable')
    .optional()
    .nullable(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(cuidSchema).min(1).max(50),
  updates: updateTaskSchema.omit({ tags: true }),
});

export const bulkPositionUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        taskId: cuidSchema,
        columnId: cuidSchema.optional(),
        position: z.number().int().min(0).optional(),
      })
    )
    .min(1)
    .max(100),
});

export const taskFilterSchema = z.object({
  assigneeId: cuidSchema.optional(),
  priority: prioritySchema.optional(),
  completed: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  dueAfter: z.string().datetime().optional(),
  dueBefore: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
});

// Column-related schemas
export const createColumnSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(50, 'Title must be at most 50 characters'),
  color: projectColorSchema.default('gray'),
  position: z.number().int().min(0, 'Position must be non-negative'),
  projectId: cuidSchema,
});

export const updateColumnSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(50, 'Title must be at most 50 characters')
    .optional(),
  color: projectColorSchema.optional(),
  position: z.number().int().min(0, 'Position must be non-negative').optional(),
});

export const reorderColumnsSchema = z.object({
  columnOrders: z
    .array(
      z.object({
        id: cuidSchema,
        position: z.number().int().min(0),
      })
    )
    .min(1, 'At least one column is required'),
});

// Project-related schemas
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  color: projectColorSchema.default('blue'),
  defaultLists: z
    .array(
      z.object({
        title: z.string().min(1).max(50),
        color: projectColorSchema.default('gray'),
      })
    )
    .min(1, 'At least one list is required')
    .max(10, 'Maximum 10 lists allowed')
    .default([
      { title: 'To Do', color: 'gray' },
      { title: 'In Progress', color: 'blue' },
      { title: 'Done', color: 'green' },
    ]),
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .nullable(),
  color: projectColorSchema.optional(),
  archived: z.boolean().optional(),
});

// Project member schemas
export const addProjectMemberSchema = z.object({
  userId: cuidSchema,
  role: z.enum(['VIEWER', 'MEMBER', 'ADMIN']).default('MEMBER'),
});

export const updateProjectMemberSchema = z.object({
  role: z.enum(['VIEWER', 'MEMBER', 'ADMIN']),
});

export const inviteProjectMemberSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['VIEWER', 'MEMBER', 'ADMIN']).default('MEMBER'),
});

// Task attachment schemas
export const createTaskAttachmentSchema = z.object({
  taskId: cuidSchema,
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long'),
  url: z.string().url('Valid URL is required'),
  size: z
    .number()
    .int()
    .min(1, 'File size must be positive')
    .max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB limit
  type: z.string().regex(/^[a-zA-Z0-9\/\-\.]+$/, 'Invalid file type format'),
});

// Search and pagination schemas
export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be positive')
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .default('20'),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title', 'priority', 'dueDate'])
    .default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const projectSearchSchema = z
  .object({
    search: z.string().max(100).optional(),
    archived: z.boolean().optional(),
    ownerId: cuidSchema.optional(),
  })
  .merge(paginationSchema);

export const taskSearchSchema = taskFilterSchema.merge(paginationSchema);

// API response schemas for type safety
export const apiErrorSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});

export const apiSuccessSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

// Form validation helpers
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkUpdateTasksInput = z.infer<typeof bulkUpdateTasksSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
export type UpdateProjectMemberInput = z.infer<
  typeof updateProjectMemberSchema
>;
export type InviteProjectMemberInput = z.infer<
  typeof inviteProjectMemberSchema
>;

export type CreateTaskAttachmentInput = z.infer<
  typeof createTaskAttachmentSchema
>;

export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProjectSearchInput = z.infer<typeof projectSearchSchema>;
export type TaskSearchInput = z.infer<typeof taskSearchSchema>;

/**
 * Validate request body with error handling
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
):
  | { success: true; data: T }
  | { success: false; error: string; details?: any } {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      error: 'Invalid request body',
    };
  }
}

/**
 * Validate query parameters with error handling
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  params: URLSearchParams | Record<string, string | string[]>
):
  | { success: true; data: T }
  | { success: false; error: string; details?: any } {
  try {
    // Convert URLSearchParams to object if needed
    const paramsObj =
      params instanceof URLSearchParams
        ? Object.fromEntries(params.entries())
        : params;

    const data = schema.parse(paramsObj);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid query parameters',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      error: 'Invalid query parameters',
    };
  }
}
