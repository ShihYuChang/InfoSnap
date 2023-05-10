import { createContext, useState } from 'react';

export const IndexContext = createContext({
  isSearching: false,
  setIsSearching: () => {},
});

export const IndexContextProvider = ({ children }) => {
  const [isSearching, setIsSearching] = useState(false);
  return (
    <IndexContext.Provider value={{ isSearching, setIsSearching }}>
      {children}
    </IndexContext.Provider>
  );
};
