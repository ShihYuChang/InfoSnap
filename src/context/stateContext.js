import {
  Timestamp,
  collection,
  endBefore,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { UserContext } from './UserContext';

export const StateContext = createContext({
  isAdding: false,
  isSearching: false,
  selectedDate: new Date().toISOString().slice(0, 10),
  selectedMonth: new Date().getMonth() + 1,
  nutritions: [
    { title: 'Protein', total: 0, goal: 170 },
    { title: 'Carbs', total: 0, goal: 347 },
    { title: 'Fat', total: 0, goal: 69 },
  ],
  userInput: {},
  selectedContextMenu: '',
  selectedTask: null,
  fixedMenuVisible: false,
  isAddingPlan: false,
  hoverIndex: 0,
  isEditingNote: false,
  setIsSearching: () => {},
  setIsAdding: () => {},
  setSelectedDate: () => {},
  setSelectedMonth: () => {},
  setFinanceUserData: () => {},
  setUserInput: () => {},
  setSelectedContextMenu: () => {},
  setSelectedTask: () => {},
  setFixedMenuVisible: () => {},
  setIsAddingPlan: () => {},
  setHoverIndex: () => {},
  setIsEditingNote: () => {},
});

export const StateContextProvider = ({ children }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [nutritions, setNutritions] = useState([
    { title: 'Protein', total: 0, goal: 170 },
    { title: 'Carbs', total: 0, goal: 347 },
    { title: 'Fat', total: 0, goal: 69 },
  ]);
  const [intakeRecords, setIntakeRecords] = useState([]);
  const { email } = useContext(UserContext);
  const [userInput, setUserInput] = useState({});
  const [selectedContextMenu, setSelectedContextMenu] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [fixedMenuVisible, setFixedMenuVisible] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  function getNutritionTotal(data) {
    const contents = [];
    data.forEach((obj) => contents.push(obj.content));
    const totals = contents.reduce(
      (acc, cur) => {
        return {
          protein: Number(acc.protein) + Number(cur.protein),
          carbs: Number(acc.carbs) + Number(cur.carbs),
          fat: Number(acc.fat) + Number(cur.fat),
        };
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
    return totals;
  }

  function updateData(rawData) {
    const newData = [...rawData];
    const intakeToday = getNutritionTotal(intakeRecords);
    newData.forEach((data) => {
      const name = data.title.toLowerCase();
      data.total = intakeToday[name];
    });
    return newData;
  }

  function getTimestamp(date, hr, min, sec, nanosec) {
    const now = new Date(date);
    now.setDate(now.getDate());
    now.setHours(hr, min, sec, nanosec);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
  }

  useEffect(() => {
    const startOfDate = getTimestamp(selectedDate, 0, 0, 0, 0);
    const endOfDate = getTimestamp(selectedDate, 23, 59, 59, 59);

    const foodSnap = onSnapshot(
      query(
        collection(db, 'Users', email, 'Health-Food'),
        orderBy('created_time', 'asc'),
        startAfter(startOfDate),
        endBefore(endOfDate)
      ),
      (querySnapshot) => {
        const records = [];
        querySnapshot.forEach((doc) => {
          records.push({ content: doc.data(), id: doc.id });
        });
        setIntakeRecords(records);
      }
    );

    return () => {
      foodSnap();
    };
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    if (intakeRecords) {
      setNutritions(updateData(nutritions));
    }
  }, [intakeRecords]);

  return (
    <StateContext.Provider
      value={{
        isAdding,
        isSearching,
        setIsAdding,
        setIsSearching,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,
        nutritions,
        userInput,
        setUserInput,
        selectedContextMenu,
        setSelectedContextMenu,
        selectedTask,
        setSelectedTask,
        fixedMenuVisible,
        setFixedMenuVisible,
        isAddingPlan,
        setIsAddingPlan,
        hoverIndex,
        setHoverIndex,
        isEditingNote,
        setIsEditingNote,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
