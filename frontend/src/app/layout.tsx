import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "InboxIQ — AI-Powered Gmail Analytics Dashboard",
  description:
    "Transform your Gmail inbox into an interactive analytics dashboard with AI-powered classification, natural language search, and intelligent insights.",
  keywords: ["gmail", "analytics", "ai", "email", "dashboard", "rag", "inbox"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(220 20% 14%)',
              color: 'hsl(210 40% 96%)',
              border: '1px solid hsl(220 15% 22%)',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
