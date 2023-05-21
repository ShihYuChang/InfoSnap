import { createContext, useContext, useEffect, useState } from 'react';
import {
  gerExpenseBeforeDate,
  getExpenseRecords,
  getMonthlyNetIncome,
  getUserFinanceData,
} from '../utils/firebase/firebase';
import { parseTimestamp } from '../utils/timestamp';
import { StateContext } from './StateContext';
import { UserContext } from './UserContext';

export const FinanceContext = createContext({
  dailyBudget: null,
  userFinanceData: {},
  expenseRecords: [],
  monthExpense: [],
  todayBudget: 0,
  netIncome: 0,
  categories: [],
  todayExpense: [],
  monthlyIncome: [],
  setExpenseRecords: () => {},
  setMonthlyIncome: () => {},
});

export const FinanceContextProvider = ({ children }) => {
  const { selectedDate, selectedMonth } = useContext(StateContext);
  const [userFinanceData, setUserFinanceData] = useState({});
  const [dailyBudget, setDailyBudget] = useState(null);
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [monthExpense, setMonthExpense] = useState([]);
  const [todayExpense, setTodayExpense] = useState([]);
  const [todayBudget, setTodayBudget] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [categories, setCategories] = useState([
    { tag: 'food', amount: 0, color: '#ff5757' },
    { tag: 'traffic', amount: 0, color: '#ffbc1f' },
    { tag: 'education', amount: 0, color: '#9f5aff' },
    { tag: 'entertainment', amount: 0, color: '#5affd4' },
    { tag: 'others', amount: 0, color: '#6199f9' },
  ]);
  const [totals, setTotals] = useState({
    food: 0,
    traffic: 0,
    entertainment: 0,
    education: 0,
    others: 0,
  });
  const [monthlyIncome, setMonthlyIncome] = useState([]);

  const { userInfo } = useContext(UserContext);
  const email = userInfo?.email;
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

  function getMonthExpense(records) {
    const allRecords = [...records];
    const recordThisMonth = allRecords.filter((record) => {
      const date = record.date.toDate();
      const month = date.getMonth() + 1;
      return month === selectedMonth;
    });
    setMonthExpense(recordThisMonth);
  }

  function getYearExpense(data) {
    const monthlyTotal = Array(12).fill(0);
    data.forEach((entry) => {
      const month = new Date(entry.date.seconds * 1000).getMonth();
      const amount = Number(entry.amount);
      monthlyTotal[month] += amount;
    });
    return monthlyTotal;
  }

  useEffect(() => {
    getExpenseRecords(email, setExpenseRecords, getMonthExpense);
    gerExpenseBeforeDate(selectedDate, email, setExpenseRecords);
    getUserFinanceData(email, setUserFinanceData);
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    const selectedDateTimestamp = new Date(selectedDate);
    const dailyBudget = Math.round(
      Number(
        userFinanceData.income -
          getTotalExpense(monthExpense) -
          userFinanceData.savingsGoal
      ) / getDaysLeft(selectedDateTimestamp)
    );

    const records = [...expenseRecords];
    const dailyExpense = records.reduce((acc, cur) => {
      const date = parseTimestamp(cur.date, 'YYYY-MM-DD');
      const amount = Number(cur.amount);
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    }, {});

    const today = selectedDateTimestamp.toISOString().slice(0, 10);
    const todayExpense = dailyExpense[today] ?? 0;
    const todayBudget = dailyBudget - todayExpense;

    const netIncome = userFinanceData.income - getTotalExpense(monthExpense);

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

    const yearIncome = monthlyIncome.map((income, index) =>
      getYearExpense(expenseRecords)[index] === 0
        ? 0
        : userFinanceData.income - getYearExpense(expenseRecords)[index]
    );

    setTotals(categoryTotals);
    setTodayBudget(todayBudget);
    setDailyBudget(dailyBudget);
    setNetIncome(netIncome);
    setTodayExpense(todayExpense);
    setMonthlyIncome(yearIncome);
  }, [userFinanceData, expenseRecords]);

  useEffect(() => {
    if (totals) {
      const clonedCategories = JSON.parse(JSON.stringify(categories));
      clonedCategories.forEach((category) => {
        const tag = category.tag;
        category.amount = parseInt(totals[tag]);
      });
      setCategories(clonedCategories);
    }
  }, [totals]);

  useEffect(() => {
    getMonthlyNetIncome(email, setMonthlyIncome);
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        dailyBudget,
        expenseRecords,
        setExpenseRecords,
        monthExpense,
        todayBudget,
        netIncome,
        categories,
        todayExpense,
        userFinanceData,
        setUserFinanceData,
        monthlyIncome,
        setMonthlyIncome,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
