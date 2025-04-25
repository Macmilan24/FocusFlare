import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Flare",
  description: "Learning for kids with ADHD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
