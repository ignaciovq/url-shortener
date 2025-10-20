"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { GoogleLogo } from "@/components/icons/google-logo";
import { GithubLogo } from "@/components/icons/github-logo";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const form = useForm<SignInFormData | SignUpFormData>({
    resolver: zodResolver(mode === "sign-in" ? signInSchema : signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "sign-up" && { name: "", confirmPassword: "" }),
    },
  });

  const onSubmit = async (data: SignInFormData | SignUpFormData) => {
    setLoading(true);
    try {
      if (mode === "sign-in") {
        await signIn.email({
          email: data.email,
          password: data.password,
          callbackURL: "/dashboard",
        });
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        const signUpData = data as SignUpFormData;
        await signUp.email({
          name: signUpData.name,
          email: signUpData.email,
          password: signUpData.password,
          callbackURL: "/dashboard",
        });
        toast.success("Account created! Please check your email to verify your account.");
        router.push("/verify-email");
      }
    } catch (error) {
      console.error("Auth error:", error);
      const errorObj = error as { status?: number; message?: string };

      if (errorObj.status === 403 && mode === "sign-in") {
        toast.error("Please verify your email before signing in");
      } else if (errorObj.message?.includes("already exists")) {
        toast.error("An account with this email already exists");
      } else {
        toast.error(errorObj.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error(`Failed to sign in with ${provider}`);
      console.error("OAuth error:", error);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          {mode === "sign-in" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "sign-in"
            ? "Sign in to your account to continue"
            : "Sign up to start shortening URLs with premium features"}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {mode === "sign-up" && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...form.register("name" as keyof (SignInFormData | SignUpFormData))}
              disabled={loading}
            />
            {"name" in form.formState.errors && form.formState.errors?.name && (
              <p className="text-sm text-red-500">
                {"name" in form.formState.errors && form.formState.errors.name?.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...form.register("email")}
            disabled={loading}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("password")}
              disabled={loading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {mode === "sign-up" && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...form.register("confirmPassword" as keyof (SignInFormData | SignUpFormData))}
              disabled={loading}
            />
            {"confirmPassword" in form.formState.errors && form.formState.errors?.confirmPassword && (
              <p className="text-sm text-red-500">
                {"confirmPassword" in form.formState.errors && form.formState.errors.confirmPassword?.message}
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "sign-in" ? "Sign In" : "Sign Up"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("google")}
          disabled={loading || oauthLoading !== null}
        >
          {oauthLoading === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleLogo className="mr-2 h-5 w-5" />
          )}
          Sign {mode === "sign-in" ? "in" : "up"} with Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("github")}
          disabled={loading || oauthLoading !== null}
        >
          {oauthLoading === "github" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GithubLogo className="mr-2 h-5 w-5" />
          )}
          Sign {mode === "sign-in" ? "in" : "up"} with GitHub
        </Button>
      </div>

      <div className="text-center text-sm">
        {mode === "sign-in" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium underline">
              Sign up
            </Link>
            <div className="mt-2">
              <Link href="/forgot-password" className="text-muted-foreground underline">
                Forgot password?
              </Link>
            </div>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium underline">
              Sign in
            </Link>
          </>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
