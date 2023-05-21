import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
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

async function initUserDb(userId, name, photo) {
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

export async function signUp(e, setEmail, userInput, goToSignIn) {
  e.preventDefault();
  const auth = getAuth();

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userInput.email,
      userInput.password
    );
    const userEmail = userCredential.user.email;
    setEmail(userEmail);

    await initUserDb(
      userEmail,
      `${userInput.first_name} ${userInput.last_name}`,
      null
    );

    await updateProfile(auth.currentUser, {
      displayName: `${userInput.first_name} ${userInput.last_name}`,
      photoURL: null,
    });

    alert('Register Success!');
  } catch (error) {
    const errorCode = error.code;

    if (errorCode === 'auth/email-already-in-use') {
      alert('Email already in use. Please sign in instead.');
      goToSignIn();
    } else if (errorCode === 'auth/weak-password') {
      alert('Password is too weak. Please choose a stronger password.');
    } else {
      throw error;
    }
  }
}

export async function signIn(e, userInput, setEmail) {
  e.preventDefault();
  const auth = getAuth();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      userInput.email,
      userInput.password
    );
    setEmail(userCredential.user.email);
  } catch (error) {
    const errorCode = error.code;

    if (errorCode === 'auth/user-not-found') {
      alert('User not found. Please sign up first.');
    } else if (errorCode === 'auth/wrong-password') {
      alert('Wrong password. Please try again.');
    } else {
      alert('Something went wrong. Please try again later.');
    }
    throw error;
  }
}

export async function handleSignOut(setEmail) {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      alert('Sign Out Success!');
      setEmail(null);
    })
    .catch((error) => {
      alert('Something went wrong. Please try again later');
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
