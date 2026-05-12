"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, where, doc, updateDoc } from 'firebase/firestore';
import { Search, MapPin, Star, MessageSquare, XCircle } from 'lucide-react';
import ChatModal from '@/components/Chat/ChatModal';
import Navbar from '@/components/Navbar/Navbar';
import styles from './client.module.css';
import toast from 'react-hot-toast';

export default function ClientDashboard() {
  const { user, userData } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChat, setActiveChat] = useState<any>(null);

  useEffect(() => {
    // Listen for all offers
    const offersQ = query(collection(db, "offers"));
    const unsubOffers = onSnapshot(offersQ, (snap) => {
      setOffers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    if (user) {
      // Listen for client's requests
      const reqsQ = query(collection(db, "requests"), where("clientId", "==", user.uid));
      const unsubReqs = onSnapshot(reqsQ, (snap) => {
        setMyRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => {
        unsubOffers();
        unsubReqs();
      };
    }

    return () => unsubOffers();
  }, [user]);

  const requestService = async (offer: any) => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    try {
      await addDoc(collection(db, "requests"), {
        clientId: user.uid,
        clientName: userData.displayName,
        workerId: offer.workerId,
        workerName: offer.workerName,
        offerId: offer.id,
        offerTitle: offer.title,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success("Request sent!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (confirm("Cancel this request?")) {
      await updateDoc(doc(db, "requests", requestId), { status: 'cancelled' });
      toast.success("Request cancelled");
    }
  };

  const filteredOffers = offers.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main style={{ paddingTop: 'var(--header-height)' }}>
      <Navbar />
      <div className="container">
      <header className={styles.header}>
        <h1>Find Services</h1>
        <div className={`${styles.searchBar} glass`}>
          <Search size={20} />
          <input 
            placeholder="Search for cleaning, repair, etc..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.mainContent}>
          <div className={styles.offersGrid}>
            {filteredOffers.map(offer => (
              <div key={offer.id} className={`${styles.offerCard} glass`}>
                <div className={styles.offerHeader}>
                  <h3>{offer.title}</h3>
                  <span className={styles.price}>${offer.price}</span>
                </div>
                <p className={styles.offerDesc}>{offer.description}</p>
                <div className={styles.workerInfo}>
                   <Star size={16} color="var(--warning)" /> 
                   <span>By {offer.workerName}</span>
                </div>
                <button onClick={() => requestService(offer)} className="btn-primary">
                  Request Service
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className={styles.sidebar}>
          <div className={`${styles.stickyCard} glass`}>
            <h3>My Requests</h3>
            <div className={styles.requestList}>
              {myRequests.length === 0 && <p className={styles.empty}>No requests yet.</p>}
              {myRequests.map(req => (
                <div key={req.id} className={styles.requestItem}>
                  <div className={styles.reqInfo}>
                    <strong>{req.offerTitle}</strong>
                    <span className={`${styles.status} ${styles[req.status]}`}>{req.status}</span>
                  </div>
                  <div className={styles.reqActions}>
                    {req.status === 'accepted' && (
                      <button className={styles.chatBtn} onClick={() => setActiveChat(req)}>
                        <MessageSquare size={16}/>
                      </button>
                    )}
                    {req.status === 'pending' && (
                      <button onClick={() => cancelRequest(req.id)} className={styles.cancelBtn}><XCircle size={16}/></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {activeChat && (
        <ChatModal 
          requestId={activeChat.id}
          currentUserId={user!.uid}
          otherUserName={activeChat.workerName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </main>
  );
}
