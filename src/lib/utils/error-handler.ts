import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'AppError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Common error types
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // File Operations
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // Project Management
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  COLUMN_NOT_FOUND: 'COLUMN_NOT_FOUND',
  INVALID_POSITION: 'INVALID_POSITION',
  CANNOT_DELETE_COLUMN_WITH_TASKS: 'CANNOT_DELETE_COLUMN_WITH_TASKS',

  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * Create standardized error responses
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code: string = ErrorCodes.INTERNAL_ERROR,
  details?: any
): NextResponse {
  const errorResponse: ApiError = {
    message,
    code,
    status,
    ...(details && { details }),
  };

  return NextResponse.json(errorResponse, { status });
}

/**
 * Handle different types of errors and convert them to appropriate API responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle custom AppError
  if (error instanceof AppError) {
    return createErrorResponse(
      error.message,
      error.status,
      error.code,
      error.details
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return createErrorResponse(
      'Validation failed',
      400,
      ErrorCodes.VALIDATION_ERROR,
      { validationErrors: details }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return createErrorResponse(
      'Database connection error',
      503,
      ErrorCodes.CONNECTION_ERROR
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return createErrorResponse(
      'Invalid database query',
      400,
      ErrorCodes.DATABASE_ERROR
    );
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('Unauthorized')) {
      return createErrorResponse(
        'Authentication required',
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    if (error.message.includes('Forbidden')) {
      return createErrorResponse(
        'Insufficient permissions',
        403,
        ErrorCodes.FORBIDDEN
      );
    }

    // Generic error fallback
    return createErrorResponse(
      error.message || 'An unexpected error occurred',
      500,
      ErrorCodes.INTERNAL_ERROR
    );
  }

  // Unknown error type
  return createErrorResponse(
    'An unexpected error occurred',
    500,
    ErrorCodes.INTERNAL_ERROR
  );
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): NextResponse {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      return createErrorResponse(
        `Duplicate value for ${field?.join(', ') || 'field'}`,
        409,
        ErrorCodes.ALREADY_EXISTS,
        { field }
      );

    case 'P2014':
      // Required relation violation
      return createErrorResponse(
        'Invalid relation reference',
        400,
        ErrorCodes.VALIDATION_ERROR
      );

    case 'P2003':
      // Foreign key constraint violation
      return createErrorResponse(
        'Referenced record does not exist',
        400,
        ErrorCodes.CONSTRAINT_VIOLATION
      );

    case 'P2025':
      // Record not found
      return createErrorResponse('Record not found', 404, ErrorCodes.NOT_FOUND);

    case 'P2016':
      // Query interpretation error
      return createErrorResponse(
        'Invalid query parameters',
        400,
        ErrorCodes.INVALID_INPUT
      );

    case 'P2021':
      // Table not found
      return createErrorResponse(
        'Database table not found',
        500,
        ErrorCodes.DATABASE_ERROR
      );

    case 'P2022':
      // Column not found
      return createErrorResponse(
        'Database column not found',
        500,
        ErrorCodes.DATABASE_ERROR
      );

    default:
      return createErrorResponse(
        'Database operation failed',
        500,
        ErrorCodes.DATABASE_ERROR,
        { prismaCode: error.code }
      );
  }
}

/**
 * Throw specific error types for common scenarios
 */
export const throwError = {
  unauthorized: (message: string = 'Authentication required') => {
    throw new AppError(message, 401, ErrorCodes.UNAUTHORIZED);
  },

  forbidden: (message: string = 'Insufficient permissions') => {
    throw new AppError(message, 403, ErrorCodes.FORBIDDEN);
  },

  notFound: (resource: string = 'Resource') => {
    throw new AppError(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
  },

  validation: (message: string, details?: any) => {
    throw new AppError(message, 400, ErrorCodes.VALIDATION_ERROR, details);
  },

  conflict: (message: string) => {
    throw new AppError(message, 409, ErrorCodes.RESOURCE_CONFLICT);
  },

  rateLimit: (message: string = 'Rate limit exceeded') => {
    throw new AppError(message, 429, ErrorCodes.RATE_LIMIT_EXCEEDED);
  },

  projectNotFound: (projectId?: string) => {
    throw new AppError(
      `Project ${projectId ? `with ID ${projectId} ` : ''}not found`,
      404,
      ErrorCodes.PROJECT_NOT_FOUND
    );
  },

  taskNotFound: (taskId?: string) => {
    throw new AppError(
      `Task ${taskId ? `with ID ${taskId} ` : ''}not found`,
      404,
      ErrorCodes.TASK_NOT_FOUND
    );
  },

  columnNotFound: (columnId?: string) => {
    throw new AppError(
      `Column ${columnId ? `with ID ${columnId} ` : ''}not found`,
      404,
      ErrorCodes.COLUMN_NOT_FOUND
    );
  },

  invalidPosition: (message: string = 'Invalid position specified') => {
    throw new AppError(message, 400, ErrorCodes.INVALID_POSITION);
  },

  cannotDeleteColumnWithTasks: () => {
    throw new AppError(
      'Cannot delete column that contains tasks',
      400,
      ErrorCodes.CANNOT_DELETE_COLUMN_WITH_TASKS
    );
  },
};

/**
 * Async error handler wrapper for API routes
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Log errors in a structured format
 */
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
  };

  console.error('Error logged:', JSON.stringify(errorInfo, null, 2));

  // In production, you might want to send this to a logging service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Success response helper
 */
export function createSuccessResponse<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };

  return NextResponse.json(response, { status });
}
