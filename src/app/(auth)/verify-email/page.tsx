"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail, sendVerificationEmail, useUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useUser();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerification = useCallback(async () => {
    if (!token) return;

    setVerifying(true);
    try {
      await verifyEmail({ query: { token } });
      setVerified(true);
      toast.success("Email verified successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to verify email";
      toast.error(errorMessage);
      console.error("Verification error:", error);
    } finally {
      setVerifying(false);
    }
  }, [token, router]);

  useEffect(() => {
    if (token && !verifying && !verified) {
      handleVerification();
    }
  }, [token, verifying, verified, handleVerification]);

  const handleResendEmail = async () => {
    if (!user?.email) {
      toast.error("No email found. Please sign in again.");
      return;
    }

    setResending(true);
    try {
      await sendVerificationEmail({
        email: user.email,
        callbackURL: "/verify-email",
      });
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send verification email";
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  // Verifying state
  if (verifying) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle>Verifying Email</CardTitle>
          <CardDescription>Please wait while we verify your email address...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Verified state
  if (verified) {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Email Verified
          </CardTitle>
          <CardDescription>Your email has been successfully verified!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Redirecting you to your dashboard...
          </p>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error === "invalid_token") {
    return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Invalid or Expired Token
          </CardTitle>
          <CardDescription>
            The verification link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full"
          >
            {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send New Verification Email
          </Button>
          <Link href="/sign-in" className="block">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Default state - waiting for email verification
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Verify Your Email
        </CardTitle>
        <CardDescription>
          We&apos;ve sent you a verification email. Please check your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm">
            {user?.email ? (
              <>
                Verification email sent to:{" "}
                <span className="font-medium">{user.email}</span>
              </>
            ) : (
              "Please check your email for the verification link."
            )}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email?
          </p>
          <Button
            onClick={handleResendEmail}
            disabled={resending || !user?.email}
            variant="outline"
            className="w-full"
          >
            {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Verification Email
          </Button>
        </div>

        <div className="pt-4 border-t">
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}