import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      companyId?: string;
      companyType?: string;
      backendToken?: string;
      permissions?: string; // JSON string of user permissions
      isCompanyOwner?: boolean;
      department?: string;
      jobTitle?: string;
      emailVerified?: boolean;
    };
       accessToken?: string; // JWT access token
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    companyId?: string;
    companyType?: string;
    backendToken?: string;
    permissions?: string; // JSON string of user permissions
    isCompanyOwner?: boolean;
    department?: string;
    jobTitle?: string;
    emailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    companyId?: string;
    companyType?: string;
    backendToken?: string;
    permissions?: string; // JSON string of user permissions
    isCompanyOwner?: boolean;
    department?: string;
    jobTitle?: string;
    emailVerified?: boolean;
    iat?: number;
  }
}
