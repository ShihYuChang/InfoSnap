import { initializeApp } from 'firebase/app';
import {
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
import { alerts } from '../sweetAlert';
import {
  getTimestampDaysAgo,
  getTimestampWithTime,
  parseTimestamp,
} from '../timestamp';

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

export async function initUserDb(userId, name, photo) {
  const now = new Date();
  const currenYear = new Date().getFullYear();
  addDoc(collection(db, 'Users', userId, 'Health-Food'), {
    carbs: 20,
    protein: 5,
    fat: 6,
    note: 'Template',
    created_time: now,
  });
  addDoc(collection(db, 'Users', userId, 'Health-Goal'), {
    carbs: 200,
    protein: 50,
    fat: 60,
    name: 'My Plan',
  });
  addDoc(collection(db, 'Users', userId, 'Finance'), {
    amount: 0,
    categoty: 'food',
    note: 'Template',
    date: now,
    tag: 'expense',
  });
  addDoc(collection(db, 'Users', userId, 'Notes'), {
    archived: false,
    title: 'Template',
    context: 'Template',
    created_time: now,
    image_url: null,
    pinned: true,
  });
  await addDoc(collection(db, 'Users', userId, 'Tasks'), {
    expireDate: now,
    status: 'to-do',
    startDate: now,
    task: 'Template',
    index: 0,
  });
  setDoc(doc(db, 'Users', userId), {
    Name: name,
    photoURL: photo,
    savingsGoal: 0,
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

export async function getMonthlyNetIncome(userId, setRawRecords) {
  const docRef = doc(db, 'Users', userId);
  const docSnap = await getDoc(docRef);
  const readableSnap = docSnap.data();
  const monthlyNet = await readableSnap.monthlyNetIncome;
  const currentYear = new Date().getFullYear();
  const thisYearMonthlyNet = monthlyNet[currentYear];
  setRawRecords(thisYearMonthlyNet);
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

export async function storeIntake(e, userInput, timestamp, email, handleExit) {
  e.preventDefault();

  const inputWithTime = { ...userInput, created_time: timestamp };
  try {
    await alerts.regular('Saved!', 'New record has been added.', 'success');
    handleExit();
    await addDoc(collection(db, 'Users', email, 'Health-Food'), inputWithTime);
  } catch (error) {
    alerts.titleOnly(
      'Failed to add new record, please try again later.',
      'error'
    );
  }
}

export async function storeHealthPlan(
  e,
  userInput,
  selectedDate,
  email,
  handleExit
) {
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
      handleExit();
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
  const startOfToday = getTimestampDaysAgo(daysAgo, 0, 0, 0, 0);
  const endOfToday = getTimestampDaysAgo(daysAgo, 23, 59, 59, 59);
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

export async function storeSearchedFood(
  selectedFood,
  created_time,
  handleExit,
  email
) {
  // const now = new Date();
  const dataToStore = {
    note: selectedFood.name,
    carbs: selectedFood.nutritions[2].qty,
    protein: selectedFood.nutritions[0].qty,
    fat: selectedFood.nutritions[1].qty,
    created_time: created_time,
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

export async function addNote(email, setSelectedNoteIndex) {
  await addDoc(collection(db, 'Users', email, 'Notes'), {
    archived: false,
    context: 'New Note',
    image_url: null,
    pinned: false,
    title: 'New Note',
    created_time: serverTimestamp(),
  });
  setSelectedNoteIndex(0);
}

export async function deleteNote(
  targetDoc,
  email,
  notes,
  setSelectedNoteIndex,
  isDisplayArchived
) {
  const result = await alerts.needConfirmation(
    'Are you sure?',
    "You won't be able to revert this!",
    'Yes, delete it!',
    'warning'
  );
  if (result.isConfirmed) {
    await deleteDoc(doc(db, 'Users', email, 'Notes', targetDoc));
    alerts.titleOnly('Note deleted!', 'success');
    const visibleNotes = notes.filter((note) =>
      isDisplayArchived ? note.content.archived : !note.content.archived
    );
    const firstVisibleNoteIndex = notes.findIndex(
      (note) => note.id === visibleNotes[0].id
    );
    setSelectedNoteIndex(firstVisibleNoteIndex);
  } else {
    return;
  }
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

function getDbFormatTask(obj) {
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
    getDbFormatTask(card)
  );

  alerts.titleOnly('Task is edited!', 'success');
}

export async function storeMultipleTasks(tasks, email) {
  tasks.forEach((event, index) => {
    const dbFormatEvent = getDbFormatTask(event);
    dbFormatEvent.index += Number(index);
    addDoc(collection(db, 'Users', email, 'Tasks'), dbFormatEvent);
  });
}

async function fetchTasks(query, callback) {
  const taskSub = onSnapshot(query, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        start: { date: parseTimestamp(data.startDate, 'YYYY-MM-DD') },
        end: { date: parseTimestamp(data.expireDate, 'YYYY-MM-DD') },
        summary: data.task,
        visible: true,
        status: data.status,
        docId: doc.id,
        index: data.index,
      });
    });
    callback(tasks);
  });

  return taskSub;
}

export async function getTasks(userId, setTasks, setTodayTasks) {
  const startOfToday = getTimestampDaysAgo(0, 0, 0, 0);
  const endOfToday = getTimestampDaysAgo(0, 23, 59, 59);

  const allTasksQuery = query(
    collection(db, 'Users', userId, 'Tasks'),
    orderBy('index', 'asc')
  );
  const todayTasksQuery = query(
    collection(db, 'Users', userId, 'Tasks'),
    orderBy('startDate', 'asc'),
    startAfter(startOfToday),
    endBefore(endOfToday)
  );

  await Promise.all([
    fetchTasks(allTasksQuery, setTasks),
    fetchTasks(todayTasksQuery, setTodayTasks),
  ]);
}

export async function getExpenseRecords(
  userId,
  setExpenseRecords,
  getMonthExpense
) {
  const expenseQuery = query(
    collection(db, 'Users', userId, 'Finance'),
    orderBy('date', 'asc')
  );

  const financeUnsub = onSnapshot(expenseQuery, (docs) => {
    const records = [];
    docs.forEach((doc) => {
      records.push({ ...doc.data(), docId: doc.id });
    });
    setExpenseRecords(records);
    getMonthExpense(records);
  });
  return financeUnsub;
}

export async function gerExpenseBeforeDate(
  selectedDate,
  userId,
  setExpenseRecordsWithDate
) {
  const endOfDate = getTimestampWithTime(selectedDate, 23, 59, 59, 59);

  const expenseQuery = query(
    collection(db, 'Users', userId, 'Finance'),
    orderBy('date', 'asc'),
    endBefore(endOfDate)
  );

  const unsub = onSnapshot(expenseQuery, (docs) => {
    const records = [];
    docs.forEach((doc) => {
      records.push({ ...doc.data(), docId: doc.id });
    });
    setExpenseRecordsWithDate(records);
  });
  return unsub;
}

export async function getUserFinanceData(userId, setUserFinanceData) {
  const userUnsub = onSnapshot(doc(db, 'Users', userId), (doc) => {
    const data = doc.data();
    const income = data?.monthlyIncome;
    const goal = data?.savingsGoal;
    setUserFinanceData({
      income: income,
      savingsGoal: goal,
      currentHealthGoal: data?.currentHealthGoal,
    });
  });
  return userUnsub;
}

export async function fetchCollection(
  userId,
  targetCollection,
  allData,
  category,
  setAllData
) {
  const snap = onSnapshot(
    collection(db, 'Users', userId, targetCollection),
    (snapshot) => {
      const records = [];
      snapshot.forEach((doc) => {
        records.push({ content: doc.data(), id: doc.id });
      });
      allData[category] = records;
      setAllData(allData);
    }
  );

  return snap;
}
