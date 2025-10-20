"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireEmailVerified?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireEmailVerified = false,
  redirectTo = "/sign-in",
}: AuthGuardProps) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.isPending) return;

    if (!session.data) {
      router.push(redirectTo);
      return;
    }

    if (requireEmailVerified && !session.data.user.emailVerified) {
      router.push("/verify-email");
    }
  }, [session.isPending, session.data, requireEmailVerified, redirectTo, router]);

  // Loading state
  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated
  if (!session.data) {
    return null;
  }

  // Email verification required but not verified
  if (requireEmailVerified && !session.data.user.emailVerified) {
    return null;
  }

  // Authenticated
  return <>{children}</>;
}