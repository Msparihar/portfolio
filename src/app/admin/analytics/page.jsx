import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsDashboardInteractive from "@/components/admin/AnalyticsDashboardInteractive";

export const metadata = {
  title: "Analytics Dashboard",
  robots: { index: false, follow: false },
};

export default async function AnalyticsDashboardPage() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("analytics_auth");
  const expectedPassword = process.env.ANALYTICS_PASSWORD;

  if (!authCookie || authCookie.value !== expectedPassword) {
    redirect("/admin/analytics/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Terminal-themed background */}
      <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />
      <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsDashboardInteractive />
      </div>
    </main>
  );
}
