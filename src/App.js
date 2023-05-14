import { useContext, useEffect, useRef } from 'react';
import ReactLoading from 'react-loading';
import { Outlet, useLocation } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components/macro';
import Logo from './components/Logo/Logo';
import Header from './components/layouts/Header/Header';
import Menu from './components/layouts/Menu/Menu';
import { EventContextProvider } from './context/EventContext';
import { FinanceContextProvider } from './context/FinanceContext';
import { StateContext, StateContextProvider } from './context/StateContext';
import { UserContext } from './context/UserContext';
import { useShortcuts } from './hooks/useShortcuts';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import CheatSheet from './pages/CheatSheet/CheatSheet';
import LandingPage from './pages/Landing/index';
import { getUserInfo } from './utils/firebaseAuth';

const GlobalStyle = createGlobalStyle`
body{
  background-color: #31353F;
}
  #root{
    position: relative;
    font-family: 'Poppins', sans-serif;
    color: white;
    background-color: #31353F;
    letter-spacing: 2px;
  }

  ul{
    padding-left: 5px;
  }

  h1{
    margin: 0;
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
  padding: 48px;
`;

const LogoWrapper = styled.div`
  display: ${(props) => props.display};
  width: 250px;
  position: absolute;
  top: 23px;
  left: 44px;
`;

export default function App() {
  const {
    userInfo,
    setUserInfo,
    setHasClickedSignIn,
    setHasClickedSignUp,
    hasClickedSignIn,
    hasClickedSignUp,
    isLoading,
    setIsLoading,
    selectedOption,
    setSelectedOption,
    isDisplaySheet,
    setIsDisplaySheet,
    isSearching,
  } = useContext(UserContext);
  const { isEditing } = useContext(StateContext);
  const location = useLocation();
  const sheetRef = useRef(null);

  function handleTildeKeydown() {
    !isEditing && !isSearching && !isDisplaySheet && setIsDisplaySheet(true);
  }

  function handleTildeKeyup() {
    isDisplaySheet && setIsDisplaySheet(false);
  }

  useShortcuts(
    {
      '`': handleTildeKeydown,
    },
    {
      '`': handleTildeKeyup,
    }
  );

  useEffect(() => {
    getUserInfo(setUserInfo, setIsLoading);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentRoute = currentPath.substring(1);
    setSelectedOption(currentRoute.toUpperCase());
  }, [selectedOption]);

  if (isLoading) {
    return (
      <>
        <Loading type='spinningBubbles' color='white' />
      </>
    );
  } else if (!isLoading && !userInfo) {
    return (
      <>
        <GlobalStyle />
        <FinanceContextProvider>
          <Wrapper>
            <LogoWrapper
              onClick={() => {
                setHasClickedSignIn(false);
                setHasClickedSignUp(false);
              }}
              display={hasClickedSignIn || hasClickedSignUp ? 'block' : 'none'}
            >
              <Logo
                imgWidth='40px'
                titleFontSize='30px'
                imgFontSize='30px'
                textAlign='start'
              />
            </LogoWrapper>
            <LandingPage
              display={hasClickedSignIn || hasClickedSignUp ? 'none' : 'block'}
            />
            <SignIn />
            <SignUp display={hasClickedSignUp ? 'flex' : 'none'} />
          </Wrapper>
        </FinanceContextProvider>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <EventContextProvider>
        <StateContextProvider>
          <FinanceContextProvider>
            <Wrapper>
              <Menu />
              <MainContent>
                <CheatSheet
                  display={isDisplaySheet ? 'block' : 'none'}
                  sheetRef={sheetRef}
                />
                <Header />
                <Outlet />
              </MainContent>
            </Wrapper>
          </FinanceContextProvider>
        </StateContextProvider>
      </EventContextProvider>
    </>
  );
}
