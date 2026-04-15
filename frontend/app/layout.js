import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'EGP-USDT Exchange',
  description: 'Peer-to-Admin Cryptocurrency Exchange Platform'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
