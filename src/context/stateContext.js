import { createContext, useState } from 'react';

export const StateContext = createContext({
  isSearching: false,
  setIsSearching: () => {},
});

export const StateContextProvider = ({ children }) => {
  const [isSearching, setIsSearching] = useState(false);
  return (
    <StateContext.Provider value={{ isSearching, setIsSearching }}>
      {children}
    </StateContext.Provider>
  );
};
