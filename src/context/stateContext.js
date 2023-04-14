import { createContext, useState } from 'react';

export const StateContext = createContext({
  isAdding: false,
  isSearching: false,
  dailyBudget: null,
  setIsSearching: () => {},
  setIsAdding: () => {},
  setDailyBudget: () => {},
});

export const StateContextProvider = ({ children }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [dailyBudget, setDailyBudget] = useState(null);
  return (
    <StateContext.Provider
      value={{
        isAdding,
        isSearching,
        setIsAdding,
        setIsSearching,
        dailyBudget,
        setDailyBudget,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
