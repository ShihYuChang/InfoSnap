import { createContext, useState, useEffect } from 'react';

export const NoteContext = createContext({
  data: [],
  selectedNote: {},
  selectedIndex: null,
  setData: () => {},
  setSelectedNote: () => {},
  setSelectedIndex: () => {},
});

export const NoteContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [selectedNote, setSelectedNote] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <NoteContext.Provider
      value={{
        data,
        selectedNote,
        setData,
        setSelectedNote,
        selectedIndex,
        setSelectedIndex,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
