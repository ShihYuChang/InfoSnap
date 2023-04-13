import { createContext, useState } from 'react';

export const UserContext = createContext({
  email: null,
  hasClickedSignIn: false,
  isLoading: true,
  setEmail: () => {},
  setHasClickedSignIn: () => {},
  setIsLoading: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [hasClickedSignIn, setHasClickedSignIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <UserContext.Provider
      value={{
        email,
        setEmail,
        hasClickedSignIn,
        setHasClickedSignIn,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
