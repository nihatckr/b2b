import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
} from "@apollo/client/errors";
import { setContext } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { RemoveTypenameFromVariablesLink } from "@apollo/client/link/remove-typename";

const removeTypenameLink = new RemoveTypenameFromVariablesLink();

// Log any GraphQL errors, protocol errors, or network error that occurred
const errorLink = new ErrorLink(({ error }) => {
  // Only log errors in development mode to avoid console spam
  if (process.env.NODE_ENV === "development") {
    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    } else if (CombinedProtocolErrors.is(error)) {
      error.errors.forEach(({ message, extensions }) =>
        console.log(
          `[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(
            extensions
          )}`
        )
      );
    } else {
      console.error(`[Network error]: ${error}`);
    }
  }
});

// Authentication link that adds JWT token to headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const cache = new InMemoryCache();
const link = ApolloLink.from([
  removeTypenameLink,
  errorLink,
  authLink,
  httpLink,
]);

export const apolloClient = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-and-network",
    },
  },
});
