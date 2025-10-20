import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { UserNav } from "@/components/user-nav";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "URL Shortener - Shorten & Track Your Links",
  description: "Professional URL shortener with custom aliases, analytics, and premium features for registered users.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center justify-end px-4 sm:px-6 lg:px-8">
                <UserNav />
              </div>
            </header>
            <main className="flex-1">{children}</main>
            {/* Footer */}
            <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-border/40">
              <div className="max-w-7xl mx-auto text-center">
                <p className="text-sm text-muted-foreground">
                  Built with Next.js, Turso, and Drizzle ORM
                </p>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
