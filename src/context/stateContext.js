import {
  Timestamp,
  collection,
  doc,
  endBefore,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { EventContext } from './EventContext';
import { UserContext } from './UserContext';

export const StateContext = createContext({
  headerIcons: [],
  isAdding: false,
  isSearching: false,
  selectedDate: new Date().toISOString().slice(0, 10),
  selectedMonth: new Date().getMonth() + 1,
  dailyBudget: null,
  userData: {},
  expenseRecords: [],
  monthExpense: [],
  todayBudget: 0,
  netIncome: 0,
  categories: [
    { tag: 'food', amount: 0, color: 'red' },
    { tag: 'traffic', amount: 0, color: 'orange' },
    { tag: 'education', amount: 0, color: 'yellow' },
    { tag: 'entertainment', amount: 0, color: 'green' },
    { tag: 'others', amount: 0, color: 'blue' },
  ],
  todayExpense: [],
  nutritions: [
    { title: 'Protein', total: 0, goal: 170 },
    { title: 'Carbs', total: 0, goal: 347 },
    { title: 'Fat', total: 0, goal: 69 },
  ],
  expenseRecordsWithDate: [],
  userInput: {},
  selectedContextMenu: '',
  selectedTask: null,
  fixedMenuVisible: false,
  isAddingPlan: false,
  hoverIndex: 0,
  isEditingNote: false,
  setHeaderIcons: () => {},
  setIsSearching: () => {},
  setIsAdding: () => {},
  setSelectedDate: () => {},
  setSelectedMonth: () => {},
  setDailyBudget: () => {},
  setUserData: () => {},
  setExpenseRecords: () => {},
  setMonthExpense: () => {},
  setTodayBudget: () => {},
  setNetIncome: () => {},
  setUserInput: () => {},
  setSelectedContextMenu: () => {},
  setSelectedTask: () => {},
  setFixedMenuVisible: () => {},
  setIsAddingPlan: () => {},
  setHoverIndex: () => {},
  setIsEditingNote: () => {},
});

export const StateContextProvider = ({ children }) => {
  const [headerIcons, setHeaderIcons] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [dailyBudget, setDailyBudget] = useState(null);
  const [userData, setUserData] = useState({});
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [monthExpense, setMonthExpense] = useState([]);
  const [dailyTotalExpense, setDailyTotalExpense] = useState([]);
  const [todayExpense, setTodayExpense] = useState([]);
  const [todayBudget, setTodayBudget] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [totals, setTotals] = useState({
    food: 0,
    traffic: 0,
    entertainment: 0,
    education: 0,
    others: 0,
  });
  const [categories, setCategories] = useState([
    { tag: 'food', amount: 0, color: 'red' },
    { tag: 'traffic', amount: 0, color: 'orange' },
    { tag: 'education', amount: 0, color: 'yellow' },
    { tag: 'entertainment', amount: 0, color: 'green' },
    { tag: 'others', amount: 0, color: 'blue' },
  ]);
  const [nutritions, setNutritions] = useState([
    { title: 'Protein', total: 0, goal: 170 },
    { title: 'Carbs', total: 0, goal: 347 },
    { title: 'Fat', total: 0, goal: 69 },
  ]);
  const [intakeRecords, setIntakeRecords] = useState([]);
  const { email } = useContext(UserContext);
  const { setTodayTasks, setTasks } = useContext(EventContext);
  const [expenseRecordsWithDate, setExpenseRecordsWithDate] = useState([]);
  const [userInput, setUserInput] = useState({});
  const [selectedContextMenu, setSelectedContextMenu] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [fixedMenuVisible, setFixedMenuVisible] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  function getTotalExpense(data) {
    return data.reduce((acc, cur) => {
      return acc + Number(cur.amount);
    }, 0);
  }

  function getDaysLeft(date) {
    const now = new Date(date);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diffInMs = endOfMonth - now;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

    return diffInDays > 0 ? diffInDays : 1;
  }

  function parseTimestamp(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const formattedDate = date.toISOString().substring(0, 10);
    return formattedDate;
  }

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

  function getMonthExpense(records) {
    const allRecords = [...records];
    const currentMonth = new Date().getMonth() + 1;
    const recordThisMonth = allRecords.filter((record) => {
      const date = record.date.toDate();
      const month = date.getMonth() + 1;
      // return month === currentMonth;
      return month === selectedMonth;
    });
    setMonthExpense(recordThisMonth);
  }

  useEffect(() => {
    const startOfDate = getTimestamp(selectedDate, 0, 0, 0, 0);
    const endOfDate = getTimestamp(selectedDate, 23, 59, 59, 59);

    const dateExpenseQuery = query(
      collection(db, 'Users', email, 'Finance'),
      orderBy('date', 'asc')
    );

    const dashboardExpenseQuery = query(
      collection(db, 'Users', email, 'Finance'),
      orderBy('date', 'asc'),
      endBefore(endOfDate)
    );

    const userUnsub = onSnapshot(doc(db, 'Users', email), (doc) => {
      const data = doc.data();
      const income = data?.monthlyIncome;
      const goal = data?.savingsGoal;
      setUserData({
        income: income,
        savingsGoal: goal,
        currentHealthGoal: data?.currentHealthGoal,
      });
    });

    const financeUnsub = onSnapshot(dateExpenseQuery, (docs) => {
      const records = [];
      docs.forEach((doc) => {
        records.push({ ...doc.data(), docId: doc.id });
      });
      setExpenseRecords(records);
      getMonthExpense(records);
    });

    const dashboadFinanceUnsub = onSnapshot(dashboardExpenseQuery, (docs) => {
      const records = [];
      docs.forEach((doc) => {
        records.push({ ...doc.data(), docId: doc.id });
      });
      setExpenseRecordsWithDate(records);
    });

    const allTasksQuery = query(collection(db, 'Users', email, 'Tasks'));
    const todayTasksQuery = query(
      collection(db, 'Users', email, 'Tasks'),
      orderBy('startDate', 'asc'),
      startAfter(startOfDate),
      endBefore(endOfDate)
    );

    const allTaskSub = onSnapshot(allTasksQuery, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          start: { date: parseTimestamp(data?.startDate) },
          end: { date: parseTimestamp(data?.expireDate) },
          summary: data?.task,
          visible: true,
          status: data?.status,
          docId: doc.id,
        });
      });
      setTasks(tasks);
    });

    const todayTaskSub = onSnapshot(todayTasksQuery, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          start: { date: parseTimestamp(data?.startDate) },
          end: { date: parseTimestamp(data?.expireDate) },
          summary: data?.task,
          visible: true,
          status: data?.status,
          docId: doc.id,
        });
      });
      setTodayTasks(tasks);
    });

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
      userUnsub();
      financeUnsub();
      dashboadFinanceUnsub();
      allTaskSub();
      todayTaskSub();
      foodSnap();
    };
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    const selectedDateTimestamp = new Date(selectedDate);
    const dailyBudget = Math.round(
      Number(
        userData.income - getTotalExpense(monthExpense) - userData.savingsGoal
      ) / getDaysLeft(selectedDateTimestamp)
    );

    const records = [...expenseRecordsWithDate];
    const dailyExpense = records.reduce((acc, cur) => {
      const date = parseTimestamp(cur.date);
      const amount = Number(cur.amount);
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    }, {});

    const today = selectedDateTimestamp.toISOString().slice(0, 10);
    const todayExpense = dailyExpense[today] ?? 0;
    const todayBudget = dailyBudget - todayExpense;

    const netIncome = userData.income - getTotalExpense(monthExpense);

    const allCategories = [
      'food',
      'traffic',
      'entertainment',
      'education',
      'others',
    ];

    const categoryTotals = allCategories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});

    records.forEach((record) => {
      const category = record.category;
      const amount = parseInt(record.amount);
      categoryTotals[category] += amount;
    });

    setTotals(categoryTotals);

    setTodayBudget(todayBudget);
    setDailyTotalExpense(dailyExpense);
    setDailyBudget(dailyBudget);
    setNetIncome(netIncome);
    setTodayExpense(todayExpense);
  }, [userData, expenseRecordsWithDate]);

  useEffect(() => {
    if (totals.food > 0) {
      const clonedCategories = JSON.parse(JSON.stringify(categories));
      clonedCategories.forEach((category) => {
        const tag = category.tag;
        category.amount = parseInt(totals[tag]);
      });
      setCategories(clonedCategories);
    }
  }, [totals]);

  useEffect(() => {
    if (intakeRecords) {
      setNutritions(updateData(nutritions));
    }
  }, [intakeRecords]);

  return (
    <StateContext.Provider
      value={{
        headerIcons,
        setHeaderIcons,
        isAdding,
        isSearching,
        setIsAdding,
        setIsSearching,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,
        dailyBudget,
        setDailyBudget,
        userData,
        setUserData,
        expenseRecords,
        setExpenseRecords,
        monthExpense,
        setMonthExpense,
        todayBudget,
        setTodayBudget,
        netIncome,
        setNetIncome,
        categories,
        todayExpense,
        nutritions,
        expenseRecordsWithDate,
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
