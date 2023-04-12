import { createContext, useState } from 'react';

export const DashboardContext = createContext({
  pinnedNoted: null,
  setPinnedNote: () => {},
});

export const DashboardContextProvider = ({ children }) => {
  const [pinnedNoted, setPinnedNote] = useState(null);
  return (
    <DashboardContext.Provider value={{ pinnedNoted, setPinnedNote }}>
      {children}
    </DashboardContext.Provider>
  );
};
