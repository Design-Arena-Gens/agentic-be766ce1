import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Video Production Agent',
  description: 'AI-powered video production from images and scripts',
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
