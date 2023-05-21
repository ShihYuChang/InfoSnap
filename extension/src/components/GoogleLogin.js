import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { useContext } from 'react';
import { FcGoogle } from 'react-icons/fc';
import styled from 'styled-components/macro';
import { PageContext } from '../context/pageContext';

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  background-color: #4285f4;
  color: white;
  border: 0;
  border-radius: 10px;
  letter-spacing: 3px;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  margin-left: 10px;
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
        throw err;
      });
  }

  return (
    <Button onClick={login}>
      SIGN IN WITH GOOGLE
      <IconWrapper>
        <FcGoogle size={25} />
      </IconWrapper>
    </Button>
  );
}
