/**
 * GraphQL Client Module
 *
 * @module lib/graphql
 * @description URQL client configuration with advanced features
 *
 * Features:
 * - Server-Side Rendering (SSR) support
 * - WebSocket subscriptions for real-time updates
 * - Authentication with JWT tokens
 * - Request/Response caching
 * - Optimistic updates
 * - Retry logic with exponential backoff
 * - Debug mode for development
 *
 * Backend Integration:
 * - GraphQL Yoga endpoint: http://localhost:4001/graphql
 * - WebSocket endpoint: ws://localhost:4001/graphql
 * - Authorization: Bearer token from session
 *
 * @see {@link https://formidable.com/open-source/urql/}
 * @version 2.0.0
 */

// Main URQL client hook
export { useUrqlClient } from "./client";

// Debug utilities (development only)
export * from "./debug";

// Retry logic configuration
export * from "./retry";
