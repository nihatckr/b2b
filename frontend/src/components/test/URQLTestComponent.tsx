/**
 * URQL Test Component
 *
 * Bu dosya URQL'in doğru çalıştığını test etmek için örnek bir component.
 * Production'da kaldırılabilir.
 *
 * Not: GraphQL Codegen çalıştıktan sonra '@/__generated__/graphql' import'u aktif olur.
 */

'use client';

import { useMutation, useQuery } from '@/hooks/useGraphQL';
import { gql } from 'urql';

// ============================================
// Example Queries (gql tagged template)
// ============================================

const GetCurrentUserQuery = gql`
  query GetCurrentUser {
    currentUser {
      id
      name
      email
      role
      company {
        id
        name
      }
    }
  }
`;

const GetUsersQuery = gql`
  query GetUsers($first: Int!) {
    users(first: $first) {
      id
      name
      email
    }
  }
`;

// ============================================
// Example Mutations
// ============================================

const UpdateUserNameMutation = gql`
  mutation UpdateUserName($id: Int!, $name: String!) {
    updateUser(id: $id, name: $name) {
      id
      name
      updatedAt
    }
  }
`;

// ============================================
// Test Component
// ============================================

export function URQLTestComponent() {
  // Query test
  const [currentUserResult] = useQuery({
    query: GetCurrentUserQuery,
    requestPolicy: 'cache-first',
  });

  const [usersResult] = useQuery({
    query: GetUsersQuery,
    variables: { first: 5 },
    pause: !currentUserResult.data, // currentUser yüklenince users'ı çek
  });

  // Mutation test
  const [updateResult, executeUpdate] = useMutation(UpdateUserNameMutation);

  const handleUpdateName = async () => {
    const result = await executeUpdate({
      id: 1,
      name: "Updated Name " + Date.now(),
    });

    if (result.data) {
      alert('Name updated!');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">URQL Test Component</h1>

      {/* Current User Query Test */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Current User Query</h2>

        {currentUserResult.fetching && <p>Loading...</p>}
        {currentUserResult.error && (
          <p className="text-red-500">Error: {currentUserResult.error.message}</p>
        )}
        {currentUserResult.data && (
          <div>
            <p><strong>Name:</strong> {currentUserResult.data.currentUser?.name}</p>
            <p><strong>Email:</strong> {currentUserResult.data.currentUser?.email}</p>
            <p><strong>Role:</strong> {currentUserResult.data.currentUser?.role}</p>
            <p><strong>Company:</strong> {currentUserResult.data.currentUser?.company?.name}</p>
          </div>
        )}
      </div>

      {/* Users List Query Test */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Users List (First 5)</h2>

        {usersResult.fetching && <p>Loading...</p>}
        {usersResult.error && (
          <p className="text-red-500">Error: {usersResult.error.message}</p>
        )}
        {usersResult.data && (
          <ul className="space-y-2">
            {usersResult.data.users?.map((user: any) => (
              <li key={user.id} className="border-l-2 pl-2">
                {user.name} - {user.email}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mutation Test */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Update Mutation Test</h2>

        <button
          onClick={handleUpdateName}
          disabled={updateResult.fetching}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {updateResult.fetching ? 'Updating...' : 'Update User Name (ID: 1)'}
        </button>

        {updateResult.error && (
          <p className="text-red-500 mt-2">Error: {updateResult.error.message}</p>
        )}
        {updateResult.data && (
          <p className="text-green-500 mt-2">
            ✅ Updated! New name: {updateResult.data.updateUser?.name}
          </p>
        )}
      </div>

      {/* Cache Status */}
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Cache Status</h2>
        <p>✅ SSR Exchange: Active</p>
        <p>✅ Cache Strategy: cache-first</p>
        <p>✅ Auth: NextAuth integration</p>
        <p>⏳ Normalized Cache: Not installed (optional)</p>
      </div>
    </div>
  );
}
