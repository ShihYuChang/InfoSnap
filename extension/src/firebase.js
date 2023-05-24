import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const extensionApp = initializeApp(firebaseConfig);
export const extensionDb = getFirestore(extensionApp);

export async function storeNote(note) {
  await addDoc(
    collection(extensionDb, 'Users', 'sam21323@gmail.com', 'Notes'),
    {
      archived: false,
      context: note,
      image_url: null,
      pinned: false,
      title: 'Saved Note',
      created_time: serverTimestamp(),
    }
  );
}
