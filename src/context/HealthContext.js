import { createContext, useState } from 'react';

const initialNutrition = [
  { title: 'Protein', total: 0, goal: 170 },
  { title: 'Carbs', total: 0, goal: 347 },
  { title: 'Fat', total: 0, goal: 69 },
];

export const HealthContext = createContext({
  intakeRecords: [],
  searchedFood: [],
  selectedFood: null,
  nutritions: initialNutrition,
  isLoading: false,
  setSearchedFood: () => {},
  setSelectedFood: () => {},
  setNutritions: () => {},
  setIntakeRecords: () => {},
  setIsLoading: () => {},
});

export const HealthContextProvider = ({ children }) => {
  const [intakeRecords, setIntakeRecords] = useState([]);
  const [nutritions, setNutritions] = useState(initialNutrition);
  const [searchedFood, setSearchedFood] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <HealthContext.Provider
      value={{
        searchedFood,
        setSearchedFood,
        selectedFood,
        setSelectedFood,
        nutritions,
        setNutritions,
        intakeRecords,
        setIntakeRecords,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};
