import { rule, shield, and, or, allow } from 'graphql-shield'

import type { Context } from '../context'
import { getUserId, getUserWithRole } from '../utils'

// Custom error
class AuthenticationError extends Error {
  public extensions: { code: string; statusCode: number }

  constructor(message: string = 'Authentication required. Please login to continue.') {
    super(message)
    this.name = 'AuthenticationError'
    this.extensions = {
      code: 'UNAUTHENTICATED',
      statusCode: 401
    }
  }
}

class AuthorizationError extends Error {
  public extensions: { code: string; statusCode: number }

  constructor(message: string = 'Access denied. Insufficient permissions.') {
    super(message)
    this.name = 'AuthorizationError'
    this.extensions = {
      code: 'FORBIDDEN',
      statusCode: 403
    }
  }
}

const rules = {
  // Basic authentication rule
  isAuthenticatedUser: rule({ cache: 'contextual' })((_parent, _args, context: Context) => {
    const userId = getUserId(context)
    if (!userId) {
      return new AuthenticationError('Please login to access this resource.')
    }
    return Boolean(userId)
  }),

  // Admin role rule
  isAdmin: rule({ cache: 'contextual' })(async (_parent, _args, context: Context) => {
    const user = await getUserWithRole(context)
    if (!user) {
      return new AuthenticationError('Please login with your account to continue.')
    }
    if (user.role !== 'ADMIN') {
      return new AuthorizationError('Administrator privileges required. Contact your system administrator for access.')
    }
    return user.role === 'ADMIN'
  }),

  // Manufacture or Admin rule
  isManufactureOrAdmin: rule({ cache: 'contextual' })(async (_parent, _args, context: Context) => {
    const user = await getUserWithRole(context)
    if (!user) {
      return new AuthenticationError('Please login with your account to continue.')
    }
    if (!['ADMIN', 'MANUFACTURE'].includes(user.role)) {
      return new AuthorizationError('This feature is only available to manufacturers and administrators.')
    }
    return ['ADMIN', 'MANUFACTURE'].includes(user.role)
  }),

  // Collection owner rule
  isCollectionOwner: rule({ cache: 'strict' })(async (_parent, args, context: Context) => {
    const userId = getUserId(context)
    if (!userId) {
      return new AuthenticationError('Please login to access this resource.')
    }

    const collection = await context.prisma.collection.findUnique({
      where: {
        id: Number(args.id),
      },
      include: {
        author: true,
      },
    })

    if (!collection) {
      return new Error('Collection not found.')
    }

    if (userId !== collection.author?.id) {
      return new AuthorizationError('You can only modify your own collections.')
    }

    return userId === collection.author.id
  }),

  // Collection owner or admin rule
  isCollectionOwnerOrAdmin: rule({ cache: 'strict' })(async (_parent, args, context: Context) => {
    const user = await getUserWithRole(context)
    if (!user) {
      return new AuthenticationError('Please login to access this resource.')
    }

    // Admin can access any collection
    if (user.role === 'ADMIN') {
      return true
    }

    // Check if user owns the collection
    const collection = await context.prisma.collection.findUnique({
      where: {
        id: Number(args.id),
      },
      include: {
        author: true,
      },
    })

    if (!collection) {
      return new Error('Collection not found.')
    }

    if (user.id !== collection.author?.id) {
      return new AuthorizationError('You can only access your own collections or be an admin.')
    }

    return user.id === collection.author.id
  }),
}

export const permissions = shield({
  Query: {
    // Public queries (no auth required)
    collections: allow, // Public collections list
    categories: allow, // Public categories list

    // Authenticated user queries
    me: rules.isAuthenticatedUser,

    // Admin only queries
    allUsers: rules.isAdmin,
    userStats: rules.isAdmin,
  },
  Mutation: {
    // Public mutations
    signup: allow,
    login: allow,

    // User profile mutations
    logout: rules.isAuthenticatedUser,
    updateProfile: rules.isAuthenticatedUser,
    changePassword: rules.isAuthenticatedUser,

    // Admin only mutations
    updateUserRole: rules.isAdmin,
    deleteUser: rules.isAdmin,
    resetUserPassword: rules.isAdmin,
  },
  // Type field permissions
  User: {
    // Basic user fields - accessible if you can access user data
    id: allow,
    email: allow,
    name: allow,
    role: allow,
    createdAt: allow,
    updatedAt: allow,
  },
  Collection: {
    // Basic collection fields - accessible if you can access collection data
    id: allow,
    name: allow,
    description: allow,
    price: allow,
    sku: allow,
    stock: allow,
    images: allow,
    isActive: allow,
    createdAt: allow,
    updatedAt: allow,
  },
  Category: {
    // Basic category fields - accessible if you can access category data
    id: allow,
    name: allow,
    description: allow,
    createdAt: allow,
    updatedAt: allow,
  },
  AuthPayload: {
    // Login/Signup response fields - always accessible after successful auth
    token: allow,
    user: allow,
  },
  UserStats: {
    // User statistics fields - accessible if you can access user stats (admin only)
    totalUsers: allow,
    adminCount: allow,
    manufactureCount: allow,
    customerCount: allow,
  },
  Sample: {
    // Basic sample fields
    id: allow,
    sampleNumber: allow,
    sampleType: allow,
    status: allow,
    customerNote: allow,
    manufacturerResponse: allow,
    createdAt: allow,
    updatedAt: allow,
  },
  Order: {
    // Basic order fields
    id: allow,
    quantity: allow,
    status: allow,
    createdAt: allow,
    updatedAt: allow,
  },
  SampleProduction: {
    // Sample production tracking fields
    id: allow,
    status: allow,
    createdAt: allow,
    updatedAt: allow,
  },
  OrderProduction: {
    // Order production tracking fields
    id: allow,
    status: allow,
    createdAt: allow,
    updatedAt: allow,
  },
  Question: {
    // Question fields
    id: allow,
    question: allow,
    answer: allow,
    isAnswered: allow,
    isPublic: allow,
    createdAt: allow,
    updatedAt: allow,
  },
  Review: {
    // Review fields
    id: allow,
    rating: allow,
    comment: allow,
    createdAt: allow,
    updatedAt: allow,
  },
}, {
  // Global shield options
  allowExternalErrors: true, // Allow our custom errors to pass through
  fallbackRule: rule()(() => new AuthorizationError('Access denied. This operation requires authentication.')),
  fallbackError: 'Unexpected authorization error occurred.',
})
