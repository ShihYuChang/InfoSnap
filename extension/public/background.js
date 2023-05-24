import { storeNote } from '../src/firebase';

/* eslint-disable no-undef */
chrome.contextMenus.create({
  id: 'addToNote',
  title: 'InfoSnap Add To Note',
  contexts: ['selection'],
});

// Add a listener for the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToNote') {
    storeNote(info.selectionText);
  }
});
