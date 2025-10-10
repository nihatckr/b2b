
import { compare, hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { applyMiddleware } from 'graphql-middleware'
import {
  intArg,
  makeSchema,
  nonNull,
  objectType,
  stringArg,
  inputObjectType,
  arg,
  asNexusMethod,
  enumType,
} from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import type { Context } from './context'
import { APP_SECRET, getUserId, requireAdmin, validatePassword, validateEmail } from './utils'
import { permissions } from './permission'

// Import error classes for better error handling
class ValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

class AuthorizationError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}


export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Role = enumType({
  name: 'Role',
  members: ['ADMIN', 'MANUFACTURE', 'CUSTOMER'],
})

const SampleType = enumType({
  name: 'SampleType',
  members: ['STANDARD', 'REVISION', 'CUSTOM'],
})

const SampleStatus = enumType({
  name: 'SampleStatus',
  members: ['REQUESTED', 'REVIEWED', 'QUOTE_SENT', 'APPROVED', 'REJECTED', 'IN_PRODUCTION', 'PRODUCTION_COMPLETE', 'SHIPPED', 'DELIVERED'],
})

const OrderStatus = enumType({
  name: 'OrderStatus',
  members: ['PENDING', 'REVIEWED', 'QUOTE_SENT', 'CONFIRMED', 'REJECTED', 'IN_PRODUCTION', 'PRODUCTION_COMPLETE', 'QUALITY_CHECK', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
})

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allUsers', {
      type: 'User',
      args: {
        searchString: stringArg(),
        role: arg({ type: 'Role' }),
        skip: intArg(),
        take: intArg(),
      },
      resolve: async (_parent, args, context: Context) => {
        // Only admin can access all users
        await requireAdmin(context)

        // Build where conditions
        const searchConditions: any = {}

        // Role filter
        if (args.role) {
          searchConditions.role = args.role
        }

        // Search in name or email
        if (args.searchString) {
          searchConditions.OR = [
            { email: { contains: args.searchString, mode: 'insensitive' } },
            { name: { contains: args.searchString, mode: 'insensitive' } },
          ]
        }

        return context.prisma.user.findMany({
          where: searchConditions,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: args.skip || undefined,
          take: args.take || undefined,
        })
      },
    })

    // User statistics for admin dashboard
    t.field('userStats', {
      type: 'UserStats',
      resolve: async (_parent, _args, context: Context) => {
        // Only admin can access user statistics
        await requireAdmin(context)

        const totalUsers = await context.prisma.user.count()
        const adminCount = await context.prisma.user.count({ where: { role: 'ADMIN' } })
        const manufactureCount = await context.prisma.user.count({ where: { role: 'MANUFACTURE' } })
        const customerCount = await context.prisma.user.count({ where: { role: 'CUSTOMER' } })

        return {
          totalUsers,
          adminCount,
          manufactureCount,
          customerCount,
        }
      },
    })

    t.field('me', {
      type: 'User',
      resolve: async (parent, args, context: Context) => {
        const userId = getUserId(context)
        if (!userId) return null

        return context.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        })
      },
    })

    // Business Queries
    t.list.field('collections', {
      type: 'Collection',
      args: {
        searchString: stringArg(),
        categoryId: intArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: (_parent, args, context: Context) => {
        const where: any = { isActive: true }

        if (args.searchString) {
          where.OR = [
            { name: { contains: args.searchString, mode: 'insensitive' } },
            { description: { contains: args.searchString, mode: 'insensitive' } },
          ]
        }

        if (args.categoryId) {
          where.categoryId = args.categoryId
        }

        return context.prisma.collection.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: args.skip || undefined,
          take: args.take || undefined,
        })
      },
    })

    t.list.field('categories', {
      type: 'Category',
      args: {
        searchString: stringArg(),
        skip: intArg(),
        take: intArg(),
      },
      resolve: (_parent, args, context: Context) => {
        const where: any = {}

        if (args.searchString) {
          where.OR = [
            { name: { contains: args.searchString, mode: 'insensitive' } },
            { description: { contains: args.searchString, mode: 'insensitive' } },
          ]
        }

        return context.prisma.category.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: args.skip || undefined,
          take: args.take || undefined,
        })
      },
    })


  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: 'AuthPayload',
      args: {
        name: stringArg(),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        role: arg({ type: 'Role' }),
      },
      resolve: async (_parent, args, context: Context) => {
        // Development debug logging
        if (process.env.NODE_ENV !== 'production') {
          console.log('\n📝 SIGNUP ATTEMPT:', args.email)
        }

        // 1. Input validation
        if (!args.email || args.email.trim() === '') {
          throw new Error('Email address is required.')
        }

        if (!args.password || args.password.trim() === '') {
          throw new Error('Password is required.')
        }

        // 2. Import validation functions
        const { validateEmail, validatePassword } = await import('./utils')

        // 3. Email format validation
        try {
          validateEmail(args.email)
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('❌ SIGNUP FAIL: Invalid email format')
            throw new Error('Please enter a valid email address (e.g., user@example.com).')
          }
          throw new Error('Invalid email format.')
        }

        // 4. Password validation
        try {
          validatePassword(args.password)
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('❌ SIGNUP FAIL: Password too weak')
          }
          throw error // validatePassword already has good messages
        }

        // 5. Check if user already exists
        const existingUser = await context.prisma.user.findUnique({
          where: { email: args.email }
        })
        if (existingUser) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('❌ SIGNUP FAIL: Email already exists:', args.email)
            throw new Error('An account with this email already exists. Please login instead.')
          }
          throw new Error('User with this email already exists')
        }

        // 6. Create user
        const hashedPassword = await hash(args.password, 10)
        const user = await context.prisma.user.create({
          data: {
            name: args.name,
            email: args.email,
            password: hashedPassword,
            role: args.role || 'CUSTOMER', // Default role
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        })

        const token = sign({ userId: user.id.toString() }, APP_SECRET, { expiresIn: '7d' })

        // 7. Success logging
        if (process.env.NODE_ENV !== 'production') {
          console.log('\n' + '='.repeat(60))
          console.log('✅ SIGNUP SUCCESS')
          console.log('📧 Email:', user.email)
          console.log('👤 User ID:', user.id)
          console.log('🏷️ Role:', user.role)
          console.log('🔑 Bearer Token:')
          console.log(`Bearer ${token}`)
          console.log('⏱️ Expires: 7 days')
          console.log('='.repeat(60) + '\n')
        }

        return {
          token,
          user,
        }
      },
    })

    t.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, { email, password }, context: Context) => {
        // Development debug logging
        if (process.env.NODE_ENV !== 'production') {
          console.log('\n🔐 LOGIN ATTEMPT:', email)
        }

        // Validate input
        const { validateEmail } = await import('./utils')
        try {
          validateEmail(email)
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('❌ VALIDATION FAIL: Invalid email format')
          }
          throw error
        }

        // Find user
        const user = await context.prisma.user.findUnique({
          where: { email }
        })
        if (!user) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('❌ LOGIN FAIL: User not found for email:', email)
            throw new Error('Email address not found. Please check your email or sign up.')
          }
          throw new Error('Invalid email or password')
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ USER FOUND:', { id: user.id, email: user.email, role: user.role })
        }

        // Verify password
        const passwordValid = await compare(password, user.password)
        if (!passwordValid) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('❌ LOGIN FAIL: Password mismatch for user:', user.email)
            throw new Error('Password is incorrect. Please check your password.')
          }
          throw new Error('Invalid email or password')
        }

        const token = sign({ userId: user.id.toString() }, APP_SECRET, { expiresIn: '7d' })

        // Login başarılı - Bearer token'ı göster
        if (process.env.NODE_ENV !== 'production') {
          console.log('\n' + '='.repeat(60))
          console.log('✅ LOGIN SUCCESS')
          console.log('📧 Email:', user.email)
          console.log('👤 User ID:', user.id)
          console.log('🏷️ Role:', user.role)
          console.log('🔑 Bearer Token:')
          console.log(`Bearer ${token}`)
          console.log('⏱️ Expires: 7 days')
          console.log('='.repeat(60) + '\n')
        }

        // Return user without password
        const userWithoutPassword = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }

        return {
          token,
          user: userWithoutPassword,
        }
      },
    })



    // Admin-only mutations
    t.field('updateUserRole', {
      type: 'User',
      args: {
        userId: nonNull(intArg()),
        role: nonNull(arg({ type: 'Role' })),
      },
      resolve: async (_, args, context: Context) => {
        const { requireAdmin } = await import('./utils')
        await requireAdmin(context)

        return context.prisma.user.update({
          where: { id: args.userId },
          data: { role: args.role },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        })
      },
    })

    t.field('deleteUser', {
      type: 'User',
      args: {
        userId: nonNull(intArg()),
      },
      resolve: async (_, args, context: Context) => {
        const { requireAdmin, getUserId } = await import('./utils')
        const currentUser = await requireAdmin(context)
        const currentUserId = getUserId(context)

        // Self-delete protection
        if (args.userId === currentUserId) {
          throw new Error('You cannot delete your own account. Please contact another administrator.')
        }

        // Check if user exists
        const targetUser = await context.prisma.user.findUnique({
          where: { id: args.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        })

        if (!targetUser) {
          throw new Error('User not found.')
        }

        // Log deletion (development)
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🗑️ USER DELETE: Admin ${currentUserId} deleting user ${args.userId} (${targetUser.email})`)
        }

        // Delete user (cascade delete collections automatically due to foreign key)
        const deletedUser = await context.prisma.user.delete({
          where: { id: args.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        })

        // Success log
        if (process.env.NODE_ENV !== 'production') {
          console.log(`✅ USER DELETED: ${deletedUser.email} (ID: ${deletedUser.id})`)
        }

        return deletedUser
      },
    })

    // Reset user password by admin
    t.field('resetUserPassword', {
      type: 'User',
      args: {
        userId: nonNull(intArg()),
        newPassword: nonNull(stringArg()),
      },
      resolve: async (_, { userId, newPassword }, context: Context) => {
        // Only admin can reset user passwords
        requireAdmin(context)

        try {
          // Validate new password
          try {
            validatePassword(newPassword)
          } catch (error: any) {
            throw new ValidationError(error.message, 'INVALID_PASSWORD')
          }

          // Check if target user exists
          const targetUser = await context.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true }
          })

          if (!targetUser) {
            throw new ValidationError(
              'User not found',
              'USER_NOT_FOUND'
            )
          }

          // Admin cannot reset another admin's password for security
          if (targetUser.role === 'ADMIN') {
            throw new AuthorizationError(
              'Cannot reset another admin user password',
              'ADMIN_RESET_FORBIDDEN'
            )
          }

          // Hash the new password
          const hashedPassword = await hash(newPassword, 10)

          // Update user password
          const updatedUser = await context.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            }
          })

          // Success log
          if (process.env.NODE_ENV !== 'production') {
            console.log(`🔐 PASSWORD RESET BY ADMIN: ${targetUser.email} (ID: ${targetUser.id})`)
          }

          return updatedUser

        } catch (error: any) {
          // Error log
          if (process.env.NODE_ENV !== 'production') {
            console.error('❌ ADMIN PASSWORD RESET ERROR:', error.message)
          }
          throw error
        }
      },
    })

    // Logout mutation
    t.field('logout', {
      type: 'Boolean',
      resolve: async (_, __, context: Context) => {
        const userId = getUserId(context)

        if (process.env.NODE_ENV !== 'production') {
          console.log(`👋 LOGOUT: User ${userId || 'anonymous'} logged out`)
        }

        // JWT is stateless, so we just return success
        // Frontend should remove token from localStorage
        return true
      },
    })

    // Update user profile
    t.field('updateProfile', {
      type: 'User',
      args: {
        name: stringArg(),
        email: stringArg(),
      },
      resolve: async (_, args, context: Context) => {
        const { requireAuth } = await import('./utils')
        const userId = requireAuth(context)

        // Input validation
        const updates: any = {}

        if (args.name !== undefined && args.name !== null) {
          if (args.name.trim() === '') {
            throw new Error('Name cannot be empty.')
          }
          updates.name = args.name.trim()
        }

        if (args.email !== undefined && args.email !== null) {
          const { validateEmail } = await import('./utils')

          try {
            validateEmail(args.email)
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              throw new Error('Please enter a valid email address (e.g., user@example.com).')
            }
            throw new Error('Invalid email format.')
          }

          // Check if email already exists (but not current user)
          const existingUser = await context.prisma.user.findUnique({
            where: { email: args.email }
          })

          if (existingUser && existingUser.id !== userId) {
            if (process.env.NODE_ENV !== 'production') {
              throw new Error('This email is already in use by another account.')
            }
            throw new Error('Email already exists.')
          }

          updates.email = args.email.toLowerCase().trim()
        }

        // If no updates provided
        if (Object.keys(updates).length === 0) {
          throw new Error('Please provide at least one field to update (name or email).')
        }

        // Update user
        const updatedUser = await context.prisma.user.update({
          where: { id: userId },
          data: updates,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        })

        // Success logging
        if (process.env.NODE_ENV !== 'production') {
          console.log(`👤 PROFILE UPDATED: User ${userId} updated:`, updates)
        }

        return updatedUser
      },
    })

    // Change password
    t.field('changePassword', {
      type: 'Boolean',
      args: {
        currentPassword: nonNull(stringArg()),
        newPassword: nonNull(stringArg()),
      },
      resolve: async (_, args, context: Context) => {
        const { requireAuth, validatePassword } = await import('./utils')
        const userId = requireAuth(context)

        // Get current user
        const user = await context.prisma.user.findUnique({
          where: { id: userId }
        })

        if (!user) {
          throw new Error('User not found.')
        }

        // Verify current password
        const currentPasswordValid = await compare(args.currentPassword, user.password)
        if (!currentPasswordValid) {
          if (process.env.NODE_ENV !== 'production') {
            throw new Error('Current password is incorrect.')
          }
          throw new Error('Current password is incorrect.')
        }

        // Validate new password
        try {
          validatePassword(args.newPassword)
        } catch (error) {
          throw error // validatePassword has good error messages
        }

        // Check if new password is different from current
        const samePassword = await compare(args.newPassword, user.password)
        if (samePassword) {
          throw new Error('New password must be different from current password.')
        }

        // Hash new password and update
        const hashedNewPassword = await hash(args.newPassword, 10)
        await context.prisma.user.update({
          where: { id: userId },
          data: {
            password: hashedNewPassword,
            updatedAt: new Date() // Force update timestamp
          }
        })

        // Success logging
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🔐 PASSWORD CHANGED: User ${userId} (${user.email}) changed password`)
        }

        return true
      },
    })
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.string('name')
    t.nonNull.string('email')
    t.nonNull.field('role', { type: 'Role' })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

// Business Models
const Collection = objectType({
  name: 'Collection',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.string('name')
    t.string('description')
    t.nonNull.float('price')
    t.nonNull.string('sku')
    t.nonNull.int('stock')
    t.string('images') // JSON string
    t.nonNull.boolean('isActive')
  },
})

const Category = objectType({
  name: 'Category',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.string('name')
    t.string('description')
  },
})

const Sample = objectType({
  name: 'Sample',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.string('sampleNumber')
    t.nonNull.field('sampleType', { type: 'SampleType' })
    t.nonNull.field('status', { type: 'SampleStatus' })
    t.string('customerNote')
    t.string('manufacturerResponse')
  },
})

const Order = objectType({
  name: 'Order',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.int('quantity')
    t.nonNull.field('status', { type: 'OrderStatus' })
  },
})

const SampleProduction = objectType({
  name: 'SampleProduction',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.field('status', { type: 'SampleStatus' })
  },
})

const OrderProduction = objectType({
  name: 'OrderProduction',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.field('status', { type: 'OrderStatus' })
  },
})

const Question = objectType({
  name: 'Question',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.string('question')
    t.string('answer')
    t.nonNull.boolean('isAnswered')
    t.nonNull.boolean('isPublic')
  },
})

const Review = objectType({
  name: 'Review',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.int('rating')
    t.string('comment')
  },
})

const UserStats = objectType({
  name: 'UserStats',
  definition(t) {
    t.nonNull.int('totalUsers')
    t.nonNull.int('adminCount')
    t.nonNull.int('manufactureCount')
    t.nonNull.int('customerCount')
  },
})

const SortOrder = enumType({
  name: 'SortOrder',
  members: ['asc', 'desc'],
})

const UserUniqueInput = inputObjectType({
  name: 'UserUniqueInput',
  definition(t) {
    t.int('id')
    t.string('email')
  },
})

const UserCreateInput = inputObjectType({
  name: 'UserCreateInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('name')
  },
})

const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token')
    t.field('user', { type: 'User' })
  },
})

const schemaWithoutPermissions = makeSchema({
  types: [
    Query,
    Mutation,
    Collection,
    Category,
    Sample,
    Order,
    SampleProduction,
    OrderProduction,
    Question,
    Review,
    User,
    UserStats,
    Role,
    SampleType,
    SampleStatus,
    OrderStatus,
    AuthPayload,
    UserUniqueInput,
    UserCreateInput,
    SortOrder,
    DateTime,
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})

export const schema = applyMiddleware(schemaWithoutPermissions, permissions
)
