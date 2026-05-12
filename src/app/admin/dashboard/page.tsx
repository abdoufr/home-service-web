"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { Users, Settings, Grid, MessageSquare, ShieldCheck, ShieldAlert, Trash2, Clock } from 'lucide-react';
import styles from './admin.module.css';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ autoApproval: true });
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'categories' | 'messages'>('users');
  const [newCat, setNewCat] = useState({ name: '', description: '' });
  
  useEffect(() => {
    if (!isAdmin) return;

    // Listen for users
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen for categories
    const unsubCat = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen for messages
    const unsubMsg = onSnapshot(collection(db, "admin_messages"), (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Get settings
    getDoc(doc(db, "settings", "global")).then(snap => {
      if (snap.exists()) setSettings(snap.data());
    });

    return () => {
      unsub();
      unsubCat();
      unsubMsg();
    };
  }, [isAdmin]);

  const toggleApprovalMode = async () => {
    const newVal = !settings.autoApproval;
    await setDoc(doc(db, "settings", "global"), { autoApproval: newVal });
    setSettings({ autoApproval: newVal });
    toast.success(`Auto-approval turned ${newVal ? 'ON' : 'OFF'}`);
  };

  const handleUserStatus = async (userId: string, status: 'approved' | 'suspended' | 'pending') => {
    await updateDoc(doc(db, "users", userId), { status });
    toast.success(`User status updated to ${status}`);
  };

  const deleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", userId));
      toast.success("User deleted");
    }
  };

  const handleCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "categories"), newCat);
    setNewCat({ name: '', description: '' });
    toast.success("Category added");
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
    toast.success("Category deleted");
  };

  const markMessageRead = async (id: string) => {
    await updateDoc(doc(db, "admin_messages", id), { status: 'read' });
  };

  if (!isAdmin) return <div className="container">Access Denied</div>;

  return (
    <div className={styles.adminLayout}>
      <aside className={`${styles.sidebar} glass`}>
        <h2 className="gradient-text">Admin</h2>
        <nav>
          <button className={activeTab === 'users' ? styles.active : ''} onClick={() => setActiveTab('users')}>
            <Users size={20} /> Users
          </button>
          <button className={activeTab === 'categories' ? styles.active : ''} onClick={() => setActiveTab('categories')}>
            <Grid size={20} /> Categories
          </button>
          <button className={activeTab === 'messages' ? styles.active : ''} onClick={() => setActiveTab('messages')}>
            <MessageSquare size={20} /> Messages
          </button>
          <button className={activeTab === 'settings' ? styles.active : ''} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> Settings
          </button>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        </header>

        <section className={styles.content}>
          {activeTab === 'users' && (
            <div className={`${styles.card} glass`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userInfo}>
                          <strong>{u.displayName}</strong>
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td><span className={styles.badge}>{u.role}</span></td>
                      <td>
                        <span className={`${styles.status} ${styles[u.status]}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {u.status === 'pending' && (
                            <button onClick={() => handleUserStatus(u.id, 'approved')} title="Approve">
                              <ShieldCheck color="var(--success)" />
                            </button>
                          )}
                          {u.status === 'approved' && (
                            <button onClick={() => handleUserStatus(u.id, 'suspended')} title="Suspend">
                              <ShieldAlert color="var(--warning)" />
                            </button>
                          )}
                          {u.status === 'suspended' && (
                            <button onClick={() => handleUserStatus(u.id, 'approved')} title="Unsuspend">
                              <Clock color="var(--success)" />
                            </button>
                          )}
                          <button onClick={() => deleteUser(u.id)} title="Delete">
                            <Trash2 color="var(--error)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={`${styles.card} glass`}>
              <h3>System Settings</h3>
              <div className={styles.settingItem}>
                <div>
                  <p><strong>Auto-Approve Users</strong></p>
                  <span>When enabled, new users are approved automatically.</span>
                </div>
                <button 
                  className={`${styles.toggle} ${settings.autoApproval ? styles.on : ''}`}
                  onClick={toggleApprovalMode}
                >
                  {settings.autoApproval ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className={styles.categorySection}>
              <div className={`${styles.card} glass`}>
                <h3>Add New Category</h3>
                <form onSubmit={handleCategory} className={styles.catForm}>
                  <input placeholder="Name" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} required />
                  <input placeholder="Description" value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} required />
                  <button type="submit" className="btn-primary">Add</button>
                </form>
              </div>

              <div className={styles.catList}>
                {categories.map(c => (
                  <div key={c.id} className={`${styles.card} glass ${styles.catCard}`}>
                    <div>
                      <strong>{c.name}</strong>
                      <p>{c.description}</p>
                    </div>
                    <button onClick={() => deleteCategory(c.id)}><Trash2 color="var(--error)"/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className={styles.messagesList}>
              {messages.map(m => (
                <div key={m.id} className={`${styles.card} glass ${styles.msgCard} ${m.status === 'unread' ? styles.unread : ''}`}>
                  <div className={styles.msgHeader}>
                    <strong>{m.userName} ({m.userEmail})</strong>
                    <button onClick={() => markMessageRead(m.id)}>Mark as Read</button>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
