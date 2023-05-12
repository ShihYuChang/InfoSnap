import { createContext, useState } from 'react';

export const StateContext = createContext({
  isAdding: false,
  isSearching: false,
  selectedDate: new Date().toISOString().slice(0, 10),
  selectedMonth: new Date().getMonth() + 1,
  nutritions: [
    { title: 'Protein', total: 0, goal: 170 },
    { title: 'Carbs', total: 0, goal: 347 },
    { title: 'Fat', total: 0, goal: 69 },
  ],
  userInput: {},
  selectedContextMenu: '',
  selectedTask: null,
  fixedMenuVisible: false,
  isAddingPlan: false,
  hoverIndex: 0,
  isEditingNote: false,
  setIsSearching: () => {},
  setIsAdding: () => {},
  setSelectedDate: () => {},
  setSelectedMonth: () => {},
  setFinanceUserData: () => {},
  setUserInput: () => {},
  setSelectedContextMenu: () => {},
  setSelectedTask: () => {},
  setFixedMenuVisible: () => {},
  setIsAddingPlan: () => {},
  setHoverIndex: () => {},
  setIsEditingNote: () => {},
});

export const StateContextProvider = ({ children }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [userInput, setUserInput] = useState({});
  const [selectedContextMenu, setSelectedContextMenu] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [fixedMenuVisible, setFixedMenuVisible] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  return (
    <StateContext.Provider
      value={{
        isAdding,
        isSearching,
        setIsAdding,
        setIsSearching,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,
        userInput,
        setUserInput,
        selectedContextMenu,
        setSelectedContextMenu,
        selectedTask,
        setSelectedTask,
        fixedMenuVisible,
        setFixedMenuVisible,
        isAddingPlan,
        setIsAddingPlan,
        hoverIndex,
        setHoverIndex,
        isEditingNote,
        setIsEditingNote,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
