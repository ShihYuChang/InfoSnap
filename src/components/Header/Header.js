import { getAuth, signOut } from 'firebase/auth';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UserContext } from '../../context/userContext';
import { StateContext } from '../../context/stateContext';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  gap: 70px;
  padding: 0 100px 0 250px;
`;

const Option = styled.h3`
  cursor: pointer;
  margin-right: ${(props) => props.marginRight};
`;

export default function Header() {
  const navigate = useNavigate();
  const { email, setHasClickedSignIn, isLoading, setHasClickedSignUp } =
    useContext(UserContext);
  const { setSelectedDate, selectedDate } = useContext(StateContext);
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

  function resetState() {
    setHasClickedSignIn(false);
    setHasClickedSignUp(false);
  }

  console.log(selectedDate);

  return (
    <Wrapper>
      <Option
        onClick={() => {
          navigate('/');
          resetState();
        }}
      >
        Dashboard
      </Option>
      <Option
        onClick={() => {
          navigate('/finance');
          setSelectedDate(new Date().toISOString().slice(0, 10));
        }}
      >
        Finance
      </Option>
      <Option onClick={() => navigate('/note')}>Note</Option>
      <Option onClick={() => navigate('/health')}>Health</Option>
      <Option onClick={() => navigate('/calendar')} marginRight='auto'>
        Tasks
      </Option>
      <Option
        onClick={() => (email ? handleSignOut() : setHasClickedSignIn(true))}
      >
        {email || isLoading ? 'Sign Out' : 'Sign In'}
      </Option>
    </Wrapper>
  );
}
