import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { arg, intArg, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import { APP_SECRET, getUserId, requireAdmin, validateEmail, validatePassword } from '../utils/user-role-helper';




export const userMutations = (t: any) => {
  t.field("signup", {
    type: "AuthPayload",
    args: {
      input: nonNull(arg({ type: "SignupInput" })),
    },
    resolve: async (_parent: any, { input }: { input: any }, context: Context) => {
      // Development debug logging
      if (process.env.NODE_ENV !== "production") {
        console.log("\n📝 SIGNUP ATTEMPT:", input.email);
      }

      // 1. Input validation
      if (!input.email || input.email.trim() === "") {
        throw new Error("Email address is required.");
      }

      if (!input.password || input.password.trim() === "") {
        throw new Error("Password is required.");
      }

      // 3. Email format validation
      try {
        validateEmail(input.email);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.log("❌ SIGNUP FAIL: Invalid email format");
        }
        throw new Error(
          "Please enter a valid email address (e.g., user@example.com)."
        );
      }

      // 4. Password validation
      try {
        validatePassword(input.password);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.log("❌ SIGNUP FAIL: Password too weak");
        }
        throw error; // validatePassword already has good messages
      }

      // 5. Check if user already exists
      const existingUser = await context.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingUser) {
        if (process.env.NODE_ENV !== "production") {
          console.log("❌ SIGNUP FAIL: Email already exists:", input.email);
        }
        throw new Error(
          "An account with this email already exists. Please login instead."
        );
      }

      // 6. Create user
      const hashedPassword = await hash(input.password, 10);
      const user = await context.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role || "CUSTOMER", // Default role
          username: input.username,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          companyId: input.companyId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const token = sign({ userId: user.id.toString() }, APP_SECRET, {
        expiresIn: "7d",
      });

      // 7. Success logging
      if (process.env.NODE_ENV !== "production") {
        console.log("\n" + "=".repeat(60));
        console.log("✅ SIGNUP SUCCESS");
        console.log("📧 Email:", user.email);
        console.log("👤 User ID:", user.id);
        console.log("🏷️ Role:", user.role);
        console.log("🔑 Bearer Token:");
        console.log(`Bearer ${token}`);
        console.log("⏱️ Expires: 7 days");
        console.log("=".repeat(60) + "\n");
      }

      return {
        token,
        user,
      };
    },
  });

  t.field("login", {
    type: "AuthPayload",
    args: {
      input: nonNull(arg({ type: "LoginInput" })),
    },
    resolve: async (
      _parent: any,
      { input }: { input: any },
      context: Context
    ) => {
      // Development debug logging
      if (process.env.NODE_ENV !== "production") {
        console.log("\n🔐 LOGIN ATTEMPT:", input.email);
      }

      // Validate input
      try {
        validateEmail(input.email);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.log("❌ VALIDATION FAIL: Invalid email format");
        }
        throw error;
      }

      // Find user
      const user = await context.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user) {
        if (process.env.NODE_ENV !== "production") {
          console.log("❌ LOGIN FAIL: User not found for email:", input.email);
        }
        throw new Error(
          "Email address not found. Please check your email or sign up."
        );
      }

      if (process.env.NODE_ENV !== "production") {
        console.log("✅ USER FOUND:", {
          id: user.id,
          email: user.email,
          role: user.role,
        });
      }

      // Verify password
      const passwordValid = await compare(input.password, user.password);
      if (!passwordValid) {
        if (process.env.NODE_ENV !== "production") {
          console.log("❌ LOGIN FAIL: Password mismatch for user:", user.email);
        }
        throw new Error("Password is incorrect. Please check your password.");
      }

      const token = sign({ userId: user.id.toString() }, APP_SECRET, {
        expiresIn: "7d",
      });

      // Login başarılı - Bearer token'ı göster
      if (process.env.NODE_ENV !== "production") {
        console.log("\n" + "=".repeat(60));
        console.log("✅ LOGIN SUCCESS");
        console.log("📧 Email:", user.email);
        console.log("👤 User ID:", user.id);
        console.log("🏷️ Role:", user.role);
        console.log("🔑 Bearer Token:");
        console.log(`Bearer ${token}`);
        console.log("⏱️ Expires: 7 days");
        console.log("=".repeat(60) + "\n");
      }

      // Return user without password
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        token,
        user: userWithoutPassword,
      };
    },
  });

  // Admin-only mutations
  t.field("updateUserRole", {
    type: "User",
    args: {
      userId: nonNull(intArg()),
      role: nonNull(arg({ type: "Role" })),
    },
    resolve: async (_: any, args: any, context: Context) => {
      await requireAdmin(context);

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
        },
      });
    },
  });

  t.field("deleteUser", {
    type: "User",
    args: {
      userId: nonNull(intArg()),
    },
    resolve: async (_: any, args: any, context: Context) => {
      const currentUser = await requireAdmin(context);
      const currentUserId = getUserId(context);

      // Self-delete protection
      if (args.userId === currentUserId) {
        throw new Error(
          "You cannot delete your own account. Please contact another administrator."
        );
      }

      // Check if user exists
      const targetUser = await context.prisma.user.findUnique({
        where: { id: args.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!targetUser) {
        throw new Error("User not found.");
      }

      // Log deletion (development)
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `🗑️ USER DELETE: Admin ${currentUserId} deleting user ${args.userId} (${targetUser.email})`
        );
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
        },
      });

      // Success log
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `✅ USER DELETED: ${deletedUser.email} (ID: ${deletedUser.id})`
        );
      }

      return deletedUser;
    },
  });

  // Reset user password by admin
  t.field("resetUserPassword", {
    type: "User",
    args: {
      userId: nonNull(intArg()),
      newPassword: nonNull(stringArg()),
    },
    resolve: async (_: any, { userId, newPassword }: any, context: Context) => {
      // Only admin can reset user passwords
      requireAdmin(context);

      try {
        // Validate new password
        try {
          validatePassword(newPassword);
        } catch (error: any) {
          throw new Error(error.message);
        }

        // Check if target user exists
        const targetUser = await context.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, role: true },
        });

        if (!targetUser) {
          throw new Error("User not found");
        }

        // Admin cannot reset another admin's password for security
        if (targetUser.role === "ADMIN") {
          throw new Error("Cannot reset another admin user password");
        }

        // Hash the new password
        const hashedPassword = await hash(newPassword, 10);

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
          },
        });

        // Success log
        if (process.env.NODE_ENV !== "production") {
          console.log(
            `🔐 PASSWORD RESET BY ADMIN: ${targetUser.email} (ID: ${targetUser.id})`
          );
        }

        return updatedUser;
      } catch (error: any) {
        // Error log
        if (process.env.NODE_ENV !== "production") {
          console.error("❌ ADMIN PASSWORD RESET ERROR:", error.message);
        }
        throw error;
      }
    },
  });

  // Logout mutation
  t.field("logout", {
    type: "Boolean",
    resolve: async (_: any, __: any, context: Context) => {
      const userId = getUserId(context);

      if (process.env.NODE_ENV !== "production") {
        console.log(`👋 LOGOUT: User ${userId || "anonymous"} logged out`);
      }

      // JWT is stateless, so we just return success
      // Frontend should remove token from localStorage
      return true;
    },
  });

  // Update user profile
  t.field("updateProfile", {
    type: "User",
    args: {
      input: nonNull(arg({ type: "UserUpdateInput" })),
    },
    resolve: async (_: any, { input }: { input: any }, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Input validation
      const updates: any = {};

      // Handle all possible update fields
      if (input.name !== undefined && input.name !== null) {
        if (input.name.trim() === "") {
          throw new Error("Name cannot be empty.");
        }
        updates.name = input.name.trim();
      }

      if (input.username !== undefined && input.username !== null) {
        if (input.username.trim() === "") {
          throw new Error("Username cannot be empty.");
        }
        updates.username = input.username.trim();
      }

      if (input.firstName !== undefined && input.firstName !== null) {
        updates.firstName = input.firstName.trim();
      }

      if (input.lastName !== undefined && input.lastName !== null) {
        updates.lastName = input.lastName.trim();
      }

      if (input.phone !== undefined && input.phone !== null) {
        updates.phone = input.phone.trim();
      }

      if (input.isActive !== undefined && input.isActive !== null) {
        updates.isActive = input.isActive;
      }

      if (input.companyId !== undefined && input.companyId !== null) {
        updates.companyId = input.companyId;
      }

      if (input.email !== undefined && input.email !== null) {
        try {
          validateEmail(input.email);
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            throw new Error(
              "Please enter a valid email address (e.g., user@example.com)."
            );
          }
          throw new Error("Invalid email format.");
        }

        // Check if email already exists (but not current user)
        const existingUser = await context.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser && existingUser.id !== userId) {
          if (process.env.NODE_ENV !== "production") {
            throw new Error("This email is already in use by another account.");
          }
          throw new Error("Email already exists.");
        }

        updates.email = input.email.toLowerCase().trim();
      }

      // If no updates provided
      if (Object.keys(updates).length === 0) {
        throw new Error(
          "Please provide at least one field to update (name or email)."
        );
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
        },
      });

      // Success logging
      if (process.env.NODE_ENV !== "production") {
        console.log(`👤 PROFILE UPDATED: User ${userId} updated:`, updates);
      }

      return updatedUser;
    },
  });

  // Change password
  t.field("changePassword", {
    type: "Boolean",
    args: {
      currentPassword: nonNull(stringArg()),
      newPassword: nonNull(stringArg()),
    },
    resolve: async (_: any, args: any, context: Context) => {
      const userId = getUserId(context);
      if (!userId) {
        throw new Error("Authentication required");
      }

      // Get current user
      const user = await context.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found.");
      }

      // Verify current password
      const currentPasswordValid = await compare(
        args.currentPassword,
        user.password
      );
      if (!currentPasswordValid) {
        if (process.env.NODE_ENV !== "production") {
          throw new Error("Current password is incorrect.");
        }
        throw new Error("Current password is incorrect.");
      }

      // Validate new password
      try {
        validatePassword(args.newPassword);
      } catch (error) {
        throw error; // validatePassword has good error messages
      }

      // Check if new password is different from current
      const samePassword = await compare(args.newPassword, user.password);
      if (samePassword) {
        throw new Error(
          "New password must be different from current password."
        );
      }

      // Hash new password and update
      const hashedNewPassword = await hash(args.newPassword, 10);
      await context.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date(), // Force update timestamp
        },
      });

      // Success logging
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `🔐 PASSWORD CHANGED: User ${userId} (${user.email}) changed password`
        );
      }

      return true;
    },
  });
};
