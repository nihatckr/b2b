import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      companyId?: string;
      backendToken?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: string;
    companyId?: string;
    backendToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    companyId?: string;
    backendToken?: string;
  }
}

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
      allowDangerousEmailAccountLinking: true,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.backendToken = user.backendToken;
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
