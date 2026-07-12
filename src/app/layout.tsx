import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AssetHub - IT Asset Management',
  description: 'Enterprise IT Asset and Resource Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
