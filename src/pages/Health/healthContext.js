import { useState, createContext } from 'react';

export const HealthContext = createContext({
  searchedFood: [],
  selectedFood: null,
  setSearchedFood: () => {},
  setSelectedFood: () => {},
});

export const HealthContextProvider = ({ children }) => {
  const [searchedFood, setSearchedFood] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  return (
    <HealthContext.Provider
      value={{
        searchedFood,
        setSearchedFood,
        selectedFood,
        setSelectedFood,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};
