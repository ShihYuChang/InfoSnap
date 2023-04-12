import { createContext, useState } from 'react';

export const UserContext = createContext({
  email: null,
  setEmail: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  return (
    <UserContext.Provider value={{ email, setEmail }}>
      {children}
    </UserContext.Provider>
  );
};
