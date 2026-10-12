import { collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, deleteField, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { samples } from '../data/games';
const games = collection(db, 'games');
const sampleSeedMarker = 'catalog-seed-v1';
export async function fetchGames() {
  const snapshot = await getDocs(games);
  return snapshot.docs
    .filter((item) => item.id !== sampleSeedMarker)
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
export async function ensureSampleGames() {
  const marker = await getDoc(doc(db, 'games', sampleSeedMarker));
  const existing = await fetchGames();
  // Featured catalog entries belong to the shared catalog, not to the admin's shelf.
  // Older versions incorrectly assigned the seeding admin as their owner.
  const incorrectlyOwnedSamples = existing.filter((game) => game.source === 'featured' && game.ownerId);
  await Promise.all(incorrectlyOwnedSamples.map((game) =>
    updateDoc(doc(db, 'games', game.id), { ownerId: deleteField() })
  ));
  if (marker.exists()) return fetchGames();
  const titles = new Set(existing.map((game) => game.title?.trim().toLowerCase()));
  const missing = samples.filter((game) => !titles.has(game.title.trim().toLowerCase()));
  await Promise.all(missing.map(({ id, ...game }) => setDoc(doc(db, 'games', id), {
    ...game,
    createdAt: Date.now(),
    source: 'featured'
  })));
  await setDoc(doc(db, 'games', sampleSeedMarker), { initialized: true, createdAt: Date.now() });
  return fetchGames();
}
export async function fetchGameById(id) {
  const result = await getDoc(doc(db, 'games', id));
  if (!result.exists()) throw new Error('���� �� �������');
  return { id: result.id, ...result.data() };
}
export async function fetchMyGames(userId) {
  const snapshot = await getDocs(query(games, where('ownerId', '==', userId)));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((game) => game.source !== 'featured');
}
export async function createGame(data, user, sharedCatalog = false) {
  const record = { ...data, rating: Number(data.rating), year: Number(data.year), ownerName: user.displayName || user.email, createdAt: Date.now() };
  if (sharedCatalog) record.source = 'admin';
  else record.ownerId = user.uid;
  const ref = await addDoc(games, record);
  return ref.id;
}
export async function updateGame(id, data) { await updateDoc(doc(db, 'games', id), { ...data, rating: Number(data.rating), year: Number(data.year), updatedAt: Date.now() }); }
export async function deleteGame(id) { await deleteDoc(doc(db, 'games', id)); }
