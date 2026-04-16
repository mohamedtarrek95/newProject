import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'EGP-USDT Exchange | Premium Crypto Exchange Platform',
  description: 'Secure and reliable EGP to USDT cryptocurrency exchange platform with real-time rates and instant processing.',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f59e0b" rx="15" width="100" height="100"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="60" fill="%230f172a" font-family="system-ui" font-weight="bold">E</text></svg>',
        type: 'image/svg+xml',
      }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="dark">
      <body className="bg-surface-900 text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}