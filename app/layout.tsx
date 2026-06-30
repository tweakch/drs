import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Saira_Semi_Condensed, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';

// Display: a technical condensed grotesk — the race-program / timing-screen voice.
const display = Saira_Semi_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-saira',
  display: 'swap',
});

// Timing: a precise tabular mono — lap times and gaps are the content, so they lead.
const timing = Spline_Sans_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-spline-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DRS — Race Analysis',
  description: 'Kart-race After-Action Review for endurance racing.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de-CH" className={`${display.variable} ${timing.variable}`}>
      <body>{children}</body>
    </html>
  );
}
