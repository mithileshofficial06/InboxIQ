import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "InboxIQ — AI-Powered Gmail Intelligence",
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
    <html lang="en">
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
              background: '#1c1917',
              color: '#faf9f6',
              border: '1px solid #292524',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
