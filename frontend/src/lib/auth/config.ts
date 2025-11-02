import { print } from "graphql";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import {
  MutationLoginDocument,
  MutationRefreshTokenDocument,
  MutationSignupOAuthDocument,
} from "../../__generated__/graphql";
import { checkRateLimit, resetRateLimit } from "../security/rate-limit";
import { formatErrorMessage, handleAuthError } from "./error-handler";

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

export type OAuthProviderId = (typeof oauthProviders)[number]["id"];

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
                query: print(MutationLoginDocument),
                variables: {
                  input: {
                    email: credentials.email,
                    password: credentials.password,
                  },
                },
              }),
            }
          );

          // Check HTTP status
          if (!response.ok) {
            const statusMessages: Record<number, string> = {
              400: "Geçersiz istek. Lütfen bilgilerinizi kontrol edin.",
              401: "Email veya şifre hatalı",
              403: "Bu işlem için yetkiniz yok",
              404: "Kullanıcı bulunamadı",
              429: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin.",
              500: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
              503: "Servis geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
            };

            throw new Error(
              statusMessages[response.status] ||
                `Bağlantı hatası (${response.status})`
            );
          }

          const data = await response.json();

          // Handle GraphQL errors
          if (data.errors) {
            const authError = handleAuthError(data, "login");
            throw new Error(formatErrorMessage(authError));
          }

          // Validate response structure
          if (!data.data?.login) {
            throw new Error("Giriş başarısız. Lütfen tekrar deneyin.");
          }

          const loginResult = data.data.login;

          // Validate required fields
          if (
            !loginResult.token ||
            !loginResult.user?.id ||
            !loginResult.user?.email
          ) {
            throw new Error("Geçersiz yanıt formatı. Lütfen tekrar deneyin.");
          }

          // Reset rate limit on successful login
          resetRateLimit(credentials.email);

          return {
            id: String(loginResult.user.id),
            email: loginResult.user.email,
            name: loginResult.user.name || "",
            role: loginResult.user.role || "INDIVIDUAL_CUSTOMER",
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
          // Handle network errors
          if (error instanceof TypeError && error.message.includes("fetch")) {
            throw new Error(
              "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin."
            );
          }

          // Re-throw with error message (already formatted)
          if (error instanceof Error) {
            throw error;
          }

          // Fallback for unknown errors
          throw new Error("Kimlik doğrulama başarısız. Lütfen tekrar deneyin.");
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
      // Handle OAuth providers (GitHub, Google, etc.)
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
                query: print(MutationSignupOAuthDocument),
                variables: {
                  input: {
                    email: user.email,
                    name: user.name || user.email.split("@")[0],
                  },
                },
              }),
            }
          );

          // Handle HTTP errors
          if (!response.ok) {
            console.error(`❌ OAuth signup failed (HTTP ${response.status})`, {
              provider: account.provider,
              email: user.email,
            });
            // Allow sign-in to continue, user can complete setup later
            return true;
          }

          const data = await response.json();

          // Handle GraphQL errors
          if (data.errors) {
            const authError = handleAuthError(data, "oauth-signup");
            console.error(
              "❌ OAuth signup GraphQL error:",
              formatErrorMessage(authError)
            );
            // Allow sign-in to continue
            return true;
          }

          // Validate response structure
          if (data.data?.signupOAuth) {
            const signupResult = data.data.signupOAuth;

            // Validate required fields
            if (!signupResult.token || !signupResult.user?.id) {
              console.error("❌ OAuth signup: Invalid response structure");
              return true;
            }

            // Update user object with backend data
            user.backendToken = signupResult.token;
            user.id = String(signupResult.user.id);
            user.role = signupResult.user.role || "INDIVIDUAL_CUSTOMER";
            user.companyId = signupResult.user.companyId;
            user.companyType = signupResult.user.companyType;
            user.permissions = signupResult.user.permissions || undefined;
            user.isCompanyOwner = signupResult.user.isCompanyOwner || false;
            user.department = signupResult.user.department || undefined;
            user.jobTitle = signupResult.user.jobTitle || undefined;
            user.emailVerified = signupResult.user.emailVerified || false;

            console.log(
              `✅ OAuth signup successful: ${user.email} (${account.provider})`
            );
          }
        } catch (error) {
          // Log error but allow sign-in to continue
          console.error("❌ OAuth signup network error:", error);
          // Silent fail - user can still sign in and complete setup later
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
        token.emailVerified =
          typeof user.emailVerified === "boolean"
            ? user.emailVerified
            : user.emailVerified instanceof Date
            ? true
            : undefined;
      }

      // Refresh token rotation (token > 12 hours old)
      const now = Math.floor(Date.now() / 1000);
      const tokenAge = token.iat ? now - Number(token.iat) : 0;
      const twelveHours = 12 * 60 * 60;

      if (
        tokenAge > twelveHours &&
        token.backendToken &&
        trigger !== "update"
      ) {
        try {
          const response = await fetch(
            process.env.NEXT_PUBLIC_GRAPHQL_URL ||
              "http://localhost:4001/graphql",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.backendToken}`,
              },
              body: JSON.stringify({
                query: print(MutationRefreshTokenDocument),
              }),
            }
          );

          // Handle HTTP errors
          if (!response.ok) {
            console.error(`❌ Token refresh failed (HTTP ${response.status})`, {
              email: token.email,
            });

            // Clear invalid token on 401/403
            if (response.status === 401 || response.status === 403) {
              console.warn("⚠️ Token invalid, clearing session");
              token.backendToken = undefined;
            }

            return token;
          }

          const data = await response.json();

          // Handle GraphQL errors
          if (data.errors) {
            const authError = handleAuthError(data, "token-refresh");
            console.error(
              "❌ Token refresh GraphQL error:",
              formatErrorMessage(authError)
            );

            // Clear token on authentication errors
            if (
              authError.code === "AUTHENTICATION_ERROR" ||
              authError.code === "TOKEN_EXPIRED"
            ) {
              console.warn("⚠️ Token expired, clearing session");
              token.backendToken = undefined;
            }

            return token;
          }

          // Validate response
          if (data.data?.refreshToken) {
            const newToken = data.data.refreshToken;

            // Validate token format (basic check)
            if (typeof newToken === "string" && newToken.length > 0) {
              token.backendToken = newToken;
              token.iat = now; // Update issued at time
              console.log(`🔄 Token refreshed for user: ${token.email}`);
            } else {
              console.error("❌ Token refresh: Invalid token format");
            }
          } else {
            console.error("❌ Token refresh: No token in response");
          }
        } catch (error) {
          // Handle network errors
          if (error instanceof TypeError && error.message.includes("fetch")) {
            console.error("❌ Token refresh: Network error", error);
          } else {
            console.error("❌ Token refresh: Unexpected error", error);
          }
          // Keep existing token if refresh fails due to network issues
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
