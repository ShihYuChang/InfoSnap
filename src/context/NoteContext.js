import { createContext, useRef, useState } from 'react';

export const NoteContext = createContext({
  data: [],
  selectedNoteIndex: 0,
  isEditingTitle: false,
  titleRef: null,
  textRef: null,
  setData: () => {},
  setSelectedNoteIndex: () => {},
  setIsEditingTitle: () => {},
});

export const NoteContextProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleRef = useRef(null);
  const textRef = useRef(null);

  return (
    <NoteContext.Provider
      value={{
        data,
        setData,
        selectedNoteIndex,
        setSelectedNoteIndex,
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
