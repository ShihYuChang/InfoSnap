import { createContext, useState, useEffect } from 'react';
import { onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '../firebase';
import { orderBy } from 'lodash';

export const UserContext = createContext({
  email: null,
  hasClickedSignIn: false,
  hasClickedSignUp: false,
  isLoading: true,
  selectedOption: 'DASHBOARD',
  allData: {},
  hasSearch: false,
  isSearching: false,
  setEmail: () => {},
  setHasClickedSignIn: () => {},
  setIsLoading: () => {},
  setHasClickedSignUp: () => {},
  setSelectedOption: () => {},
  setHasSearch: () => {},
  setIsSearching: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [hasClickedSignIn, setHasClickedSignIn] = useState(false);
  const [hasClickedSignUp, setHasClickedSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('DASHBOARD');
  const [allData, setAllData] = useState({
    finance: null,
    notes: null,
    tasks: null,
    health: null,
  });
  const [hasSearch, setHasSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (email) {
      const newData = { ...allData };
      const financeRef = collection(db, 'Users', email, 'Finance');
      const noteRef = collection(db, 'Users', email, 'Notes');
      const taskRef = collection(db, 'Users', email, 'Tasks');
      const healthRef = collection(db, 'Users', email, 'Health-Food');

      const financeSnap = onSnapshot(financeRef, (snapshot) => {
        const records = [];
        snapshot.forEach((doc) => {
          records.push({ content: doc.data(), id: doc.id });
        });
        newData.finance = records;
        setAllData(newData);
      });

      const noteSnap = onSnapshot(noteRef, (snapshot) => {
        const notes = [];
        snapshot.forEach((doc) => {
          notes.push({ content: doc.data(), id: doc.id });
        });
        newData.notes = notes;
        setAllData(newData);
      });

      const tasksSnap = onSnapshot(taskRef, (snapshot) => {
        const tasks = [];
        snapshot.forEach((doc) => {
          tasks.push({ content: doc.data(), id: doc.id });
        });
        newData.tasks = tasks;
        setAllData(newData);
      });

      const healthSnap = onSnapshot(
        query(healthRef, orderBy('created_time', 'asc')),
        (snapshot) => {
          const intakes = [];
          snapshot.forEach((doc) => {
            intakes.push({ content: doc.data(), id: doc.id });
          });
          newData.health = intakes;
          setAllData(newData);
        }
      );

      return () => {
        financeSnap();
        noteSnap();
        tasksSnap();
        healthSnap();
      };
    }
  }, [email]);

  return (
    <UserContext.Provider
      value={{
        email,
        setEmail,
        hasClickedSignIn,
        setHasClickedSignIn,
        hasClickedSignUp,
        setHasClickedSignUp,
        isLoading,
        setIsLoading,
        selectedOption,
        setSelectedOption,
        allData,
        hasSearch,
        setHasSearch,
        isSearching,
        setIsSearching,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
