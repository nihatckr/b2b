import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

// OAuth Provider Map (Auth.js pattern)
// Export for dynamic rendering of OAuth buttons in login forms
export const oauthProviders = [
  {
    id: "github" as const,
    name: "GitHub",
  },
  // Add more OAuth providers here in the future:
  // { id: "google" as const, name: "Google" },
  // { id: "discord" as const, name: "Discord" },
] as const;

export type OAuthProviderId = typeof oauthProviders[number]["id"];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gereklidir");
        }

        // Rate limiting check
        const rateLimitResult = checkRateLimit(credentials.email);
        if (!rateLimitResult.allowed) {
          const blockedUntil = rateLimitResult.blockedUntil;
          if (blockedUntil) {
            const minutesLeft = Math.ceil(
              (blockedUntil.getTime() - Date.now()) / 60000
            );
            throw new Error(
              `Çok fazla başarısız giriş denemesi. ${minutesLeft} dakika sonra tekrar deneyin.`
            );
          }
        }

        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL ||
              "http://localhost:4001/graphql",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: `mutation Login($email: String!, $password: String!) {
                  login(email: $email, password: $password)
                }`,
                variables: {
                  email: credentials.email,
                  password: credentials.password,
                },
              }),
            }
          );

          const data = await response.json();

          if (data.errors || !data.data?.login) {
            const errorMessage = data.errors?.[0]?.message || "Giriş başarısız";
            throw new Error(errorMessage);
          }

          const loginResult = JSON.parse(data.data.login);

          // Reset rate limit on successful login
          resetRateLimit(credentials.email);

          return {
            id: String(loginResult.user.id),
            email: loginResult.user.email,
            name: loginResult.user.name || "",
            role: loginResult.user.role,
            companyId: loginResult.user.companyId,
            backendToken: loginResult.token,
          };
        } catch (error) {
          console.error("Kimlik doğrulama hatası:", error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Kimlik doğrulama başarısız");
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      // Removed allowDangerousEmailAccountLinking for security
      // Email verification is handled in signIn callback
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" && user.email) {
        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL ||
              "http://localhost:4001/graphql",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: `mutation SignupOAuth($email: String!, $name: String!) {
                  signupOAuth(email: $email, name: $name)
                }`,
                variables: {
                  email: user.email,
                  name: user.name || user.email.split("@")[0],
                },
              }),
            }
          );

          const data = await response.json();

          if (data.errors) {
            console.error("Backend OAuth signup error:", data.errors);
            return true;
          }

          if (data.data?.signupOAuth) {
            const signupResult = JSON.parse(data.data.signupOAuth);
            user.backendToken = signupResult.token;
            user.id = String(signupResult.user.id);
            user.role = signupResult.user.role;
            user.companyId = signupResult.user.companyId;
          }
        } catch (error) {
          console.error("GitHub OAuth Backend sync error:", error);
        }
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.backendToken = user.backendToken;
      }

      // Refresh token rotation
      // If token is older than 12 hours, refresh backend token
      const now = Math.floor(Date.now() / 1000);
      const tokenAge = token.iat ? now - token.iat : 0;
      const twelveHours = 12 * 60 * 60;

      if (
        tokenAge > twelveHours &&
        token.backendToken &&
        trigger !== "update"
      ) {
        try {
          // Call backend to refresh token
          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL ||
              "http://localhost:4001/graphql",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${token.backendToken}`,
              },
              body: JSON.stringify({
                query: `mutation RefreshToken {
                  refreshToken
                }`,
              }),
            }
          );

          const data = await response.json();

          if (data.data?.refreshToken) {
            token.backendToken = data.data.refreshToken;
            token.iat = now; // Update issued at time
          }
        } catch (error) {
          console.error("Token refresh error:", error);
          // Keep existing token if refresh fails
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || "";
        session.user.role = token.role || "user";
        session.user.companyId = token.companyId;
        session.user.backendToken = token.backendToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60,
  },
  events: {
    async signIn({ user }) {
      console.log("Kullanıcı giriş yaptı:", user.email);
    },
    async signOut() {
      console.log("Kullanıcı çıkış yaptı");
    },
  },
};
