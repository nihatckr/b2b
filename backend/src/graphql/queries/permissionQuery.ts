import {
  canAccessRoute,
  DEPARTMENT_LABELS,
  getUserPermissions,
  hasPermission,
  Permission,
  PERMISSION_LABELS,
} from "../../utils/permissions";
import builder from "../builder";

// Permission check query
builder.queryField("hasPermission", (t) =>
  t.field({
    type: "Boolean",
    args: {
      permission: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: (_root, args, context) => {
      if (!context.user) return false;

      const user = context.user;
      const permission = args.permission as Permission;

      return hasPermission(
        user.role as any,
        user.department as any,
        permission
      );
    },
  })
);

// Get user's all permissions
builder.queryField("myPermissions", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: (_root, _args, context) => {
      if (!context.user) return { permissions: [] };

      const user = context.user;
      const permissions = getUserPermissions(
        user.role as any,
        user.department as any
      );

      return {
        role: user.role,
        department: user.department,
        permissions: permissions.map((p) => ({
          value: p,
          label: PERMISSION_LABELS[p],
        })),
      };
    },
  })
);

// Check route access
builder.queryField("canAccessRoute", (t) =>
  t.field({
    type: "Boolean",
    args: {
      route: t.arg.string({ required: true }),
    },
    authScopes: { user: true },
    resolve: (_root, args, context) => {
      if (!context.user) return false;

      const user = context.user;

      return canAccessRoute(
        user.role as any,
        user.department as any,
        args.route
      );
    },
  })
);

// Get department info
builder.queryField("departmentInfo", (t) =>
  t.field({
    type: "JSON",
    authScopes: { user: true },
    resolve: (_root, _args, context) => {
      if (!context.user) return null;

      const user = context.user;

      if (!user.department) {
        return {
          department: null,
          label: null,
          permissions: [],
        };
      }

      const permissions = getUserPermissions(
        user.role as any,
        user.department as any
      );

      return {
        department: user.department,
        label: DEPARTMENT_LABELS[user.department as any],
        permissions: permissions.map((p) => ({
          value: p,
          label: PERMISSION_LABELS[p],
        })),
      };
    },
  })
);
