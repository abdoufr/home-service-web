"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MessageSquare, Send } from 'lucide-react';
import styles from './contact.module.css';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar/Navbar';

export default function ContactAdmin() {
  const { user, userData } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "admin_messages"), {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: user.email,
        text: message,
        createdAt: serverTimestamp(),
        status: 'unread',
      });
      toast.success("Message sent to admin!");
      setMessage('');
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Navbar />
      <div className={styles.wrapper}>
        <div className={`${styles.card} glass`}>
          <MessageSquare size={48} className="gradient-text" style={{ marginBottom: '1.5rem' }} />
          <h1>Contact Support</h1>
          <p>Have a question or issue? Send a message to our administrators.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <textarea 
              placeholder="How can we help you?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={6}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              <Send size={20} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
