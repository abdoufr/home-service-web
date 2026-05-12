"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Navbar.module.css';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user, userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className={`${styles.nav} glass`}>
      <div className="container">
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className="gradient-text">HomeServ</span>
          </Link>

          <div className={`${styles.links} ${isOpen ? styles.open : ''}`}>
            <Link href="/offers" onClick={() => setIsOpen(false)}>Browse</Link>
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Link href="/profile" className={styles.profileLink} onClick={() => setIsOpen(false)}>
                  <UserIcon size={20} />
                  <span>{userData?.displayName || 'Profile'}</span>
                </Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.loginBtn} onClick={() => setIsOpen(false)}>Login</Link>
                <Link href="/register" className="btn-primary" onClick={() => setIsOpen(false)}>Join Now</Link>
              </>
            )}
          </div>

          <button className={styles.mobileMenu} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
