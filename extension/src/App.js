import { useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import ReactLoading from 'react-loading';
import styled from 'styled-components/macro';
import Menu from './components/Menu';
import Finance from './pages/Finance';
import Health from './pages/Health';
import Note from './pages/Note';
import Task from './pages/Task';
import SignIn from './pages/SignIn';
import { PageContext } from './context/pageContext';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 400px;
  background-color: #4f4f4f;
  color: white;
  padding: 50px 0 0 0;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const LogOutBtn = styled.button`
  width: 100px;
  height: 50px;
  position: sticky;
  top: 0;
  right: 0;
`;

function App() {
  const { page, setEmail, setIsLoading, isLoading, email } =
    useContext(PageContext);

  function handleSignOut() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        alert('Sign Out Success!');
        window.location.href = '/';
      })
      .catch((error) => {
        alert('Something went wrong. Please try again later');
      });
  }

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
        <Wrapper>
          <Loading type='spinningBubbles' color='#313538' />
          <Menu />
        </Wrapper>
      </>
    );
  } else if (!isLoading && !email) {
    return (
      <>
        <Wrapper>
          <SignIn />
          <Menu />
        </Wrapper>
      </>
    );
  }

  return (
    <Wrapper>
      <LogOutBtn onClick={() => handleSignOut()}>Sign Out</LogOutBtn>
      <Task display={email && page === 'tasks' ? 'flex' : 'none'} />
      <Finance display={email && page === 'finance' ? 'flex' : 'none'} />
      <Health display={email && page === 'health' ? 'flex' : 'none'} />
      <Note display={email && page === 'note' ? 'flex' : 'none'} />
      <Menu />
    </Wrapper>
  );
}

export default App;
