import { useState, createContext } from 'react';

export const HealthContext = createContext({
  selectedFood: null,
  setSelectedFood: () => {},
});

export const HealthContextProvider = ({ children }) => {
  const [selectedFood, setSelectedFood] = useState(null);
  return (
    <HealthContext.Provider value={{ selectedFood, setSelectedFood }}>
      {children}
    </HealthContext.Provider>
  );
};
