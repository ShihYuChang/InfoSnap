import { createContext, useState } from 'react';

export const StateContext = createContext({
  isAdding: false,
  isSearching: false,
  setIsSearching: () => {},
  setIsAdding: () => {},
});

export const StateContextProvider = ({ children }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  return (
    <StateContext.Provider
      value={{ isAdding, isSearching, setIsAdding, setIsSearching }}
    >
      {children}
    </StateContext.Provider>
  );
};
