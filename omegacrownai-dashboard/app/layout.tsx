import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OmegaCrownAI | Build Websites, Apps, and Business Systems',
  description: 'Describe your business idea and generate a customer-ready website, app, admin workflow, source files, ZIP package, and launch checklist.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
