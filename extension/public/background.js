import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let email = null;

async function storeNote(note) {
  await addDoc(collection(db, 'Users', email, 'Notes'), {
    archived: false,
    context: note,
    image_url: null,
    pinned: false,
    title: 'Saved Note',
    created_time: serverTimestamp(),
  });
}

/* eslint-disable no-undef */
chrome.contextMenus.create({
  id: 'addToNote',
  title: 'InfoSnap Add To Note',
  contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToNote') {
    storeNote(info.selectionText);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { state } = message;
  email = state;
  return true;
});
