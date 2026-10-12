import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeAdmin = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (current) => {
      setLoading(true);
      setUser(current);
      unsubscribeAdmin?.();
      unsubscribeAdmin = null;
      if (!current) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      unsubscribeAdmin = onSnapshot(doc(db, 'admins', current.uid), (snapshot) => {
        setIsAdmin(snapshot.exists() && (snapshot.data().enabled === true || snapshot.data().isAdmin === true));
        setLoading(false);
      }, (error) => {
        setIsAdmin(false);
        setLoading(false);
      });
    });
    return () => {
      unsubscribeAuth();
      unsubscribeAdmin?.();
    };
  }, []);

  const register = async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    setUser(result.user);
  };
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const updateUserProfile = async ({ displayName, photoURL }) => {
    if (!auth.currentUser) throw new Error('Необходимо войти в аккаунт.');
    await updateProfile(auth.currentUser, {
      displayName: displayName.trim(),
      photoURL: photoURL.trim() || null
    });
    setUser({
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      photoURL: auth.currentUser.photoURL
    });
  };
  const logout = () => signOut(auth);
  return <AuthContext.Provider value={{ user, isAdmin, loading, register, login, logout, updateUserProfile }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
