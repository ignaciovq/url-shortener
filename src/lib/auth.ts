import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { sendEmail, emailTemplates } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),

  // Basic configuration
  trustedOrigins: [process.env.BETTER_AUTH_URL!],

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, url }: { user: { name: string; email: string }; url: string }) => {
      const template = emailTemplates.verification(user.name, url);
      await sendEmail({
        to: user.email,
        ...template
      });
    },
    sendResetPassword: async ({ user, url }: { user: { name: string; email: string }; url: string }) => {
      const template = emailTemplates.passwordReset(user.name, url);
      await sendEmail({
        to: user.email,
        ...template
      });
    },
    onPasswordReset: async ({ user }: { user: { email: string } }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },

  // Email verification configuration
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  // OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      scope: ["email", "profile"],
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      scope: ["user:email"],
    },
  },

  // User configuration with additional fields
  user: {
    additionalFields: {
      premiumUntil: {
        type: "date",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
    },
  },

  // Plugins
  plugins: [
    nextCookies(), // Must be last plugin for server actions support
  ],

  // Advanced configuration
  advanced: {
    generateId: false, // Use database auto-generated IDs
    cookiePrefix: "url-shortener",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

// Export types for TypeScript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;