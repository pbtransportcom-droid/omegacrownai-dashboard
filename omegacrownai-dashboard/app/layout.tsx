import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OmegaCrownAI Dashboard',
  description: 'Production-oriented Next.js scaffold for OmegaCrownAI.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
