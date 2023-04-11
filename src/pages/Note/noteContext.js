import { createContext, useState } from 'react';

export const NoteContext = createContext({
  data: [],
  selectedNote: '',
  setData: () => {},
  setSelectedNote: () => {},
});

export const NoteContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [selectedNote, setSelectedNote] = useState([]);
  return (
    <NoteContext.Provider
      value={{ data, selectedNote, setData, setSelectedNote }}
    >
      {children}
    </NoteContext.Provider>
  );
};
