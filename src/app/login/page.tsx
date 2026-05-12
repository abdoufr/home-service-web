"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Mail, Lock, Chrome } from 'lucide-react';
import styles from '../register/register.module.css'; // Reuse register styles
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'client', // Default role
          status: 'approved',
          createdAt: serverTimestamp(),
        });
      }
      
      toast.success("Welcome!");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} glass`}>
        <h1 className="gradient-text">Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <Mail className={styles.icon} size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <Lock className={styles.icon} size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <button type="button" onClick={handleGoogleLogin} className={styles.googleBtn}>
            <Chrome size={20} /> Continue with Google
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link href="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
