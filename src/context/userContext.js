import { createContext, useState } from 'react';

export const UserContext = createContext({
  email: null,
  hasClickedSignIn: false,
  setEmail: () => {},
  setHasClickedSignIn: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [hasClickedSignIn, setHasClickedSignIn] = useState(false);

  return (
    <UserContext.Provider
      value={{ email, setEmail, hasClickedSignIn, setHasClickedSignIn }}
    >
      {children}
    </UserContext.Provider>
  );
};
