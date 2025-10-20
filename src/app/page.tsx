import { UrlShortener } from '@/components/url-shortener';

export default function Home() {
  return (
    <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 gap-y-12 pb-8 sm:pb-12 lg:pb-16 xl:pb-20 h-full">
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
  );
}
