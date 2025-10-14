import { UrlShortener } from '@/components/url-shortener';

export default function Home() {
  return (
    <div className="min-h-screen grid grid-rows-[1fr_auto] bg-background text-foreground">
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 gap-y-12 pb-8 sm:pb-12 lg:pb-16 xl:pb-20">
        {/* Header */}
         <header className="w-full">
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
        <main className="flex flex-col items-center w-full">
          {/* URL Shortener Component */}
          <UrlShortener />
        </main>
      </div>
      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Turso, and Drizzle ORM
          </p>
        </div>
      </footer>
    </div>
  );
}
