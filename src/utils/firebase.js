import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  endBefore,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';
import { alerts } from './sweetAlert';

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

export async function getUserEmail(callback) {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user.email);
    } else {
    }
  });
}

export const getTimestamp = (daysAgo, hr, min, sec, nanosec) => {
  const now = new Date();
  now.setDate(now.getDate() - daysAgo);
  now.setHours(hr, min, sec, nanosec);
  const timestamp = Timestamp.fromDate(now);
  return timestamp;
};

async function initUserDb(email, name, photo) {
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

export async function googleLogin(setUserInfo, setEmail) {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (result._tokenResponse.isNewUser) {
      await initUserDb(user.email, user.displayName, user.photoURL);
    }
    setUserInfo({
      name: user.displayName,
      email: user.email,
      avatar: user.photoURL,
    });
    setEmail(user.email);
  } catch (err) {
    alert('Something went wrong, please try again');
  }
}

export async function nativeSignUp(
  e,
  setEmail,
  setUserInfo,
  userInput,
  handleNoAccount
) {
  e.preventDefault();
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userInput.email,
      userInput.password
    );
    const userEmail = userCredential.user.email;
    await initUserDb(
      userEmail,
      `${userInput.first_name} ${userInput.last_name}`,
      null
    );
    setEmail(userEmail);
    setUserInfo({
      name: `${userInput.first_name} ${userInput.last_name}`,
      email: userInput.email,
      avatar: null,
    });
  } catch (error) {
    const errorCode = error.code;
    if (errorCode === 'auth/email-already-in-use') {
      alert('Email already in use. Please sign in instead.');
      handleNoAccount();
    } else if (errorCode === 'auth/weak-password') {
      alert('Password is too weak. Please choose a stronger password.');
    } else {
      alert('Something went wrong. Please try again later.');
    }
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

export function getPinnedNotes(userEmail, setPinnedNote) {
  const unsub = onSnapshot(
    query(
      collection(db, 'Users', userEmail, 'Notes'),
      where('pinned', '==', true)
    ),
    (querySnapshot) => {
      const notes = [];
      querySnapshot.forEach((doc) => {
        notes.push({ content: doc.data(), id: doc.id, isVisible: true });
      });
      setPinnedNote(notes);
    }
  );
  return unsub;
}

export async function removePin(id, note, email) {
  const newNote = note;
  newNote.pinned = false;
  await setDoc(doc(db, 'Users', email, 'Notes', id), newNote);
  alerts.titleOnly('Note unpinned', 'success');
}

export async function finishTask(email, task) {
  const docId = task.docId;
  const newTask = {
    task: task.summary,
    status: 'done',
    startDate: new Date(task.start.date),
    expireDate: new Date(task.end.date),
  };
  await updateDoc(doc(db, 'Users', email, 'Tasks', docId), newTask);
  alerts.titleOnly('Status Updated!', 'success');
}

export async function getMonthlyNetIncome() {
  const docRef = doc(db, 'Users', 'sam21323@gmail.com');
  const docSnap = await getDoc(docRef);
  const readableSnap = docSnap.data();
  const monthlyNet = await readableSnap.monthlyNetIncome;
  const thisYearMonthlyNet = monthlyNet[2023];
  return thisYearMonthlyNet;
}

function getNextDaysOfWeek(date, numToDisplay) {
  if (date && date.length > 0) {
    const targetDays = [date];
    const inputDate = new Date(date);

    const nextDayOfWeek = new Date(inputDate);
    nextDayOfWeek.setDate(nextDayOfWeek.getDate() + 7);

    for (let i = 0; i < numToDisplay; i++) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedDate = new Date(nextDayOfWeek)
        .toLocaleDateString('zh-TW', options)
        .replace(/\//g, '-');
      targetDays.push(formattedDate);
      nextDayOfWeek.setDate(nextDayOfWeek.getDate() + 7);
    }
    return targetDays;
  }
}

function getNextDaysOfMonth(date, numToDisplay) {
  if (date && date.length > 0) {
    const targetDays = [date];
    const inputDate = new Date(date);

    const nextDayOfMonth = new Date(inputDate);
    nextDayOfMonth.setMonth(nextDayOfMonth.getMonth() + 1);

    for (let i = 0; i < numToDisplay - 1; i++) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      const formattedDate = new Date(nextDayOfMonth)
        .toLocaleDateString('zh-TW', options)
        .replace(/\//g, '-');
      targetDays.push(formattedDate);
      nextDayOfMonth.setMonth(nextDayOfMonth.getMonth() + 1);
    }

    return targetDays;
  }
}

export async function storeExpense(e, userInput, email) {
  e.preventDefault();
  const input = JSON.parse(JSON.stringify(userInput));
  const targetDates =
    userInput.routine === 'every week'
      ? getNextDaysOfWeek(userInput.date, 3)
      : userInput.routine === 'every month'
      ? getNextDaysOfMonth(userInput.date, 3)
      : new Date(userInput.date);

  async function storeRoutineExpense() {
    if (Array.isArray(targetDates)) {
      targetDates.forEach((date) => {
        const timestamp = new Date(date);
        input.date = timestamp;
        addDoc(collection(db, 'Users', email, 'Finance'), input);
      });
    }
  }

  async function storeSingleExpense() {
    input.date = targetDates;
    addDoc(collection(db, 'Users', email, 'Finance'), input);
  }

  if (
    userInput.routine === 'every week' ||
    userInput.routine === 'every month'
  ) {
    await storeRoutineExpense();
  } else {
    await storeSingleExpense();
  }
  alerts.titleOnly('New record is added!', 'success');
}

export async function storeBudget(e, userInput, email) {
  e.preventDefault();
  const input = { ...userInput };
  for (let key in input) {
    input[key] = Number(input[key]);
  }
  try {
    await updateDoc(doc(db, 'Users', email), input);
    alerts.titleOnly('Budget is updated!', 'success');
  } catch (err) {
    alerts.regular(
      'Error',
      'Someting went wrong. Please try again later',
      'error'
    );
  }
}

export async function deleteExpense(item, email) {
  await deleteDoc(doc(db, 'Users', email, 'Finance', item.docId));
  alerts.titleOnly('Record deleted!', 'success');
}

export async function storeIntake(e, userInput, email, handleExit) {
  e.preventDefault();
  try {
    await alerts.regular('Saved!', 'New record has been added.', 'success');
    handleExit();
    await addDoc(collection(db, 'Users', email, 'Health-Food'), userInput);
  } catch (error) {
    alerts.titleOnly(
      'Failed to add new record, please try again later.',
      'error'
    );
  }
}

export async function storeHealthPlan(e, userInput, selectedDate, email) {
  e.preventDefault();
  try {
    const result = await alerts.regular(
      'Saved!',
      'New plan has been created!',
      'success'
    );
    const todayDate = new Date().getDate();
    const selectedDateOnly = selectedDate.slice(-1);
    if (result.isConfirmed) {
      await addDoc(collection(db, 'Users', email, 'Health-Goal'), {
        ...userInput,
        created_time:
          todayDate === selectedDateOnly
            ? serverTimestamp()
            : new Date(selectedDate),
      });
    }
  } catch (error) {
    alerts.titleOnly(
      'Failed to create new plan, please try again later',
      'error'
    );
  }
}

export async function updateHealthPlan(e, userInput, targetDoc, email) {
  e.preventDefault();
  const newPlan = { ...userInput };
  await updateDoc(doc(db, 'Users', email, 'Health-Goal', targetDoc), newPlan);
  alerts.titleOnly('Plan has been updated', 'success');
}

export async function deleteHealthPlan(targetDoc, email) {
  const result = await alerts.needConfirmation(
    'Are you sure',
    "You won't be able to revert this!",
    'Yes, delete it',
    'warning'
  );
  result.isConfirmed &&
    (await deleteDoc(doc(db, 'Users', email, 'Health-Goal', targetDoc)));
  alerts.titleOnly('The plan has been deleted', 'success');
}

export async function removeHealthRecord(targetDoc, email) {
  const result = await alerts.needConfirmation(
    'Are you sure',
    "You won't be able to revert this!",
    'Yes, delete it',
    'warning'
  );
  const postDeleteResponse =
    result.isConfirmed &&
    (await alerts.regular('Deleted', 'The record has been deleted', 'success'));

  postDeleteResponse.isConfirmed &&
    setTimeout(() => {
      deleteDoc(doc(db, 'Users', email, 'Health-Food', targetDoc));
    }, 200);
}

export function getDailyIntakeRecords(daysAgo, email, setIntakeRecords) {
  const startOfToday = getTimestamp(daysAgo, 0, 0, 0, 0);
  const endOfToday = getTimestamp(daysAgo, 23, 59, 59, 59);
  const foodSnap = onSnapshot(
    query(
      collection(db, 'Users', email, 'Health-Food'),
      orderBy('created_time', 'asc'),
      startAfter(startOfToday),
      endBefore(endOfToday)
    ),
    (querySnapshot) => {
      const records = [];
      querySnapshot.forEach((doc) => {
        records.push({ content: doc.data(), id: doc.id });
      });
      setIntakeRecords(records);
    }
  );
  return foodSnap;
}

export function getHealthPlan(email, setPlans) {
  const planSnap = onSnapshot(
    collection(db, 'Users', email, 'Health-Goal'),
    (querySnapshot) => {
      const plans = [];
      querySnapshot.forEach((doc) => {
        plans.push({ content: doc.data(), id: doc.id });
      });
      setPlans(plans);
    }
  );

  return planSnap;
}

export function updateCurrentPlan(plan, email) {
  updateDoc(doc(db, 'Users', email), {
    currentHealthGoal: plan,
  });
}

export async function storeSearchedFood(selectedFood, handleExit, email) {
  const now = new Date();
  const dataToStore = {
    note: selectedFood.name,
    carbs: selectedFood.nutritions[2].qty,
    protein: selectedFood.nutritions[0].qty,
    fat: selectedFood.nutritions[1].qty,
    created_time: new Timestamp(
      now.getTime() / 1000,
      now.getMilliseconds() * 1000
    ),
  };
  alerts
    .regular('Saved!', 'New record has been added.', 'success')
    .then((res) => {
      if (res.isConfirmed) {
        handleExit();
        setTimeout(() => {
          addDoc(collection(db, 'Users', email, 'Health-Food'), dataToStore);
        }, '200');
      }
    });
}

export async function editNoteTexts(targetDoc, email, note, newText) {
  await setDoc(doc(db, 'Users', email, 'Notes', targetDoc), {
    archived: note.content.archived,
    context: newText,
    image_url: null,
    pinned: note.content.pinned,
    title: note.content.title,
    created_time: note.content.created_time,
  });
}

export async function editNoteTitle(targetDoc, email, note, newText) {
  await setDoc(doc(db, 'Users', email, 'Notes', targetDoc), {
    archived: note.content.archived,
    context: note.content.context,
    image_url: null,
    pinned: note.content.pinned,
    title: newText,
    created_time: note.content.created_time,
  });
}

export function getAllNotes(email, ref, setData) {
  const unsub = onSnapshot(
    query(
      collection(db, 'Users', email, 'Notes'),
      orderBy('created_time', 'desc')
    ),
    (querySnapshot) => {
      const notes = [];
      querySnapshot.forEach((doc) => {
        notes.push({ content: doc.data(), id: doc.id, isVisible: true });
      });
      ref.current = notes;
      setData(notes);
    }
  );
  return unsub;
}

export async function addNote(email, callback) {
  await addDoc(collection(db, 'Users', email, 'Notes'), {
    archived: false,
    context: 'New Note',
    image_url: null,
    pinned: false,
    title: 'New Note',
    created_time: serverTimestamp(),
  });
  callback();
}

export async function deleteNote(targetDoc, email, callback) {
  const result = await alerts.needConfirmation(
    'Are you sure?',
    "You won't be able to revert this!",
    'Yes, delete it!',
    'warning'
  );
  result.isConfirmed &&
    (await deleteDoc(doc(db, 'Users', email, 'Notes', targetDoc)));
  alerts.titleOnly('Note deleted!', 'success');
  callback();
}

export async function pinNote(targetDoc, email, note) {
  const newNote = note;
  newNote.pinned = !newNote.pinned;
  await setDoc(doc(db, 'Users', email, 'Notes', targetDoc), newNote);
  alerts.titleOnly(
    newNote.pinned ? 'Pinned to the dashboard!' : 'Note Unpinned!',
    'success'
  );
}

export async function archiveNote(targetDoc, email, note) {
  const newNote = { ...note };
  newNote.archived = true;
  await updateDoc(doc(db, 'Users', email, 'Notes', targetDoc), newNote);
  alerts.titleOnly('Note archived!', 'success');
}

export async function restoreNote(id, email, note) {
  const newNote = { ...note };
  newNote.archived = false;
  await updateDoc(doc(db, 'Users', email, 'Notes', id), newNote);
  alerts.titleOnly('Note restored!', 'success');
}

export async function addTask(status, tasks, email) {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const newCard = {
    task: 'New Task',
    status,
    startDate: now,
    expireDate: tomorrow,
    index: tasks.length ? Number(tasks[0].index) - 1 : 0,
  };

  await addDoc(collection(db, 'Users', email, 'Tasks'), newCard);
  alerts.titleOnly('New card added!', 'success');
}

export function updateTask(email, targetDoc, newCard) {
  updateDoc(doc(db, 'Users', email, 'Tasks', targetDoc), newCard);
}

export async function deleteTask(email, targetId, callback) {
  await deleteDoc(doc(db, 'Users', email, 'Tasks', targetId));
  callback();
  alerts.titleOnly('Task is deleted!', 'success');
}

function getDbFormatCard(obj) {
  const data = JSON.parse(JSON.stringify(obj));
  const startDate_timestamp = new Date(data.start.date);
  const expireDate_timestamp = new Date(data.end.date);
  data.start.date = startDate_timestamp;
  data.end.date = expireDate_timestamp;
  const dbFormatCard = {
    task: data.summary,
    status: data.status,
    startDate: data.start.date,
    expireDate: data.end.date,
    index: data.index,
    visible: true,
  };
  return dbFormatCard;
}

export async function editTask(e, selectedCard, userInput, email) {
  e.preventDefault();
  const card = { ...selectedCard };
  card.summary = userInput.task;
  card.start.date = userInput.startDate;
  card.end.date = userInput.expireDate;
  if (card.start.date > card.end.date) {
    alert('The expiration date must be set after the start date.');
    return;
  }
  await updateDoc(
    doc(db, 'Users', email, 'Tasks', card.docId),
    getDbFormatCard(card)
  );

  alerts.titleOnly('Task is edited!', 'success');
}
