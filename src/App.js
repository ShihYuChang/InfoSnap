import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useContext, useEffect, useRef } from 'react';
import ReactLoading from 'react-loading';
import { Outlet, useLocation } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components/macro';
import Logo from './components/Logo/Logo';
import Header from './components/layouts/Header/Header';
import Menu from './components/layouts/Menu/Menu';
import { EventContextProvider } from './context/EventContext';
import { StateContextProvider } from './context/StateContext';
import { UserContext } from './context/UserContext';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import CheatSheet from './pages/CheatSheet/CheatSheet';
import LandingPage from './pages/Landing/index';

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
  /* min-height: 100vh; */
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
    email,
    setEmail,
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
  } = useContext(UserContext);
  const location = useLocation();
  const sheetRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
        });
        setEmail(user.email);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });

    function handleKeyDown(e) {
      switch (e.key) {
        case '`':
          e.preventDefault();
          !isDisplaySheet && setIsDisplaySheet(true);
          sheetRef.current.focus();
          break;
        default:
          break;
      }
    }

    function handleKeyUp(e) {
      switch (e.key) {
        case '`':
          e.preventDefault();
          isDisplaySheet && setIsDisplaySheet(false);
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isDisplaySheet]);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentRoute = currentPath.substring(1);
    if (currentRoute === 'calendar') {
      setSelectedOption('TASKS');
      return;
    } else if (currentRoute === '') {
      setSelectedOption('DASHBOARD');
      return;
    }
    setSelectedOption(currentRoute.toUpperCase());
  }, [selectedOption]);

  if (isLoading) {
    return (
      <>
        <Loading type='spinningBubbles' color='white' />
      </>
    );
  } else if (!isLoading && !email) {
    return (
      <>
        <GlobalStyle />
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
          {/*
          <SignInPrompt
            onClick={() => {
              setHasClickedSignIn(true);
            }}
            display={hasClickedSignIn || hasClickedSignUp ? 'none' : 'flex'}
          />
          <SignUp display={hasClickedSignUp ? 'flex' : 'none'} /> */}
        </Wrapper>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <EventContextProvider>
        <StateContextProvider>
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
        </StateContextProvider>
      </EventContextProvider>
    </>
  );
}
