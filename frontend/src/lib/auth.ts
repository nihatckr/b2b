import { AuthOperationLoginDocument, AuthOperationSignupDocument, AuthRefreshTokenDocument } from "@/__generated__/graphql";
import { print } from "graphql";
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
                query: print(AuthOperationLoginDocument),
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

          // data.data.login is already an object, no need to parse
          const loginResult = data.data.login;

          // Reset rate limit on successful login
          resetRateLimit(credentials.email);

          return {
            id: String(loginResult.user.id),
            email: loginResult.user.email,
            name: loginResult.user.name || "",
            role: loginResult.user.role,
            companyId: loginResult.user.companyId,
            companyType: loginResult.user.companyType,
            backendToken: loginResult.token,
            permissions: loginResult.user.permissions || undefined,
            isCompanyOwner: loginResult.user.isCompanyOwner || false,
            department: loginResult.user.department || undefined,
            jobTitle: loginResult.user.jobTitle || undefined,
            emailVerified: loginResult.user.emailVerified || false,
          };
        } catch (error) {
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
                query: print(AuthOperationSignupDocument),
                variables: {
                  email: user.email,
                  name: user.name || user.email.split("@")[0],
                },
              }),
            }
          );

          const data = await response.json();

          if (data.errors) {
            return true;
          }

          if (data.data?.signupOAuth) {
            // data.data.signupOAuth is already an object, no need to parse
            const signupResult = data.data.signupOAuth;
            user.backendToken = signupResult.token;
            user.id = String(signupResult.user.id);
            user.role = signupResult.user.role;
            user.companyId = signupResult.user.companyId;
            user.companyType = signupResult.user.companyType;
            user.permissions = signupResult.user.permissions || undefined;
            user.isCompanyOwner = signupResult.user.isCompanyOwner || false;
            user.department = signupResult.user.department || undefined;
            user.jobTitle = signupResult.user.jobTitle || undefined;
            user.emailVerified = signupResult.user.emailVerified || false;
          }
        } catch (error) {
          // Silent fail - user can still sign in
        }
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.companyType = user.companyType;
        token.backendToken = user.backendToken;
        token.permissions = user.permissions;
        token.isCompanyOwner = user.isCompanyOwner;
        token.department = user.department;
        token.jobTitle = user.jobTitle;
        token.emailVerified = typeof user.emailVerified === 'boolean'
          ? user.emailVerified
          : user.emailVerified instanceof Date
            ? true
            : undefined;
      }

      // Refresh token rotation (token > 12 hours old)
      const now = Math.floor(Date.now() / 1000);
      const tokenAge = token.iat ? now - Number(token.iat) : 0;
      const twelveHours = 12 * 60 * 60;

      if (tokenAge > twelveHours && token.backendToken && trigger !== "update") {
        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.backendToken}`,
              },
              body: JSON.stringify({
                query: print(AuthRefreshTokenDocument),
              }),
            }
          );

          const data = await response.json();

          if (data.data?.refreshToken) {
            token.backendToken = data.data.refreshToken;
            token.iat = now; // Update issued at time
            console.log(`🔄 Token refreshed for user: ${token.email}`);
          }
        } catch (error) {
          console.error("❌ Token refresh failed:", error);
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
        session.user.companyType = token.companyType;
        session.user.backendToken = token.backendToken;
        session.user.permissions = token.permissions;
        session.user.isCompanyOwner = token.isCompanyOwner;
        session.user.department = token.department;
        session.user.jobTitle = token.jobTitle;
        session.user.emailVerified = token.emailVerified;
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
    maxAge: 7 * 24 * 60 * 60, // 7 days (match backend)
    updateAge: 60 * 60, // Update session every hour
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60, // 7 days (match backend)
  },
};
