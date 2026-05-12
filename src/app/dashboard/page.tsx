"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!userData) {
        router.push('/login');
        return;
      }

      if (userData.status === 'pending') {
        router.push('/pending-approval');
        return;
      }

      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'worker') {
        router.push('/worker/dashboard');
      } else {
        router.push('/client/dashboard');
      }
    }
  }, [userData, loading, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
}
