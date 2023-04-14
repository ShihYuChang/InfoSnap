import { useState, useEffect, useContext } from 'react';
import ReactLoading from 'react-loading';
import styled from 'styled-components/macro';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { UserContext } from './context/userContext';
import { EventContextProvider } from './context/eventContext';
import { StateContextProvider } from './context/stateContext';
import { DashboardContextProvider } from './context/dashboardContext';
import { createGlobalStyle } from 'styled-components';
import Header from './components/Header/Header';
import { Outlet } from 'react-router-dom';
import SignInPrompt from './pages/Authentication/SignInPrompt';
import SignIn from './pages/Authentication/SignIn';

const GlobalStyle = createGlobalStyle`
  #root{
    position: relative;
  }

  li{
    list-style: none;
  }
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

export default function App() {
  const {
    email,
    setEmail,
    hasClickedSignIn,
    setHasClickedSignIn,
    isLoading,
    setIsLoading,
  } = useContext(UserContext);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  if (isLoading) {
    return (
      <>
        <Header />
        <Loading type='spinningBubbles' color='#313538' />
      </>
    );
  } else if (!isLoading && !email) {
    return (
      <>
        <Header />
        <SignInPrompt
          onClick={() => {
            setHasClickedSignIn(true);
          }}
          display={hasClickedSignIn ? 'none' : 'flex'}
        />
        <SignIn display={hasClickedSignIn ? 'flex' : 'none'} />
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <EventContextProvider>
        <StateContextProvider>
          <DashboardContextProvider>
            <Header />
            <Outlet />
          </DashboardContextProvider>
        </StateContextProvider>
      </EventContextProvider>
    </>
  );
}
