import styled from 'styled-components/macro';
import { useNavigate } from 'react-router-dom';

const IntroContainer = styled.div`
  box-sizing: border-box;
  width: 50%;
  height: 500px;
  display: flex;
  margin: 50px auto;
  border: 1px solid black;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  width: 150px;
  height: 50px;
`;

export default function SignInPrompt() {
  const navigate = useNavigate();
  return (
    <IntroContainer>
      <h1>See What You Need To Know Now</h1>
      <Button
        onClick={() => {
          navigate('/signin');
        }}
      >
        Sign In
      </Button>
    </IntroContainer>
  );
}
