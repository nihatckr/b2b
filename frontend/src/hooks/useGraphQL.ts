/**
 * URQL GraphQL Hooks
 *
 * Modern best practices (2025):
 * - useQuery: Otomatik cache, re-fetch strategies
 * - useMutation: Optimistic updates ready
 * - useSubscription: Real-time support
 *
 * Docs: https://formidable.com/open-source/urql/docs/basics/react-preact/
 */

export { useMutation, useQuery, useSubscription } from "urql";

/**
 * Request Policy Açıklaması:
 *
 * 'cache-first' (default):
 *   - Önce cache'e bak, varsa döndür
 *   - Yoksa network'ten çek
 *   - ✅ En performanslı (önerilen)
 *
 * 'cache-and-network':
 *   - Cache'ten hemen döndür
 *   - Arka planda network'ten güncelle
 *   - ✅ Real-time görünümü için ideal
 *
 * 'network-only':
 *   - Her zaman network'ten çek
 *   - Cache kullanma
 *   - ⚠️ Yavaş ama her zaman fresh data
 *
 * 'cache-only':
 *   - Sadece cache'e bak
 *   - Network isteği yapma
 *   - ✅ Offline support için
 *
 * Örnek Kullanım:
 * ```tsx
 * const [result, reexecuteQuery] = useQuery({
 *   query: MyQuery,
 *   variables: { id: 1 },
 *   requestPolicy: 'cache-and-network', // Real-time update istiyorsan
 * });
 * ```
 */

/**
 * Pause Strategy:
 *
 * Query'leri durdurmak için:
 * ```tsx
 * const [result] = useQuery({
 *   query: MyQuery,
 *   pause: !userId, // userId yoksa query çalışmaz
 * });
 * ```
 */

/**
 * Mutation Optimistic Update:
 *
 * ```tsx
 * const [result, executeMutation] = useMutation(UpdateUser);
 *
 * executeMutation(
 *   { id: 1, name: "Yeni İsim" },
 *   {
 *     optimistic: {
 *       __typename: 'User',
 *       id: 1,
 *       name: "Yeni İsim", // UI'da hemen görünsün
 *     }
 *   }
 * );
 * ```
 */
