"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Clock, LogOut } from 'lucide-react';
import styles from '../register/register.module.css';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function PendingApproval() {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userData?.status === 'approved') {
      router.push('/dashboard');
    }
  }, [userData, loading, router]);

  const handleLogout = () => signOut(auth);

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} glass`}>
        <Clock size={64} color="var(--warning)" style={{ margin: '0 auto 2rem' }} />
        <h1 className="gradient-text">Approval Pending</h1>
        <p className={styles.subtitle}>
          Your account is currently being reviewed by our administrators. 
          You will receive an email once your account is approved.
        </p>
        <button onClick={handleLogout} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </div>
  );
}
