import { createContext, useEffect, useState } from 'react';
import { fetchCollection } from '../utils/firebase';

export const UserContext = createContext({
  hasClickedSignIn: false,
  hasClickedSignUp: false,
  isLoading: true,
  selectedOption: 'DASHBOARD',
  allData: {},
  hasSearch: false,
  isSearching: false,
  isCollapsed: false,
  userInfo: null,
  name: null,
  isDisplaySheet: false,
  setHasClickedSignIn: () => {},
  setIsLoading: () => {},
  setHasClickedSignUp: () => {},
  setSelectedOption: () => {},
  setHasSearch: () => {},
  setIsSearching: () => {},
  setIsCollapsed: () => {},
  setUserInfo: () => {},
  setName: () => {},
  setIsDisplaySheet: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [name, setName] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDisplaySheet, setIsDisplaySheet] = useState(false);

  useEffect(() => {
    if (userInfo) {
      const newData = { ...allData };
      const refs = [
        {
          category: 'finance',
          collection: 'Finance',
        },
        {
          category: 'notes',
          collection: 'Notes',
        },
        {
          category: 'tasks',
          collection: 'Tasks',
        },
        {
          category: 'health',
          collection: 'Health-Food',
        },
      ];
      refs.forEach((item) =>
        fetchCollection(
          userInfo.email,
          item.collection,
          newData,
          item.category,
          setAllData
        )
      );
    }
  }, [userInfo]);

  return (
    <UserContext.Provider
      value={{
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
        isCollapsed,
        setIsCollapsed,
        userInfo,
        setUserInfo,
        name,
        setName,
        isDisplaySheet,
        setIsDisplaySheet,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
