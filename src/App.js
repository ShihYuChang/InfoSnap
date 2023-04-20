import { useState, useEffect, useContext } from 'react';
import ReactLoading from 'react-loading';
import styled from 'styled-components/macro';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { UserContext } from './context/userContext';
import { EventContextProvider } from './context/eventContext';
import { StateContextProvider } from './context/stateContext';
import { DashboardContextProvider } from './context/dashboardContext';
import { createGlobalStyle } from 'styled-components';
import Menu from './components/layouts/Menu/Menu';
import Header from './components/layouts/Header/Header';
import { Outlet } from 'react-router-dom';
import SignInPrompt from './pages/Authentication/SignInPrompt';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';

const GlobalStyle = createGlobalStyle`
  #root{
    position: relative;
    font-family: 'Poppins', sans-serif;
    color: white;
    background-color: #31353F;
  }

  li{
    list-style: none;
  }

  ul{
    padding-left: 5px;
  }
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
`;

const MainContent = styled.div`
  flex-grow: 1;
  min-height: 100vh;
  padding: 48px;
`;

export default function App() {
  const {
    email,
    setEmail,
    hasClickedSignIn,
    hasClickedSignUp,
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
        {/* <Header /> */}
        <Loading type='spinningBubbles' color='#313538' />
      </>
    );
  } else if (!isLoading && !email) {
    return (
      <>
        <Wrapper>
          <Menu />
          <SignInPrompt
            onClick={() => {
              setHasClickedSignIn(true);
            }}
            display={hasClickedSignIn || hasClickedSignUp ? 'none' : 'flex'}
          />
          <SignIn display={hasClickedSignIn ? 'flex' : 'none'} />
          <SignUp display={hasClickedSignUp ? 'flex' : 'none'} />
        </Wrapper>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <EventContextProvider>
        <StateContextProvider>
          <DashboardContextProvider>
            <Wrapper>
              <Menu />
              <MainContent>
                <Header />
                <Outlet />
              </MainContent>
            </Wrapper>
          </DashboardContextProvider>
        </StateContextProvider>
      </EventContextProvider>
    </>
  );
}
