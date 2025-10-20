"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

const GITHUB_LOGOS = {
  dark: "/github-logo/github-mark-white.svg",
  light: "/github-logo/github-mark.svg",
} as const;

export function GithubLogo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const variant = resolvedTheme === "light" ? "light" : "dark";

  return (
    <Image
      src={GITHUB_LOGOS[variant]}
      alt="GitHub"
      width={20}
      height={20}
      className={className}
      priority
    />
  );
}
