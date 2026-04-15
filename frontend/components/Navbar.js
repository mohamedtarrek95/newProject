import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            EGP-USDT Exchange
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <span className="text-gray-600">
                  {user.email}
                </span>
                <Button variant="secondary" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
