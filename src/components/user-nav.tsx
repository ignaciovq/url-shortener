"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, signOut, useIsAuthenticated } from "@/lib/auth-client";
import {
  Settings,
  LayoutDashboard,
  LogOut,
  CreditCard,
  Link as LinkIcon,
  User as UserIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function   UserNav() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  if(pathname === "/sign-in" || pathname === "/sign-up") {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Link
      href="/sign-in"
      className="
        group
        relative
        flex items-center gap-1.5
        px-2 py-1.5
        rounded-full
        transition-all duration-200 ease-out
        hover:bg-black/[0.03]
        dark:hover:bg-white/[0.06]
        
        /* Importante: min touch target de 44px */
        min-h-[44px]
        
        /* Animación de expansión horizontal */
        overflow-hidden
      "
      aria-label="Sign in to your account"
    >
      {/* Icono - siempre visible */}
      <UserIcon 
        className="
          w-6.5 h-6.5
          text-white-100/40
          dark:text-white-50/40
          transition-opacity duration-200
          group-hover:text-white-900
          dark:group-hover:text-white-100
          flex-shrink-0
        "
        strokeWidth={1.5}
      />
      
      {/* Texto - aparece en hover */}
      <span 
        className="
          text-sm font-normal
          text-gray-900
          dark:text-gray-100
          
          opacity-0
          max-w-0
          
          group-hover:opacity-100
          group-hover:max-w-[100px]
          
          transition-all duration-200 ease-out
          
          whitespace-nowrap
          overflow-hidden
        "
      >
        Sign in
      </span>
    </Link>
    );
  }

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.image || undefined} alt={user?.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {!user?.emailVerified && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Email not verified
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/urls" className="cursor-pointer">
            <LinkIcon className="mr-2 h-4 w-4" />
            My URLs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        {user?.role === "premium" && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/billing" className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}