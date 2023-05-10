import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Timestamp, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const getUserEmail = (callback) => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user.email);
    } else {
    }
  });
};

export const getTimestamp = (daysAgo, hr, min, sec, nanosec) => {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(hr, min, sec, nanosec);
  const timestamp = Timestamp.fromDate(now);
  return timestamp;
};
