import {
  addDoc,
  collection,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase/firebase-firestore.js';

import { extensionDb } from '../src/utils/firebase';

async function storeNote(note) {
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
