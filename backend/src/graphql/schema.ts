import { builder } from './builder';

// Import all types
import './types';

// Import all queries
import './queries';

// Build and export the GraphQL schema
export const schema = builder.toSchema();
