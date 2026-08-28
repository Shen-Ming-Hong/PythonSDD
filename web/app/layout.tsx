import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '敲磚塊｜Brick Breaker',
  description: '用鍵盤控制底板，擊破全部磚塊並完成這一局。',
  openGraph: {
    title: '敲磚塊｜Brick Breaker',
    description: '用鍵盤控制底板，擊破全部磚塊並完成這一局。',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '敲磚塊｜Brick Breaker',
    description: '用鍵盤控制底板，擊破全部磚塊並完成這一局。',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
