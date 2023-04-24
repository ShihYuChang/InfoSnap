import { createContext, useState, useEffect } from 'react';
import { onSnapshot, collection, doc } from 'firebase/firestore';
import { extensionDb } from '../firebase';

export const PageContext = createContext({
  page: 'tasks',
  todayBudget: 0,
  isSignIn: false,
  email: null,
  isLoading: true,
  userInput: {},
  setPage: () => {},
  setIsSignIn: () => {},
  setEmail: () => {},
  setIsLoading: () => {},
  setUserInput: () => {},
});

export const PageContextProvider = ({ children }) => {
  const [isSignIn, setIsSignIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState('tasks');
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [userData, setUserData] = useState({});
  const [todayBudget, setTodayBudget] = useState(0);
  const [email, setEmail] = useState(null);
  const [userInput, setUserInput] = useState({});
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
    if (email) {
      const userUnsub = onSnapshot(doc(extensionDb, 'Users', email), (doc) => {
        const data = doc.data();
        const income = data.monthlyIncome;
        const goal = data.savingsGoal;
        setUserData({ income: income, savingsGoal: goal });
      });

      const financeUnsub = onSnapshot(
        collection(extensionDb, 'Users', email, 'Finance'),
        (docs) => {
          const records = [];
          docs.forEach((doc) => {
            records.push(doc ? { ...doc.data(), docId: doc.id } : []);
          });
          setExpenseRecords(records);
        }
      );

      return () => {
        userUnsub();
        financeUnsub();
      };
    }
  }, [email]);

  useEffect(() => {
    if (expenseRecords.length > 0) {
      const now = new Date();
      const dailyBudget = Math.round(
        Number(
          userData.income -
            getTotalExpense(expenseRecords) -
            userData.savingsGoal
        ) / getDaysLeft(now)
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
    }
  }, [expenseRecords]);

  return (
    <PageContext.Provider
      value={{
        page,
        setPage,
        todayBudget,
        isSignIn,
        setIsSignIn,
        email,
        setEmail,
        isLoading,
        setIsLoading,
        userInput,
        setUserInput,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
