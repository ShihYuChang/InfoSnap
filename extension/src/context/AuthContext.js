import { createContext, useState } from 'react';

export const AuthContext = createContext({
  isSignUp: false,
  setIsSignUp: () => {},
});

export default function AuthContextProvider({ children }) {
  const [isSignUp, setIsSignUp] = useState(false);
  return (
    <AuthContext.Provider value={{ isSignUp, setIsSignUp }}>
      {children}
    </AuthContext.Provider>
  );
}
