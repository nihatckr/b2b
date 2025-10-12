import { inputObjectType } from "nexus";

// User creation input (for signup and admin user creation)
export const UserCreateInput = inputObjectType({
  name: "UserCreateInput",
  definition(t) {
    t.nonNull.string("email");
    t.nonNull.string("password");
    t.string("name");
    t.string("username");
    t.string("firstName");
    t.string("lastName");
    t.string("phone");
    t.field("role", { type: "Role" });
    t.int("companyId");
    t.boolean("isActive");
  },
});

// User update input (for profile updates)
export const UserUpdateInput = inputObjectType({
  name: "UserUpdateInput",
  definition(t) {
    t.string("name");
    t.string("username");
    t.string("firstName");
    t.string("lastName");
    t.string("phone");
    t.string("email");
    t.boolean("isActive");
    t.int("companyId");
  },
});

// Admin user update input (includes role changes)
export const AdminUserUpdateInput = inputObjectType({
  name: "AdminUserUpdateInput",
  definition(t) {
    t.string("name");
    t.string("username");
    t.string("firstName");
    t.string("lastName");
    t.string("phone");
    t.string("email");
    t.field("role", { type: "Role" });
    t.boolean("isActive");
    t.int("companyId");
  },
});

// User filter input (for searching and filtering users)
export const UserFilterInput = inputObjectType({
  name: "UserFilterInput",
  definition(t) {
    t.string("searchString"); // Search in name, email, username
    t.field("role", { type: "Role" });
    t.boolean("isActive");
    t.int("companyId");
    t.string("email");
    t.string("name");
    t.string("username");
  },
});

// User sort input
export const UserSortInput = inputObjectType({
  name: "UserSortInput",
  definition(t) {
    t.field("createdAt", { type: "SortOrder" });
    t.field("updatedAt", { type: "SortOrder" });
    t.field("name", { type: "SortOrder" });
    t.field("email", { type: "SortOrder" });
    t.field("role", { type: "SortOrder" });
  },
});

// Password change input
export const PasswordChangeInput = inputObjectType({
  name: "PasswordChangeInput",
  definition(t) {
    t.nonNull.string("currentPassword");
    t.nonNull.string("newPassword");
    t.string("confirmPassword"); // Optional for client-side validation
  },
});

// Login input
export const LoginInput = inputObjectType({
  name: "LoginInput",
  definition(t) {
    t.nonNull.string("email");
    t.nonNull.string("password");
    t.boolean("rememberMe"); // For extended session
  },
});

// Signup input
export const SignupInput = inputObjectType({
  name: "SignupInput",
  definition(t) {
    t.nonNull.string("email");
    t.nonNull.string("password");
    t.string("name");
    t.string("username");
    t.string("firstName");
    t.string("lastName");
    t.string("phone");
    t.field("role", { type: "Role" });
    t.int("companyId");
  },
});

// User pagination input
export const UserPaginationInput = inputObjectType({
  name: "UserPaginationInput",
  definition(t) {
    t.int("skip");
    t.int("take");
    t.field("orderBy", { type: "UserSortInput" });
    t.field("where", { type: "UserFilterInput" });
  },
});

// Password reset input
export const PasswordResetInput = inputObjectType({
  name: "PasswordResetInput",
  definition(t) {
    t.nonNull.string("email");
    t.string("resetToken"); // For token-based reset
    t.string("newPassword"); // When using reset token
  },
});

// Admin password reset input
export const AdminPasswordResetInput = inputObjectType({
  name: "AdminPasswordResetInput",
  definition(t) {
    t.nonNull.int("userId");
    t.nonNull.string("newPassword");
    t.boolean("requireChangeOnLogin"); // Force user to change password on next login
  },
});
