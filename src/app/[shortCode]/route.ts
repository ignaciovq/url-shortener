import { NextRequest, NextResponse } from 'next/server';
import { UrlService } from '@/services/url.service';
import { notFound } from 'next/navigation';

/**
 * GET /[shortCode]
 * Redirect to the original URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    if (!shortCode) {
      return notFound();
    }

    // Get the original URL
    const originalUrl = await UrlService.getOriginalUrl(shortCode);

    if (!originalUrl) {
      // Return 404 if URL not found or expired
      return new NextResponse('Short URL not found or has expired', {
        status: 404,
      });
    }

    // Redirect to the original URL with 301 (permanent redirect)
    return NextResponse.redirect(originalUrl, {
      status: 301,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error processing redirect:', error);

    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}