'use client';

import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import { Card, Spinner, Badge } from '@/components/ui';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Users</h1>

      {users.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600">No users found.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">USDT Wallet</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'admin' ? 'approved' : 'default'}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {user.usdtWalletAddress ? (
                        <span className="text-sm font-mono truncate max-w-xs block">
                          {user.usdtWalletAddress}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
