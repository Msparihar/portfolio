import "./globals.css";
import { IBM_Plex_Mono, Fira_Code } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

// Define fonts
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-code",
});

export const metadata = {
  title: "Terminal Portfolio",
  description: "A terminal-themed personal portfolio website",
  icons: {
    icon: [
      { url: '/icons/terminal-favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/terminal-favicon.svg' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/terminal-favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${ibmPlexMono.variable} ${firaCode.variable} min-h-screen font-mono antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
