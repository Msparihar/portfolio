import { NextResponse } from 'next/server';
import { getGithubContributions } from '@/lib/githubContributions';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'Msparihar';

  try {
    const result = await getGithubContributions(username);

    // If error occurred and no fallback data, return 500
    if (result.error && !result.fallback) {
      return NextResponse.json(
        { error: 'Failed to fetch contributions', message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}