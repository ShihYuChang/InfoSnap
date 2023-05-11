import { createContext, useState, useRef } from 'react';

export const NoteContext = createContext({
  data: [],
  selectedNote: {},
  selectedIndex: 0,
  isEditingTitle: false,
  titleRef: null,
  textRef: null,
  setData: () => {},
  setSelectedNote: () => {},
  setSelectedIndex: () => {},
  setIsEditingTitle: () => {},
});

export const NoteContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [selectedNote, setSelectedNote] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleRef = useRef(null);
  const textRef = useRef(null);

  return (
    <NoteContext.Provider
      value={{
        data,
        selectedNote,
        setData,
        setSelectedNote,
        selectedIndex,
        setSelectedIndex,
        isEditingTitle,
        setIsEditingTitle,
        titleRef,
        textRef,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};
