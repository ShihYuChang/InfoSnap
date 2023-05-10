import { useContext } from 'react';
import { FcGoogle } from 'react-icons/fc';
import styled from 'styled-components';
import { UserContext } from '../../context/UserContext';
import { googleLogin } from '../../utils/firebase';

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
  const { setEmail, setUserInfo } = useContext(UserContext);

  return (
    <Button onClick={() => googleLogin(setUserInfo, setEmail)}>
      Sign in with Google
      <IconWrapper>
        <FcGoogle size={25} />
      </IconWrapper>
    </Button>
  );
}
