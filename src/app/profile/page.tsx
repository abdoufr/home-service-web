"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { User, Mail, Camera, Save } from 'lucide-react';
import styles from './profile.module.css';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar/Navbar';

export default function Profile() {
  const { user, userData, loading } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.displayName || '');
      setBio(userData.bio || '');
    }
  }, [userData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });
      
      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name,
        bio: bio,
      });

      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main>
      <Navbar />
      <div className={styles.wrapper}>
        <div className={`${styles.card} glass`}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <User size={64} />
              <button className={styles.cameraBtn}><Camera size={16} /></button>
            </div>
            <h2>{userData?.displayName}</h2>
            <span className={styles.roleBadge}>{userData?.role}</span>
          </div>

          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <div className={styles.inputWrapper}>
                <User size={20} />
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Email (Read-only)</label>
              <div className={styles.inputWrapper}>
                <Mail size={20} />
                <input value={user?.email || ''} readOnly disabled />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Bio</label>
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={20} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
