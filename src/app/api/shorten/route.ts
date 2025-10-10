import { NextRequest, NextResponse } from 'next/server';
import { UrlService } from '@/services/url.service';

/**
 * POST /api/shorten
 * Create a shortened URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, alias, expiresIn } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Calculate expiration timestamp if provided
    let expiresAt: number | undefined;
    if (expiresIn) {
      // expiresIn is in seconds from now
      const expirationSeconds = parseInt(expiresIn);
      if (!isNaN(expirationSeconds) && expirationSeconds > 0) {
        expiresAt = Math.floor(Date.now() / 1000) + expirationSeconds;
      }
    }

    // Create the shortened URL
    const urlMapping = await UrlService.createShortUrl(url, alias, expiresAt);

    // Get the base URL for the response
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                   `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    return NextResponse.json({
      shortUrl: `${baseUrl}/${urlMapping.shortKey}`,
      shortCode: urlMapping.shortKey,
      originalUrl: urlMapping.fullUrl,
      createdAt: urlMapping.createdAt,
      expiresAt: urlMapping.expiresAt,
    });

  } catch (error) {
    console.error('Error creating short URL:', error);

    // Return appropriate error response
    if (error instanceof Error && error.message?.includes('Invalid URL')) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message?.includes('alias')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shorten?alias=xxx
 * Check if an alias is available
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const alias = searchParams.get('alias');

    if (!alias) {
      return NextResponse.json(
        { error: 'Alias parameter is required' },
        { status: 400 }
      );
    }

    const isAvailable = await UrlService.checkAliasAvailability(alias);

    return NextResponse.json({
      alias,
      available: isAvailable,
    });

  } catch (error) {
    console.error('Error checking alias availability:', error);

    return NextResponse.json(
      { error: 'Failed to check alias availability' },
      { status: 500 }
    );
  }
}