import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const wishlistCollection = (userId) => collection(db, 'users', userId, 'wishlist');

export async function fetchWishlist(userId) {
  const snapshot = await getDocs(wishlistCollection(userId));
  return snapshot.docs.map((item) => item.data());
}

export async function saveWishlistGame(userId, game) {
  const firestoreGame = Object.fromEntries(
    Object.entries(game).filter(([, value]) => value !== undefined)
  );
  await setDoc(doc(db, 'users', userId, 'wishlist', String(game.id)), firestoreGame);
}

export async function removeWishlistGame(userId, gameId) {
  await deleteDoc(doc(db, 'users', userId, 'wishlist', String(gameId)));
}
