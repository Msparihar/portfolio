import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.ANALYTICS_PASSWORD;

    if (!expectedPassword) {
      return NextResponse.json(
        { error: "Analytics password not configured" },
        { status: 500 }
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set("analytics_auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout - clear cookie
  const cookieStore = await cookies();
  cookieStore.delete("analytics_auth");
  return NextResponse.json({ success: true });
}
