import { useContext, useState } from 'react';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/AuthContext';
import { PageContext } from '../../context/pageContext';
import { signIn, signUp } from '../../utils/firebase';
import logo from './img/logo.svg';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: ${({ marginTop }) => marginTop};
`;

export const Button = styled.button`
  width: 100%;
  height: 50px;
  margin-bottom: ${({ marginBottom }) => marginBottom};
  border-radius: 10px;
  background-color: ${({ backgroundColor }) => backgroundColor ?? '#45c489'};
  color: white;
  cursor: pointer;
  letter-spacing: 3px;
  border: 0;
`;

export const ContentWrapper = styled.form`
  box-sizing: border-box;
  padding: 0 20px;
  width: 100%;
  display: ${(props) => props.display};
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

export const QuestionWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const QuestionLabel = styled.label`
  width: ${({ width }) => width ?? '100px'};
  height: 30px;
  line-height: 30px;
  font-size: 14px;
`;

const InputWrapper = styled.div`
  width: 100px;
  height: 35px;
  display: flex;
  flex-grow: 1;
`;

export const Input = styled.input`
  box-sizing: border-box;
  padding: 0 10px;
  height: 35px;
  border-top-left-radius: 10px;
  border-top-right-radius: ${({ leftRadiusOnly }) =>
    leftRadiusOnly ? '0' : '10px'};
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: ${({ leftRadiusOnly }) =>
    leftRadiusOnly ? '0' : '10px'};
  outline: none;
  border: 0;
  background-color: #a4a4a3;
  color: white;
  flex-grow: 1;
`;

export const SignUpPromptWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 5px;
  justify-content: center;
  cursor: pointer;
`;

export const SignUpPrompt = styled.div`
  font-size: 14px;
  color: ${({ color }) => color};
`;

const Logo = styled.div`
  display: flex;
  gap: 25px;
  align-items: center;
`;

const LogoImg = styled.div`
  width: 40px;
  height: 40px;
  background-image: url(${logo});
  background-size: contain;
  background-repeat: no-repeat;
`;

const LogoText = styled.div`
  font-size: 32px;
  font-weight: 500;
  line-height: 74px;
  letter-spacing: 3px;
`;

export default function SignIn() {
  const { setEmail } = useContext(PageContext);
  const { isSignUp, setIsSignUp } = useContext(AuthContext);
  const signInQuestions = [
    { label: 'Email', value: 'email', type: 'email' },
    {
      label: 'Password',
      value: 'password',
    },
  ];
  const signUpQuestions = [
    { label: 'First Name', value: 'first_name', type: 'text' },
    { label: 'Last Name', value: 'last_name', type: 'text' },
    { label: 'Email', value: 'email', type: 'email' },
    {
      label: 'Password',
      value: 'password',
    },
  ];

  const [userInput, setUserInput] = useState({});
  function handleInput(value, e) {
    const inputs = { ...userInput, [value]: e.target.value };
    setUserInput(inputs);
  }

  return (
    <Wrapper marginTop={isSignUp ? '50px' : '100px'}>
      <Logo>
        <LogoImg />
        <LogoText>INFOSNAP</LogoText>
      </Logo>
      <ContentWrapper
        display={isSignUp ? 'none' : 'flex'}
        onSubmit={(e) => signIn(e, userInput, setEmail)}
        id='signIn'
      >
        {signInQuestions.map((question, index) => (
          <QuestionWrapper key={index}>
            <QuestionLabel>{question.label}</QuestionLabel>
            <Input
              type={question.type}
              onChange={(e) => {
                handleInput(question.value, e);
              }}
              required
            />
          </QuestionWrapper>
        ))}
        <Button>SIGN IN</Button>
        {/* <GoogleLogin /> */}
        <SignUpPromptWrapper
          onClick={() => {
            setIsSignUp(true);
          }}
        >
          <SignUpPrompt>Do not have an account?</SignUpPrompt>
          <SignUpPrompt color='#4285f4'>Sign Up</SignUpPrompt>
        </SignUpPromptWrapper>
      </ContentWrapper>
      <ContentWrapper
        display={isSignUp ? 'flex' : 'none'}
        onSubmit={signIn}
        id='signUp'
      >
        {signUpQuestions.map((question, index) => (
          <QuestionWrapper key={index}>
            <QuestionLabel width='120px'>{question.label}</QuestionLabel>
            <InputWrapper>
              <Input
                type={question.type}
                onChange={(e) => {
                  handleInput(question.value, e);
                }}
                required
              />
            </InputWrapper>
          </QuestionWrapper>
        ))}
        <Button
          onClick={(e) =>
            signUp(e, setEmail, userInput, () => setIsSignUp(false))
          }
        >
          SIGN UP
        </Button>
        <SignUpPromptWrapper onClick={() => setIsSignUp(false)}>
          <SignUpPrompt>Already Have an Account?</SignUpPrompt>
          <SignUpPrompt color='#4285f4'>Sign In</SignUpPrompt>
        </SignUpPromptWrapper>
      </ContentWrapper>
    </Wrapper>
  );
}
