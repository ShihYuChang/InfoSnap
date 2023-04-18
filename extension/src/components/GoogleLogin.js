import styled from 'styled-components';
import { useContext } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { PageContext } from '../context/pageContext';

const Button = styled.button`
  width: 200px;
  height: 50px;
  background-color: #4285f4;
  color: white;
  border: 0;
  cursor: pointer;
`;

export default function GoogleLogin() {
  const { setEmail } = useContext(PageContext);
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

  return <Button onClick={login}>Sign in with Google</Button>;
}
