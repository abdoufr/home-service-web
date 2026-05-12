"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { User, Briefcase, Mail, Lock, UserCheck, Chrome } from 'lucide-react';
import styles from './register.module.css';
import toast from 'react-hot-toast';

export default function Register() {
  const [role, setRole] = useState<'client' | 'worker'>('client');
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
            <Chrome size={20} /> Continue with Google
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link href="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
