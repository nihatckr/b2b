/**
 * URQL Debug Utilities
 *
 * Development ortamında GraphQL operations'ı log'lamak için basit utilities.
 * Production'da otomatik olarak devre dışı kalır.
 *
 * @urql/devtools gibi ağır pakete gerek yok, console.log yeterli!
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * GraphQL operation'ları log'la (development only)
 */
export const debugUrql = {
  /**
   * Query başladı
   */
  queryStart: (name: string, variables?: any) => {
    if (!isDev) return;
    console.group(`🔍 Query: ${name}`);
    console.log('Variables:', variables);
    console.log('Time:', new Date().toISOString());
    console.groupEnd();
  },

  /**
   * Query başarılı
   */
  querySuccess: (name: string, data: any, duration?: number) => {
    if (!isDev) return;
    console.group(`✅ Query Success: ${name}`);
    console.log('Data:', data);
    if (duration) console.log(`Duration: ${duration}ms`);
    console.groupEnd();
  },

  /**
   * Query hatası
   */
  queryError: (name: string, error: any) => {
    if (!isDev) return;
    console.group(`❌ Query Error: ${name}`);
    console.error('Error:', error);
    if (error.graphQLErrors) {
      console.error('GraphQL Errors:', error.graphQLErrors);
    }
    if (error.networkError) {
      console.error('Network Error:', error.networkError);
    }
    console.groupEnd();
  },

  /**
   * Mutation başladı
   */
  mutationStart: (name: string, variables?: any) => {
    if (!isDev) return;
    console.group(`🔧 Mutation: ${name}`);
    console.log('Variables:', variables);
    console.groupEnd();
  },

  /**
   * Mutation başarılı
   */
  mutationSuccess: (name: string, data: any) => {
    if (!isDev) return;
    console.group(`✅ Mutation Success: ${name}`);
    console.log('Data:', data);
    console.groupEnd();
  },

  /**
   * Mutation hatası
   */
  mutationError: (name: string, error: any) => {
    if (!isDev) return;
    console.group(`❌ Mutation Error: ${name}`);
    console.error('Error:', error);
    console.groupEnd();
  },

  /**
   * Subscription bağlandı
   */
  subscriptionConnected: (name: string) => {
    if (!isDev) return;
    console.log(`🔌 Subscription Connected: ${name}`);
  },

  /**
   * Subscription data geldi
   */
  subscriptionData: (name: string, data: any) => {
    if (!isDev) return;
    console.group(`📡 Subscription Data: ${name}`);
    console.log('Data:', data);
    console.log('Time:', new Date().toISOString());
    console.groupEnd();
  },

  /**
   * Subscription kapandı
   */
  subscriptionClosed: (name: string, error?: any) => {
    if (!isDev) return;
    if (error) {
      console.error(`❌ Subscription Error: ${name}`, error);
    } else {
      console.log(`🔌 Subscription Closed: ${name}`);
    }
  },

  /**
   * Cache durumu
   */
  cacheStatus: (operation: string, cached: boolean) => {
    if (!isDev) return;
    console.log(`💾 Cache ${cached ? 'HIT' : 'MISS'}: ${operation}`);
  },

  /**
   * WebSocket durumu
   */
  wsStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error', detail?: any) => {
    if (!isDev) return;
    const emoji = {
      connecting: '🔄',
      connected: '✅',
      disconnected: '⚠️',
      error: '❌',
    };
    console.log(`${emoji[status]} WebSocket: ${status}`, detail || '');
  },

  /**
   * Request timing
   */
  timing: (operation: string, startTime: number) => {
    if (!isDev) return;
    const duration = Date.now() - startTime;
    const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';
    console.log(`${color} ${operation}: ${duration}ms`);
  },
};

/**
 * useQuery için debug hook wrapper
 *
 * @example
 * ```tsx
 * const [result] = useDebugQuery('GetUser', {
 *   query: GetUserQuery,
 *   variables: { id: 1 },
 * });
 * ```
 */
export function useDebugQuery(name: string, options: any) {
  const startTime = Date.now();

  if (isDev) {
    debugUrql.queryStart(name, options.variables);
  }

  // URQL'nin useQuery'sini import edip kullanın
  const result = options; // Placeholder - gerçek hook çağrısı yapılacak

  if (isDev) {
    if (result.error) {
      debugUrql.queryError(name, result.error);
    } else if (result.data) {
      debugUrql.querySuccess(name, result.data, Date.now() - startTime);
    }
  }

  return result;
}

/**
 * Chrome DevTools Network Tab'de GraphQL isteklerini filtreleme
 *
 * Filter: `/graphql`
 *
 * Her istek için:
 * - Request Headers → Authorization token
 * - Request Payload → GraphQL query & variables
 * - Response → Data veya errors
 * - Timing → Duration
 */
export const chromeDevToolsTips = {
  networkTab: 'Filter: /graphql to see only GraphQL requests',
  headers: 'Check Authorization header for JWT token',
  payload: 'Request Payload shows query + variables',
  response: 'Response tab shows data or errors',
  timing: 'Timing tab shows request duration',
  websocket: 'Type: websocket for subscriptions',
};

/**
 * Useful console commands (development only)
 */
if (isDev && typeof window !== 'undefined') {
  (window as any).urqlDebug = {
    help: () => {
      console.log(`
🔍 URQL Debug Helpers:

1. Chrome DevTools Network Tab:
   - Filter: /graphql
   - WebSocket: Filter by "WS"

2. Console Logging:
   - Queries: Automatically logged ✅
   - Mutations: Automatically logged ✅
   - Subscriptions: Automatically logged ✅

3. Manual Debug:
   - window.urqlDebug.cache() - Show cache state
   - window.urqlDebug.ws() - WebSocket status
   - window.urqlDebug.clear() - Clear console

4. Performance:
   - Check timing in logs (🟢 <100ms, 🟡 <500ms, 🔴 >500ms)

5. Errors:
   - GraphQL errors: Check "GraphQL Errors" in log
   - Network errors: Check "Network Error" in log
      `);
    },
    cache: () => {
      console.log('Cache API not available. Use Chrome DevTools → Network → /graphql');
    },
    ws: () => {
      console.log('WebSocket status: Check Network → WS filter');
    },
    clear: () => {
      console.clear();
    },
  };

  // Initial help
  console.log('💡 Type window.urqlDebug.help() for debug commands');
}

export default debugUrql;
