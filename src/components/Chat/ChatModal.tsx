"use client";

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Send } from 'lucide-react';
import styles from './Chat.module.css';

interface ChatProps {
  requestId: string;
  currentUserId: string;
  otherUserName: string;
  onClose: () => void;
}

export default function ChatModal({ requestId, currentUserId, otherUserName, onClose }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "requests", requestId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [requestId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "requests", requestId, "messages"), {
      text: newMessage,
      senderId: currentUserId,
      createdAt: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} glass`}>
        <header className={styles.header}>
          <h3>Chat with {otherUserName}</h3>
          <button onClick={onClose}><X /></button>
        </header>

        <div className={styles.messages}>
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.msg} ${msg.senderId === currentUserId ? styles.own : ''}`}>
              <div className={styles.msgBubble}>{msg.text}</div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={sendMessage} className={styles.inputArea}>
          <input 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button type="submit"><Send size={20} /></button>
        </form>
      </div>
    </div>
  );
}
