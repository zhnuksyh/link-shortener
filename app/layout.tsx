import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "KnuckleLink",
  description: "Shorten your links, amplify your reach",
  generator: "KnuckleLink",
  icons: {
    icon: "/knucklelink-logo.png",
    shortcut: "/knucklelink-logo.png",
    apple: "/knucklelink-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/knucklelink-logo.png" sizes="any" />
        <link
          rel="icon"
          href="/knucklelink-logo.png"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/knucklelink-logo.png"
          sizes="32x32"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/knucklelink-logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="thin-scrollbar">{children}</body>
    </html>
  );
}
