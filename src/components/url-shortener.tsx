'use client';

import { useState } from 'react';

interface ShortenedResult {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
}

export function UrlShortener() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [useAlias, setUseAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ShortenedResult | null>(null);
  const [copied, setCopied] = useState(false);

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
          alias: useAlias && alias ? alias : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to shorten URL');
        return;
      }

      setResult(data);
      // Clear form after success
      setUrl('');
      setAlias('');
      setUseAlias(false);
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

  const checkAliasAvailability = async () => {
    if (!alias || alias.length < 3) return;

    try {
      const response = await fetch(`/api/shorten?alias=${encodeURIComponent(alias)}`);
      const data = await response.json();

      if (!data.available) {
        setError('This alias is already taken');
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Failed to check alias:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Input */}
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter a long URL to shorten..."
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Custom Alias Section */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useAlias}
              onChange={(e) => setUseAlias(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Use custom alias</span>
          </label>

          {useAlias && (
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              onBlur={checkAliasAvailability}
              placeholder="Enter custom alias (3-20 characters)"
              pattern="[a-zA-Z0-9_-]{3,20}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your shortened URL:</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={result.shortUrl}
              readOnly
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Original: <span className="truncate">{result.originalUrl}</span>
          </p>
        </div>
      )}
    </div>
  );
}