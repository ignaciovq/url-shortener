"use client";

import { createAuthClient } from "better-auth/react";
import type { User } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export commonly used methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  sendVerificationEmail,
  verifyEmail,
  forgetPassword,
  resetPassword,
  changePassword,
  linkSocial,
  unlinkAccount,
} = authClient;

// Helper hooks for common use cases
export function useUser() {
  const session = useSession();
  return session.data?.user as User | null;
}

export function useIsAuthenticated() {
  const session = useSession();
  return !!session.data;
}

export function useIsEmailVerified() {
  const session = useSession();
  return session.data?.user?.emailVerified || false;
}

// Type exports for convenience
export type { Session, User } from "./auth";