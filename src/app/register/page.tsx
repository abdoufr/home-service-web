"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { User, Briefcase, Mail, Lock, UserCheck } from 'lucide-react';
import styles from './register.module.css';
import toast from 'react-hot-toast';

export default function Register() {
  const [role, setRole] = useState<'client' | 'worker' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for global settings (autoApproval)
      const settingsSnap = await getDoc(doc(db, "settings", "global"));
      const autoApproval = settingsSnap.exists() ? settingsSnap.data().autoApproval : true;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      // Create user document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        displayName,
        role,
        status: role === 'admin' ? 'approved' : (autoApproval ? 'approved' : 'pending'),
        createdAt: new Date().toISOString(),
      });

      toast.success("Account created! " + (autoApproval ? "Redirecting..." : "Waiting for admin approval."));
      
      if (autoApproval) {
        router.push('/dashboard');
      } else {
        router.push('/pending-approval');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // For registration with Google, we use the selected role
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: role,
          status: 'approved', // Google users are usually trusted
          createdAt: serverTimestamp(),
        });
      }
      
      toast.success("Account created via Google!");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} glass`}>
        <h1 className="gradient-text">Create Account</h1>
        <p className={styles.subtitle}>Join our premium home service network</p>

        <div className={styles.roleSelector}>
          <button 
            className={`${styles.roleBtn} ${role === 'client' ? styles.active : ''}`}
            onClick={() => setRole('client')}
          >
            <User size={24} />
            <span>Client</span>
          </button>
          <button 
            className={`${styles.roleBtn} ${role === 'worker' ? styles.active : ''}`}
            onClick={() => setRole('worker')}
          >
            <Briefcase size={24} />
            <span>Worker</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.inputGroup}>
            <UserCheck className={styles.icon} size={20} />
            <input 
              type="text" 
              placeholder="Full Name" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              required 
            />
          </div>
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <button type="button" onClick={handleGoogleLogin} className={styles.googleBtn}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg> 
            Continue with Google
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link href="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
