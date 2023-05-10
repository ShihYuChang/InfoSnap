import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';

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

export async function initUserDb(email, userInfo) {
  const now = new Date();
  const currenYear = new Date().getFullYear();
  addDoc(collection(db, 'Users', email, 'Health-Food'), {
    carbs: 20,
    protein: 5,
    fat: 6,
    note: 'Template',
    created_time: Timestamp.fromDate(now),
  });
  addDoc(collection(db, 'Users', email, 'Health-Goal'), {
    carbs: 200,
    protein: 50,
    fat: 60,
    name: 'My Plan',
  });
  addDoc(collection(db, 'Users', email, 'Finance'), {
    amount: 0,
    categoty: 'food',
    note: 'Template',
    date: Timestamp.fromDate(now),
    tag: 'expense',
  });
  addDoc(collection(db, 'Users', email, 'Notes'), {
    archived: false,
    title: 'Template',
    context: 'Template',
    created_time: Timestamp.fromDate(now),
    image_url: null,
    pinned: true,
  });
  await addDoc(collection(db, 'Users', email, 'Tasks'), {
    expireDate: Timestamp.fromDate(now),
    status: 'to-do',
    startDate: Timestamp.fromDate(now),
    task: 'Template',
    index: 0,
  });
  setDoc(doc(db, 'Users', email), {
    Name: userInfo.displayName,
    photoURL: userInfo.photoURL,
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

export async function googleLogin(setUserInfo, setEmail) {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (result._tokenResponse.isNewUser) {
      await initUserDb(user.email, user);
    }
    setUserInfo({
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
    });
    setEmail(user.email);
  } catch (err) {
    const errorCode = err.code;
    const errorMessage = err.message;
    const email = err.customData.email;
    console.log(errorCode, errorMessage, email);
  }
}

export async function nativeSignIn(e, email, password) {
  e.preventDefault();
  try {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === 'auth/user-not-found') {
      alert('User not found. Please sign up first.');
    } else if (errorCode === 'auth/wrong-password') {
      alert('Wrong password. Please try again.');
    } else {
      alert('Something went wrong. Please try again later.');
    }
  }
}
