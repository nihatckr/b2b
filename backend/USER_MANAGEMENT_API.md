# 👥 User Management API Documentation

## 📋 Overview

Complete GraphQL API for admin user management with CRUD operations, bulk actions, and activity tracking.

---

## 🔍 Queries

### 1. **users** - Get all users with filters

```graphql
query Users($skip: Int, $take: Int, $role: String, $search: String) {
  users(skip: $skip, take: $take, role: $role, search: $search) {
    id
    email
    name
    role
    department
    jobTitle
    isActive
    isPendingApproval
    emailVerified
    createdAt
    updatedAt
    company {
      id
      name
      type
    }
  }
}
```

- **Auth**: Admin only
- **Filters**:
  - `role`: Filter by user role (ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER)
  - `search`: Search by email or name (case-insensitive)
  - `skip` & `take`: Pagination

---

### 2. **user** - Get single user by ID

```graphql
query User($id: Int!) {
  user(id: $id) {
    id
    email
    name
    firstName
    lastName
    phone
    role
    department
    jobTitle
    isActive
    isPendingApproval
    emailVerified
    avatar
    customAvatar
    bio
    socialLinks
    emailNotifications
    pushNotifications
    language
    timezone
    createdAt
    updatedAt
    company {
      id
      name
      type
      email
    }
  }
}
```

- **Auth**: Authenticated users

---

### 3. **usersCountByRole** - Get user statistics

```graphql
query UsersCountByRole {
  usersCountByRole
}
```

**Response**:

```json
{
  "total": 150,
  "byRole": {
    "ADMIN": 5,
    "COMPANY_OWNER": 20,
    "COMPANY_EMPLOYEE": 85,
    "INDIVIDUAL_CUSTOMER": 40
  },
  "byStatus": {
    "active": 140,
    "inactive": 5,
    "pendingApproval": 5
  }
}
```

- **Auth**: Admin only

---

### 4. **userActivity** - Get user activity details

```graphql
query UserActivity($userId: Int!) {
  userActivity(userId: $userId)
}
```

**Response**:

```json
{
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "COMPANY_EMPLOYEE",
    "department": "PRODUCTION",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "company": {
      "id": 5,
      "name": "ABC Manufacturing",
      "type": "MANUFACTURER"
    }
  },
  "statistics": {
    "samples": 45,
    "orders": 120,
    "collections": 8,
    "tasks": {
      "total": 50,
      "completed": 42,
      "completionRate": 84
    },
    "messages": {
      "sent": 230,
      "received": 180,
      "total": 410
    }
  },
  "recentActivity": {
    "orders": [...],
    "samples": [...]
  }
}
```

- **Auth**: Admin only

---

### 5. **me** - Get current logged-in user

```graphql
query Me {
  me {
    id
    email
    name
    role
    company {
      id
      name
    }
  }
}
```

- **Auth**: Authenticated users

---

## ✏️ Mutations

### 1. **createUser** - Create new user

```graphql
mutation CreateUser(
  $email: String!
  $password: String!
  $name: String!
  $role: String!
) {
  createUser(email: $email, password: $password, name: $name, role: $role) {
    id
    email
    name
    role
    createdAt
  }
}
```

- **Auth**: Admin only
- **Valid Roles**: ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER

---

### 2. **updateUser** - Update user profile

```graphql
mutation UpdateUser(
  $id: Int!
  $name: String
  $email: String
  $phone: String
  $avatar: String
  $bio: String
  $emailNotifications: Boolean
  $pushNotifications: Boolean
  $language: String
  $timezone: String
  $department: String # Admin only
  $jobTitle: String # Admin only
) {
  updateUser(
    id: $id
    name: $name
    email: $email
    phone: $phone
    avatar: $avatar
    bio: $bio
    emailNotifications: $emailNotifications
    pushNotifications: $pushNotifications
    language: $language
    timezone: $timezone
    department: $department
    jobTitle: $jobTitle
  ) {
    id
    name
    email
    updatedAt
  }
}
```

- **Auth**: User can update themselves, Admin can update anyone
- **Note**: `department` and `jobTitle` can only be updated by admins

---

### 3. **deleteUser** - Delete user

```graphql
mutation DeleteUser($id: Int!) {
  deleteUser(id: $id)
}
```

- **Auth**: Admin only
- **Returns**: Boolean (true if successful)

---

### 4. **resetUserPassword** - Reset user password (Admin)

```graphql
mutation ResetUserPassword($userId: Int!, $newPassword: String!) {
  resetUserPassword(userId: $userId, newPassword: $newPassword) {
    id
    email
    name
  }
}
```

- **Auth**: Admin only
- **Use Case**: Admin can reset any user's password

---

### 5. **updateUserRole** - Change user role

```graphql
mutation UpdateUserRole($userId: Int!, $role: String!) {
  updateUserRole(userId: $userId, role: $role) {
    id
    email
    name
    role
  }
}
```

- **Auth**: Admin only
- **Valid Roles**: ADMIN, COMPANY_OWNER, COMPANY_EMPLOYEE, INDIVIDUAL_CUSTOMER, MANUFACTURE, CUSTOMER

---

### 6. **toggleUserStatus** - Activate/Deactivate user

```graphql
mutation ToggleUserStatus($userId: Int!, $isActive: Boolean!) {
  toggleUserStatus(userId: $userId, isActive: $isActive) {
    id
    email
    name
    isActive
  }
}
```

- **Auth**: Admin only

---

### 7. **updateUserCompany** - Assign user to company

```graphql
mutation UpdateUserCompany($userId: Int!, $companyId: Int) {
  updateUserCompany(userId: $userId, companyId: $companyId) {
    id
    email
    name
    company {
      id
      name
    }
  }
}
```

- **Auth**: Admin only
- **Note**: Pass `null` for `companyId` to remove company assignment

---

## 🔥 Bulk Operations

### 1. **bulkToggleUserStatus** - Activate/Deactivate multiple users

```graphql
mutation BulkToggleUserStatus($userIds: [Int!]!, $isActive: Boolean!) {
  bulkToggleUserStatus(userIds: $userIds, isActive: $isActive)
}
```

**Response**:

```json
{
  "success": true,
  "count": 10,
  "message": "10 users activated successfully"
}
```

- **Auth**: Admin only

---

### 2. **bulkDeleteUsers** - Delete multiple users

```graphql
mutation BulkDeleteUsers($userIds: [Int!]!) {
  bulkDeleteUsers(userIds: $userIds)
}
```

**Response**:

```json
{
  "success": true,
  "count": 5,
  "message": "5 users deleted successfully"
}
```

- **Auth**: Admin only
- **Safety**: Cannot delete admin users via bulk action

---

## 🎯 Usage Examples

### Get all active users with pagination

```graphql
query {
  users(skip: 0, take: 20, search: "") {
    id
    name
    email
    role
    isActive
    company {
      name
    }
  }
}
```

### Get users by role

```graphql
query {
  users(role: "COMPANY_EMPLOYEE") {
    id
    name
    email
    department
    company {
      name
    }
  }
}
```

### Search users

```graphql
query {
  users(search: "john") {
    id
    name
    email
  }
}
```

### Get user statistics for dashboard

```graphql
query {
  usersCountByRole
}
```

### View user's full activity

```graphql
query {
  userActivity(userId: 123)
}
```

---

## 🔐 Authorization

All endpoints use Pothos ScopeAuth:

| Scope          | Description                     |
| -------------- | ------------------------------- |
| `public`       | No authentication required      |
| `user`         | Requires any authenticated user |
| `admin`        | Requires ADMIN role             |
| `companyOwner` | Requires COMPANY_OWNER role     |
| `employee`     | Requires COMPANY_EMPLOYEE role  |

---

## 📊 User Roles

| Role                  | Description                                     |
| --------------------- | ----------------------------------------------- |
| `ADMIN`               | Platform administrator (full access)            |
| `COMPANY_OWNER`       | Company owner (manage company users)            |
| `COMPANY_EMPLOYEE`    | Company employee (department-based permissions) |
| `INDIVIDUAL_CUSTOMER` | Individual customer (limited access)            |
| `MANUFACTURE`         | Legacy manufacturer role                        |
| `CUSTOMER`            | Legacy customer role                            |

---

## 🏢 Departments (for COMPANY_EMPLOYEE)

| Department   | Permissions                           |
| ------------ | ------------------------------------- |
| `PURCHASING` | Sample & Order management             |
| `PRODUCTION` | Production tracking & quality control |
| `QUALITY`    | Quality inspections & approvals       |
| `DESIGN`     | Collection & sample design            |
| `SALES`      | Customer relations & quotes           |
| `MANAGEMENT` | Full access to company resources      |

---

## ✅ API Status

- ✅ **users** - Get all users with filters
- ✅ **user** - Get single user
- ✅ **usersCountByRole** - User statistics
- ✅ **userActivity** - User activity details
- ✅ **createUser** - Create user
- ✅ **updateUser** - Update user
- ✅ **deleteUser** - Delete user
- ✅ **resetUserPassword** - Reset password (admin)
- ✅ **updateUserRole** - Change role
- ✅ **toggleUserStatus** - Activate/deactivate
- ✅ **updateUserCompany** - Assign to company
- ✅ **bulkToggleUserStatus** - Bulk activate/deactivate
- ✅ **bulkDeleteUsers** - Bulk delete

---

## 🚀 Next Steps

Frontend implementation needed:

1. ✅ Backend API - Complete
2. ⏳ Admin user management page (frontend)
3. ⏳ User details modal/drawer
4. ⏳ Bulk actions UI
5. ⏳ Activity tracking dashboard
