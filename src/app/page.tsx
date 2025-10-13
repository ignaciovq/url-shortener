import { UrlShortener } from '@/components/url-shortener';

export default function Home() {
  return (
    <div className="flex flex-col bg-background text-foreground h-screen pt-20">
      <div className="my-auto min-h-fit">
        {/* Header */}
        <header className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                URL Shortener
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Transform long URLs into short, shareable links
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full flex-1 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            {/* URL Shortener Component */}
            <UrlShortener />
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 mt-auto border-t border-border/40">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Turso, and Drizzle ORM
          </p>
        </div>
      </footer>
    </div>
  );
}
