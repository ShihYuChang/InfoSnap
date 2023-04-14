import { createContext, useState } from 'react';

export const UserContext = createContext({
  email: null,
  hasClickedSignIn: false,
  hasClickedSignUp: false,
  isLoading: true,
  setEmail: () => {},
  setHasClickedSignIn: () => {},
  setIsLoading: () => {},
  setHasClickedSignUp: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [hasClickedSignIn, setHasClickedSignIn] = useState(false);
  const [hasClickedSignUp, setHasClickedSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <UserContext.Provider
      value={{
        email,
        setEmail,
        hasClickedSignIn,
        setHasClickedSignIn,
        hasClickedSignUp,
        setHasClickedSignUp,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
