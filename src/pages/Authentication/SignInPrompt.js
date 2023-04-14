import styled from 'styled-components/macro';
import GoogleLogin from '../../components/GoogleLogin';

const IntroContainer = styled.div`
  box-sizing: border-box;
  width: 50%;
  height: 500px;
  display: ${(props) => props.display};
  margin: 50px auto;
  border: 1px solid black;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  width: 150px;
  height: 50px;
  margin-bottom: 20px;
`;

export default function SignInPrompt({ onClick, display }) {
  return (
    <IntroContainer display={display}>
      <h1>See What You Need To Know Now</h1>
      <Button onClick={onClick}>Sign In</Button>
      <GoogleLogin />
    </IntroContainer>
  );
}
