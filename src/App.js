import { useState, useEffect } from 'react';
import ReactLoading from 'react-loading';
import styled from 'styled-components/macro';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { UserContextProvider } from './context/userContext';
import { EventContextProvider } from './context/eventContext';
import { StateContextProvider } from './context/stateContext';
import { DashboardContextProvider } from './context/dashboardContext';
import { createGlobalStyle } from 'styled-components';
import Header from './components/Header/Header';
import { Outlet } from 'react-router-dom';

const GlobalStyle = createGlobalStyle`
  #root{
    position: relative;
  }
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        setIsLoading(false);
      } else {
        console.log('error');
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
  }
  return (
    <>
      <GlobalStyle />
      <UserContextProvider>
        <EventContextProvider>
          <StateContextProvider>
            <DashboardContextProvider>
              <Header />
              <Outlet />
            </DashboardContextProvider>
          </StateContextProvider>
        </EventContextProvider>
      </UserContextProvider>
    </>
  );
}
