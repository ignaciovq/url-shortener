"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthGuard requireEmailVerified>
      <div className="container py-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your URLs, view analytics, and configure settings.
            </p>
          </div>

          <Tabs value={pathname} className="space-y-4">
            <TabsList>
              <Link href="/dashboard">
                <TabsTrigger value="/dashboard">Overview</TabsTrigger>
              </Link>
              <Link href="/dashboard/urls">
                <TabsTrigger value="/dashboard/urls">My URLs</TabsTrigger>
              </Link>
              <Link href="/dashboard/analytics">
                <TabsTrigger value="/dashboard/analytics">Analytics</TabsTrigger>
              </Link>
              <Link href="/dashboard/settings">
                <TabsTrigger value="/dashboard/settings">Settings</TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>

          {children}
        </div>
      </div>
    </AuthGuard>
  );
}