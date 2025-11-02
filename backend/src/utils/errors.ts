import { GraphQLError } from "graphql";

/**
 * Custom GraphQL Error Classes
 * These errors will NOT be masked - their messages will be sent to clients
 */

export class AuthenticationError extends GraphQLError {
  constructor(message: string = "Kimlik doğrulama gerekli") {
    super(message, {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string = "Bu işlemi gerçekleştirmek için yetkiniz yok") {
    super(message, {
      extensions: {
        code: "FORBIDDEN",
        http: { status: 403 },
      },
    });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(resource: string = "Kayıt", id?: string | number) {
    const message = id
      ? `${resource} (ID: ${id}) bulunamadı`
      : `${resource} bulunamadı`;

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
    super(`${resource} için ${field} değeri '${value}' zaten mevcut`, {
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
  constructor(
    message: string = "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin"
  ) {
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
export function requireAuth(
  userId: number | undefined | null
): asserts userId is number {
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

/**
 * Helper function to check admin role
 */
export function requireAdmin(userRole?: string): void {
  if (userRole !== "ADMIN") {
    throw new ForbiddenError("Admin yetkisi gerekli");
  }
}

/**
 * Prisma Error Handler
 * Converts Prisma errors to user-friendly GraphQL errors
 */
export function handlePrismaError(error: any): GraphQLError {
  // Prisma unique constraint violation
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "field";
    return new DuplicateError("Kayıt", field, "bu değer");
  }

  // Prisma record not found
  if (error.code === "P2025") {
    return new NotFoundError("Kayıt");
  }

  // Prisma foreign key constraint
  if (error.code === "P2003") {
    return new ValidationError("İlişkili kayıt bulunamadı");
  }

  // Prisma invalid relation
  if (error.code === "P2014") {
    return new ValidationError("Geçersiz ilişki");
  }

  // Unknown Prisma error - log and return generic error
  console.error("Prisma Error:", error);
  return new GraphQLError("Veritabanı hatası", {
    extensions: {
      code: "DATABASE_ERROR",
      http: { status: 500 },
    },
  });
}

/**
 * Generic Error Handler
 * Converts any error to GraphQL Error
 */
export function handleError(error: unknown): GraphQLError {
  // Already a GraphQL Error
  if (error instanceof GraphQLError) {
    return error;
  }

  // Prisma Error
  if (error && typeof error === "object" && "code" in error) {
    return handlePrismaError(error);
  }

  // Standard JS Error
  if (error instanceof Error) {
    console.error("Unexpected Error:", error);

    // In development, show full error
    if (process.env.NODE_ENV === "development") {
      return new GraphQLError(error.message, {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
          stack: error.stack,
          http: { status: 500 },
        },
      });
    }

    // In production, hide sensitive details
    return new GraphQLError("Bir hata oluştu", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: { status: 500 },
      },
    });
  }

  // Unknown error
  console.error("Unknown Error:", error);
  return new GraphQLError("Bilinmeyen bir hata oluştu", {
    extensions: {
      code: "INTERNAL_SERVER_ERROR",
      http: { status: 500 },
    },
  });
}
