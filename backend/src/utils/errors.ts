import { GraphQLError } from "graphql";

/**
 * Custom GraphQL Error Classes
 * These errors will NOT be masked - their messages will be sent to clients
 */

export class AuthenticationError extends GraphQLError {
  constructor(message: string = "Authentication required") {
    super(message, {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string = "You don't have permission to perform this action") {
    super(message, {
      extensions: {
        code: "FORBIDDEN",
        http: { status: 403 },
      },
    });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;

    super(message, {
      extensions: {
        code: "NOT_FOUND",
        resource,
        id,
        http: { status: 404 },
      },
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string, field?: string) {
    super(message, {
      extensions: {
        code: "VALIDATION_ERROR",
        field,
        http: { status: 400 },
      },
    });
  }
}

export class DuplicateError extends GraphQLError {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} '${value}' already exists`, {
      extensions: {
        code: "DUPLICATE_ERROR",
        resource,
        field,
        value,
        http: { status: 409 },
      },
    });
  }
}

export class BusinessLogicError extends GraphQLError {
  constructor(message: string, errorCode?: string) {
    super(message, {
      extensions: {
        code: errorCode || "BUSINESS_LOGIC_ERROR",
        http: { status: 422 },
      },
    });
  }
}

export class RateLimitError extends GraphQLError {
  constructor(message: string = "Too many requests, please try again later") {
    super(message, {
      extensions: {
        code: "RATE_LIMIT_EXCEEDED",
        http: { status: 429 },
      },
    });
  }
}

export class FileUploadError extends GraphQLError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, {
      extensions: {
        code: "FILE_UPLOAD_ERROR",
        ...details,
        http: { status: 400 },
      },
    });
  }
}

/**
 * Helper function to check if user is authenticated
 * Throws AuthenticationError if not
 */
export function requireAuth(userId: number | undefined | null): asserts userId is number {
  if (!userId) {
    throw new AuthenticationError();
  }
}

/**
 * Helper function to check user permissions
 */
export function requirePermission(
  hasPermission: boolean,
  message?: string
): asserts hasPermission {
  if (!hasPermission) {
    throw new ForbiddenError(message);
  }
}
