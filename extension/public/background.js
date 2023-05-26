import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';
const firebaseConfig = {
  apiKey: 'AIzaSyCrg6sxxS6Drp-CAFHdmvoVkUaaCkunlu8',
  authDomain: 'infosnap-4f11e.firebaseapp.com',
  projectId: 'infosnap-4f11e',
  storageBucket: 'infosnap-4f11e.appspot.com',
  messagingSenderId: '112276311326',
  appId: '1:112276311326:web:0b279e4293298cce98cd0f',
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

function addMessageListener() {
  if (!chrome.runtime.onMessage.hasListener(messageListener)) {
    chrome.runtime.onMessage.addListener(messageListener);
  }
}

function messageListener(message, sender, sendResponse) {
  const { state } = message;
  email = state;
  return true;
}

addMessageListener();
