"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

const GOOGLE_LOGOS = {
  dark: "/google-logo/Web (mobile + desktop)/svg/dark/web_dark_sq_na.svg",
  light: "/google-logo/Web (mobile + desktop)/svg/light/web_light_sq_na.svg",
} as const;

export function GoogleLogo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const variant = resolvedTheme === "light" ? "light" : "dark";

  return (
    <Image
      src={GOOGLE_LOGOS[variant]}
      alt="Google"
      width={20}
      height={20}
      className={className}
      priority
    />
  );
}
