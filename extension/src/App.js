import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useContext, useEffect } from 'react';
import { FiLogOut } from 'react-icons/fi';
import ReactLoading from 'react-loading';
import styled from 'styled-components/macro';
import Menu from './components/Menu';
import AuthContextProvider from './context/AuthContext';
import { PageContext } from './context/pageContext';
import SignIn from './pages/Authentication/SignIn';
import Finance from './pages/Finance';
import Health from './pages/Health';
import Note from './pages/Notes';
import Task from './pages/Tasks';
import { handleSignOut } from './utils/firebase';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 400px;
  height: 580px;
  background-color: #31353f;
  font-family: 'Poppins', sans-serif;
  color: white;
  padding: 20px 0 0 0;
  letter-spacing: 2px;
  overflow-y: hidden;
  position: relative;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const LogOutIcon = styled.div`
  box-sizing: border-box;
  padding: 0 30px;
  width: 100%;
  height: 20px;
  display: flex;
  justify-content: end;
  align-items: center;
  color: white;
  margin-bottom: 15px;
  cursor: pointer;
`;

function App() {
  const { page, setEmail, setIsLoading, isLoading, email } =
    useContext(PageContext);

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
  }, [setEmail, setIsLoading]);

  if (isLoading) {
    return (
      <>
        <Wrapper>
          <Loading type='spinningBubbles' color='#313538' />
        </Wrapper>
      </>
    );
  } else if (!isLoading && !email) {
    return (
      <AuthContextProvider>
        <Wrapper>
          <SignIn />
        </Wrapper>
      </AuthContextProvider>
    );
  }

  return (
    <Wrapper>
      <LogOutIcon>
        <FiLogOut size={20} onClick={() => handleSignOut(setEmail)} />
      </LogOutIcon>
      {/* <LogOutBtn onClick={() => handleSignOut()}>Sign Out</LogOutBtn> */}
      <Task display={email && page === 'tasks' ? 'flex' : 'none'} />
      <Finance display={email && page === 'finance' ? 'flex' : 'none'} />
      <Health display={email && page === 'health' ? 'flex' : 'none'} />
      <Note display={email && page === 'note' ? 'flex' : 'none'} />
      <Menu />
    </Wrapper>
  );
}

export default App;
