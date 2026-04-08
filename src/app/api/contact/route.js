import { sendContactMessage } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!email || !message) {
      return Response.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const result = await sendContactMessage({ name, email, subject, message });

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
