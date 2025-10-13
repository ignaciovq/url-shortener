'use client';

import { useState } from 'react';

import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShortenedResult {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
}

export function UrlShortener() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ShortenedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const runViewTransition = (update: () => void) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const documentWithTransition = document as Document & {
        startViewTransition: (callback: () => void) => void;
      };
      documentWithTransition.startViewTransition(() => {
        update();
      });
    } else {
      update();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setCopied(false);

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to shorten URL');
        return;
      }

      runViewTransition(() => {
        setResult(data);
        // Clear form after success
        setUrl('');
      });
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (result?.shortUrl) {
      try {
        await navigator.clipboard.writeText(result.shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const resetForm = () => {
    runViewTransition(() => {
      setResult(null);
      setUrl('');
      setError('');
      setCopied(false);
    });
  };

  return (
    <div
      className="flex w-full flex-col items-center justify-center"
      data-view-transition
    >
      {!result && (
        <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-y-1.5">
          <div className="relative">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a link to shorten"
              className="h-12 pr-14 text-base"
              required
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 shadow-xs sm:hidden"
              disabled={loading}
              aria-label="Shorten URL"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
            </Button>
          </div>
          <div className="hidden select-none items-center justify-end gap-2 text-xs text-muted-foreground sm:flex">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="text-base leading-none">
                  ↵
                </span>
                <span>Hit Enter to shorten</span>
              </>
            )}
          </div>
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </form>
      )}

      {result && (
        <div className="w-full max-w-lg space-y-4 rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-base font-medium text-foreground">Short link ready</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Input type="text" value={result.shortUrl} readOnly />
            <Button type="button" onClick={copyToClipboard} variant="secondary">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>Share it anywhere.</span>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              New
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
