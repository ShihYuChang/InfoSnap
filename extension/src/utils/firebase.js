import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
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

export async function initUserDb(userId, name, photo) {
  const now = new Date();
  const currenYear = new Date().getFullYear();
  addDoc(collection(extensionDb, 'Users', userId, 'Health-Food'), {
    carbs: 20,
    protein: 5,
    fat: 6,
    note: 'Template',
    created_time: now,
  });
  addDoc(collection(extensionDb, 'Users', userId, 'Health-Goal'), {
    carbs: 200,
    protein: 50,
    fat: 60,
    name: 'My Plan',
  });
  addDoc(collection(extensionDb, 'Users', userId, 'Finance'), {
    amount: 0,
    categoty: 'food',
    note: 'Template',
    date: now,
    tag: 'expense',
  });
  addDoc(collection(extensionDb, 'Users', userId, 'Notes'), {
    archived: false,
    title: 'Template',
    context: 'Template',
    created_time: now,
    image_url: null,
    pinned: true,
  });
  await addDoc(collection(extensionDb, 'Users', userId, 'Tasks'), {
    expireDate: now,
    status: 'to-do',
    startDate: now,
    task: 'Template',
    index: 0,
  });
  setDoc(doc(extensionDb, 'Users', userId), {
    Name: name,
    photoURL: photo,
    savgingsGoal: 0,
    monthlyIncome: 0,
    currentHealthGoal: {
      carbs: 200,
      fat: 50,
      protein: 60,
      name: 'My Plan',
    },
    monthlyNetIncome: {
      [currenYear]: Array(12).fill(0),
    },
  });
}

export async function getUserData(userId, setUserData) {
  const userUnsub = onSnapshot(doc(extensionDb, 'Users', userId), (doc) => {
    const data = doc.data();
    const income = data?.monthlyIncome;
    const goal = data?.savingsGoal;
    setUserData({ income: income, savingsGoal: goal });
  });
  return userUnsub;
}
