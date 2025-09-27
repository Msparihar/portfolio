import { NextResponse } from 'next/server';

// This endpoint can be called periodically to warm the cache
export async function POST(request) {
  try {
    const { username = 'Msparihar' } = await request.json().catch(() => ({}));

    // Call our main GitHub contributions API to warm the cache
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/github-contributions?username=${username}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cache-Warmer/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to warm cache: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Cache warmed successfully',
      username,
      cached: result.cached,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error warming cache:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to warm cache',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// GET endpoint for manual cache warming
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'Msparihar';

  return POST(new Request(request.url, {
    method: 'POST',
    body: JSON.stringify({ username }),
    headers: { 'Content-Type': 'application/json' }
  }));
}