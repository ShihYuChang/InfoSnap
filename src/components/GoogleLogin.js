import styled from 'styled-components';
import { useContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { UserContext } from '../context/userContext';
import { FcGoogle } from 'react-icons/fc';

const Button = styled.button`
  width: 100%;
  height: 50px;
  background-color: #4285f4;
  color: white;
  border: 0;
  border-radius: 10px;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

export default function GoogleLogin() {
  const { setEmail } = useContext(UserContext);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  function login() {
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setEmail(user.email);
      })
      .catch((err) => {
        const errorCode = err.code;
        const errorMessage = err.message;
        const email = err.customData.email;
        console.log(errorCode, errorMessage, email);
      });
  }

  return (
    <Button onClick={login}>
      Sign in with Google
      <IconWrapper>
        <FcGoogle size={25} />
      </IconWrapper>
    </Button>
  );
}
