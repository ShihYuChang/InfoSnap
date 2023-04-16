import { createContext, useState, useEffect } from 'react';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { extensionDb } from '../firebase';

export const PageContext = createContext({
  page: 'finance',
  todayBudget: 0,
  setPage: () => {},
});

export const PageContextProvider = ({ children }) => {
  const [page, setPage] = useState('finance');
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [userData, setUserData] = useState({});
  const [todayBudget, setTodayBudget] = useState(0);

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
    return diffInDays;
  }

  function parseTimestamp(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const formattedDate = date.toISOString().substring(0, 10);
    return formattedDate;
  }

  useEffect(() => {
    const userUnsub = onSnapshot(
      doc(extensionDb, 'Users', 'sam21323@gmail.com'),
      (doc) => {
        const data = doc.data();
        const income = data.monthlyIncome;
        const goal = data.savingsGoal;
        setUserData({ income: income, savingsGoal: goal });
      }
    );

    const financeUnsub = onSnapshot(
      collection(extensionDb, 'Users', 'sam21323@gmail.com', 'Finance'),
      (docs) => {
        const records = [];
        docs.forEach((doc) => {
          records.push({ ...doc.data(), docId: doc.id });
        });
        setExpenseRecords(records);
      }
    );
    return () => {
      userUnsub();
      financeUnsub();
    };
  }, []);

  useEffect(() => {
    const dailyBudget = Math.round(
      Number(userData.income - getTotalExpense(expenseRecords)) / getDaysLeft(0)
    );

    const records = [...expenseRecords];
    const dailyExpense = records.reduce((acc, cur) => {
      const date = parseTimestamp(cur.date);
      const amount = Number(cur.amount);
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    }, {});

    const today = new Date().toISOString().slice(0, 10);
    const todayExpense = dailyExpense[today];
    const todayBudget = dailyBudget - todayExpense;
    setTodayBudget(todayBudget);
  }, [expenseRecords]);

  return (
    <PageContext.Provider value={{ page, setPage, todayBudget }}>
      {children}
    </PageContext.Provider>
  );
};
