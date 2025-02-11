import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

// Remove Inter font import and just use system fonts
const fallbackFonts = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const metadata: Metadata = {
  title: 'Healix',
  description: 'Healix is a platform for mental health awareness and support.',
  icons: {
    icon: '/favicon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={{ fontFamily: fallbackFonts }} className="backg">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
