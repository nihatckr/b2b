import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { createContext, type Context } from './context'
import { schema } from './schema'

const server = new ApolloServer<Context>({
  schema,
  // Production'da stacktrace gizle
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  // Custom error formatting
  formatError: (err) => {
    // Production'da hassas bilgileri gizle
    if (process.env.NODE_ENV === 'production') {
      // Sadece güvenli error bilgilerini döndür
      return {
        message: err.message,
        extensions: {
          code: err.extensions?.code || 'INTERNAL_SERVER_ERROR'
        }
      }
    }
    // Development'da full error döndür
    return err
  }
})

startStandaloneServer(server, {
  context: async ({ req }) => createContext({ req })
}).then(({ url }) => {
  console.log(`\
    🚀 Server ready at: ${url}
    ⭐️ See sample queries: http://pris.ly/e/ts/graphql-auth#using-the-graphql-api`,
  );
})
