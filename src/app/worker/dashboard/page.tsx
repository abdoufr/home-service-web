"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Plus, Briefcase, Clock, CheckCircle, XCircle, MessageCircle, Trash2 } from 'lucide-react';
import ChatModal from '@/components/Chat/ChatModal';
import styles from './worker.module.css';
import toast from 'react-hot-toast';

export default function WorkerDashboard() {
  const { user, userData } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', price: '' });
  const [activeChat, setActiveChat] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for worker's offers
    const offersQ = query(collection(db, "offers"), where("workerId", "==", user.uid));
    const unsubOffers = onSnapshot(offersQ, (snap) => {
      setOffers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen for requests
    const reqsQ = query(collection(db, "requests"), where("workerId", "==", user.uid));
    const unsubReqs = onSnapshot(reqsQ, (snap) => {
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubOffers();
      unsubReqs();
    };
  }, [user]);

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, "offers"), {
      ...newOffer,
      price: Number(newOffer.price),
      workerId: user.uid,
      workerName: userData.displayName,
      createdAt: serverTimestamp(),
    });
    setNewOffer({ title: '', description: '', price: '' });
    setShowAddOffer(false);
    toast.success("Offer created!");
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'refused' | 'completed') => {
    await updateDoc(doc(db, "requests", requestId), { status, updatedAt: serverTimestamp() });
    toast.success(`Request ${status}`);
  };

  const deleteRequest = async (requestId: string, definitive: boolean) => {
    if (definitive) {
      if (confirm("Delete definitively?")) {
        await deleteDoc(doc(db, "requests", requestId));
        toast.success("Request deleted definitively");
      }
    } else {
      await updateDoc(doc(db, "requests", requestId), { status: 'history' });
      toast.success("Moved to history");
    }
  };

  return (
    <div className="container">
      <div className={styles.header}>
        <h1>Worker Dashboard</h1>
        <button className="btn-primary" onClick={() => setShowAddOffer(true)}>
          <Plus size={20} /> New Offer
        </button>
      </div>

      {showAddOffer && (
        <div className={`${styles.modal} glass`}>
          <form onSubmit={handleAddOffer}>
            <h3>Create Service Offer</h3>
            <input 
              placeholder="Title (e.g. House Cleaning)" 
              value={newOffer.title} 
              onChange={e => setNewOffer({...newOffer, title: e.target.value})} 
              required 
            />
            <textarea 
              placeholder="Description" 
              value={newOffer.description} 
              onChange={e => setNewOffer({...newOffer, description: e.target.value})} 
              required 
            />
            <input 
              type="number" 
              placeholder="Price ($)" 
              value={newOffer.price} 
              onChange={e => setNewOffer({...newOffer, price: e.target.value})} 
              required 
            />
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setShowAddOffer(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2>Active Requests</h2>
          <div className={styles.cards}>
            {requests.filter(r => r.status === 'pending' || r.status === 'accepted').map(r => (
              <div key={r.id} className={`${styles.card} glass`}>
                <div className={styles.cardHeader}>
                  <span>Request from <strong>{r.clientName}</strong></span>
                  <span className={`${styles.status} ${styles[r.status]}`}>{r.status}</span>
                </div>
                <p>{r.offerTitle}</p>
                <div className={styles.actions}>
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => handleRequest(r.id, 'accepted')} className={styles.accept}>
                        <CheckCircle size={20} /> Accept
                      </button>
                      <button onClick={() => handleRequest(r.id, 'refused')} className={styles.refuse}>
                        <XCircle size={20} /> Refuse
                      </button>
                    </>
                  )}
                  {r.status === 'accepted' && (
                    <>
                      <button className={styles.chat} onClick={() => setActiveChat(r)}>
                        <MessageCircle size={20} /> Chat
                      </button>
                      <button onClick={() => handleRequest(r.id, 'completed')} className={styles.complete}>
                        Done
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteRequest(r.id, false)} title="Move to History">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className={styles.section}>
          <h2>My Offers</h2>
          <div className={styles.cards}>
            {offers.map(o => (
              <div key={o.id} className={`${styles.card} glass`}>
                <h3>{o.title}</h3>
                <p>{o.description}</p>
                <strong>${o.price}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className={styles.section}>
        <h2>History</h2>
        <div className={styles.cards}>
          {requests.filter(r => r.status === 'completed' || r.status === 'refused' || r.status === 'history').map(r => (
            <div key={r.id} className={`${styles.card} glass ${styles.historyCard}`}>
               <span>{r.clientName} - {r.offerTitle} ({r.status})</span>
               <button onClick={() => deleteRequest(r.id, true)}><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </section>

      {activeChat && (
        <ChatModal 
          requestId={activeChat.id}
          currentUserId={user!.uid}
          otherUserName={activeChat.clientName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
