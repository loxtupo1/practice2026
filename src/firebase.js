import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: 'AIzaSyD_JPN04QIIN7O70Cu1OVwY_WQXqdQTO24',
  authDomain: 'gagagag-bc9cd.firebaseapp.com',
  projectId: 'gagagag-bc9cd',
  storageBucket: 'gagagag-bc9cd.firebasestorage.app',
  messagingSenderId: '302531006086',
  appId: '1:302531006086:web:252bd7a512218ccc5a8b07'
};
const app = initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);
