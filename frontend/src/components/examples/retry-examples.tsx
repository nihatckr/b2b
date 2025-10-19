/**
 * URQL Retry Examples
 *
 * Manuel retry örnekleri. Auto-retry exchange yerine manuel retry kullanıyoruz.
 */

'use client';

import { useMutation, useQuery } from '@/hooks/useGraphQL';
import { getErrorMessage, isRetryableError, retryMutation } from '@/lib/urql-retry';
import { useState } from 'react';
import { toast } from 'sonner';
import { gql } from 'urql';

// ============================================
// Example 1: Basic Retry Button
// ============================================

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: Int!, $name: String!) {
    updateUser(id: $id, name: $name) {
      id
      name
    }
  }
`;

export function BasicRetryExample() {
  const [result, executeMutation] = useMutation(UPDATE_USER_MUTATION);

  const handleUpdate = async () => {
    const result = await executeMutation({ id: 1, name: 'New Name' });

    if (result.error) {
      toast.error(getErrorMessage(result.error), {
        action: isRetryableError(result.error)
          ? {
              label: 'Tekrar Dene',
              onClick: () => handleUpdate(),
            }
          : undefined,
      });
    } else {
      toast.success('Güncellendi!');
    }
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={result.fetching}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {result.fetching ? 'Kaydediliyor...' : 'Kaydet'}
    </button>
  );
}

// ============================================
// Example 2: Auto Retry with Progress
// ============================================

export function AutoRetryExample() {
  const [result, executeMutation] = useMutation(UPDATE_USER_MUTATION);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  const handleUpdate = async () => {
    setRetryCount(0);

    try {
      await retryMutation(
        () => executeMutation({ id: 1, name: 'New Name' }),
        {
          maxAttempts: maxRetries,
          onRetry: (attempt, error) => {
            setRetryCount(attempt);
            toast.loading(`Tekrar deneniyor... (${attempt}/${maxRetries})`, {
              id: 'retry-toast',
            });
          },
        }
      );

      toast.success('Başarılı!', { id: 'retry-toast' });
    } catch (error: any) {
      toast.error(getErrorMessage(error), { id: 'retry-toast' });
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleUpdate}
        disabled={result.fetching}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {result.fetching ? 'Kaydediliyor...' : 'Kaydet'}
      </button>

      {retryCount > 0 && (
        <div className="text-sm text-gray-600">
          Deneme {retryCount}/{maxRetries}
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 3: Query Refresh Button
// ============================================

const GET_USER_QUERY = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

export function QueryRefreshExample() {
  const [result, reexecuteQuery] = useQuery({
    query: GET_USER_QUERY,
    variables: { id: 1 },
  });

  const handleRefresh = () => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  };

  if (result.error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded space-y-2">
        <p>{getErrorMessage(result.error)}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div>
      <div>{result.data?.user?.name}</div>
      <button
        onClick={handleRefresh}
        disabled={result.fetching}
        className="mt-2 px-3 py-1 bg-gray-200 rounded text-sm"
      >
        🔄 Yenile
      </button>
    </div>
  );
}

// ============================================
// Example 4: Form Submission with Retry
// ============================================

export function FormWithRetry() {
  const [result, executeMutation] = useMutation(UPDATE_USER_MUTATION);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await retryMutation(
        () => executeMutation({ id: 1, name: formData.name }),
        { maxAttempts: 3 }
      );

      if (result.data) {
        toast.success('Kaydedildi!');
        setFormData({ name: '' });
      }
    } catch (error: any) {
      // Error handling
      if (error.response?.status === 401) {
        toast.error('Oturumunuz sonlanmış. Lütfen tekrar giriş yapın.');
        // Redirect to login
      } else if (isRetryableError(error)) {
        toast.error('İşlem başarısız. Lütfen tekrar deneyin.', {
          action: {
            label: 'Tekrar Dene',
            onClick: () => handleSubmit(e),
          },
        });
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ name: e.target.value })}
        placeholder="İsim"
        className="w-full px-3 py-2 border rounded"
      />

      <button
        type="submit"
        disabled={result.fetching}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded
          disabled:opacity-50"
      >
        {result.fetching ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  );
}

// ============================================
// Example 5: Smart Retry (Network vs Server)
// ============================================

export function SmartRetryExample() {
  const [result, executeMutation] = useMutation(UPDATE_USER_MUTATION);

  const handleUpdate = async () => {
    const result = await executeMutation({ id: 1, name: 'New Name' });

    if (result.error) {
      // Network error - auto retry
      if (result.error.networkError) {
        toast.loading('Bağlantı hatası, tekrar deneniyor...', {
          id: 'retry',
        });

        setTimeout(async () => {
          const retryResult = await executeMutation({ id: 1, name: 'New Name' });

          if (retryResult.error) {
            toast.error('Bağlantı kurulamadı', { id: 'retry' });
          } else {
            toast.success('Başarılı!', { id: 'retry' });
          }
        }, 2000);
      }
      // Auth error - redirect
      else if (result.error.response?.status === 401) {
        toast.error('Oturumunuz sonlanmış');
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 1000);
      }
      // Validation error - show message
      else {
        toast.error(getErrorMessage(result.error));
      }
    }
  };

  return (
    <button onClick={handleUpdate}>Smart Retry</button>
  );
}

// ============================================
// Example 6: Optimistic Update with Retry
// ============================================

export function OptimisticRetryExample() {
  const [result, executeMutation] = useMutation(UPDATE_USER_MUTATION);
  const [displayName, setDisplayName] = useState('Current Name');

  const handleUpdate = async () => {
    const newName = 'New Name';

    // Optimistic update
    setDisplayName(newName);

    const result = await executeMutation({ id: 1, name: newName });

    if (result.error) {
      // Revert optimistic update
      setDisplayName('Current Name');

      toast.error('Güncellenemedi', {
        action: {
          label: 'Tekrar Dene',
          onClick: () => handleUpdate(),
        },
      });
    } else {
      toast.success('Güncellendi!');
    }
  };

  return (
    <div>
      <div>İsim: {displayName}</div>
      <button onClick={handleUpdate}>Güncelle</button>
    </div>
  );
}
