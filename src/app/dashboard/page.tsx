"use client";

import { useUser } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Link as LinkIcon,
  TrendingUp,
  Clock,
  MousePointerClick,
  Plus,
  Calendar,
  Shield,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalUrls: number;
  activeUrls: number;
  totalClicks: number;
  customAliases: number;
}

export default function DashboardPage() {
  const user = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalUrls: 0,
    activeUrls: 0,
    totalClicks: 0,
    customAliases: 0,
  });

  // TODO: Fetch user stats from API
  useEffect(() => {
    // Placeholder data - replace with actual API call
    setStats({
      totalUrls: 12,
      activeUrls: 8,
      totalClicks: 1543,
      customAliases: 5,
    });
  }, []);

  const isPremium = user?.role === "premium" || user?.premiumUntil && new Date(user.premiumUntil) > new Date();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          {isPremium
            ? "You have full access to all premium features."
            : "Upgrade to premium to unlock custom aliases, extended expiration, and advanced analytics."}
        </p>
        {!isPremium && (
          <Link href="/dashboard/billing">
            <Button variant="secondary">
              <Zap className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Create New</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Short URL</div>
              <p className="text-xs text-muted-foreground">
                Shorten a new link
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUrls}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUrls} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Aliases</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customAliases}</div>
            <p className="text-xs text-muted-foreground">
              Premium feature
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent URLs</CardTitle>
            <CardDescription>
              Your recently created short URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                No recent URLs. Create your first one!
              </div>
            </div>
            <Link href="/dashboard/urls" className="block mt-4">
              <Button variant="outline" className="w-full">
                View All URLs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing URLs</CardTitle>
            <CardDescription>
              Your most clicked links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                No data available yet. Start creating URLs!
              </div>
            </div>
            <Link href="/dashboard/analytics" className="block mt-4">
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Features</CardTitle>
          <CardDescription>
            Features available with your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                URL Expiration: {isPremium ? "Up to 1 year" : "7 days"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Custom Aliases: {isPremium ? "Unlimited" : "Not available"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Analytics: {isPremium ? "Advanced" : "Basic"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                URL History: {isPremium ? "Full history" : "Limited"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}