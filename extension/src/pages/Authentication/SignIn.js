import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useContext, useState } from 'react';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import styled from 'styled-components/macro';
import { AuthContext } from '../../context/AuthContext';
import { PageContext } from '../../context/pageContext';
import { initUserDb } from '../../utils/firebase';
import logo from './img/logo.svg';

export default function SignIn({ display }) {
  const { setEmail } = useContext(PageContext);
  const { isSignUp, setIsSignUp } = useContext(AuthContext);
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const signInQuestions = [
    { label: 'Email', value: 'email', type: 'email' },
    {
      label: 'Password',
      value: 'password',
      type: passwordIsVisible ? 'text' : 'password',
    },
  ];
  const signUpQuestions = [
    { label: 'First Name', value: 'first_name', type: 'text' },
    { label: 'Last Name', value: 'last_name', type: 'text' },
    { label: 'Email', value: 'email', type: 'email' },
    {
      label: 'Password',
      value: 'password',
      type: passwordIsVisible ? 'text' : 'password',
    },
  ];
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [userInput, setUserInput] = useState({});
  function handleInput(value, e) {
    const inputs = { ...userInput, [value]: e.target.value };
    setUserInput(inputs);
  }

  function signIn(e) {
    e.preventDefault();
    const auth = getAuth();
    signInWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((userCredential) => {
        setEmail(userCredential.user.email);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/user-not-found') {
          alert('User not found. Please sign up first.');
        } else if (errorCode === 'auth/wrong-password') {
          alert('Wrong password. Please try again.');
        } else {
          alert('Something went wrong. Please try again later.');
        }
        console.log(`Error Code: ${errorCode}
          Error Message: ${errorMessage}`);
      });
  }

  function goToSignIn() {
    setIsSignUp(false);
    setIsSigningIn(true);
  }

  function signUp(e) {
    e.preventDefault();
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((userCredential) => {
        const userEmail = userCredential.user.email;
        setEmail(userEmail);
        initUserDb(
          userEmail,
          `${userInput.first_name} ${userInput.last_name}`,
          null
        );
        updateProfile(auth.currentUser, {
          displayName: `${userInput.first_name} ${userInput.last_name}`,
          photoURL: null,
        });
        alert('Register Success!');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/email-already-in-use') {
          alert('Email already in use. Please sign in instead.');
          goToSignIn();
        } else if (errorCode === 'auth/weak-password') {
          alert('Password is too weak. Please choose a stronger password.');
        } else {
          console.log(errorMessage);
          alert('Something went wrong. Please try again later.');
        }
        console.log(`Error Code: ${errorCode}
          Error Message: ${errorMessage}`);
      });
  }

  return (
    <Wrapper display={display}>
      <MainContent display={isSigningIn || isSignUp ? 'none' : 'flex'}>
        <Logo>
          <LogoImg />
          <LogoText>INFOSNAP</LogoText>
        </Logo>
        <Button onClick={() => setIsSigningIn(true)} marginBottom='20px'>
          SIGN IN
        </Button>
        <Button
          backgroundColor='#4285f7'
          onClick={() => {
            setIsSigningIn(false);
            setIsSignUp(true);
          }}
        >
          SIGN UP
        </Button>
        {/* <GoogleLogin /> */}
      </MainContent>
      <ContentWrapper
        display={isSigningIn ? 'flex' : 'none'}
        onSubmit={signIn}
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
            setIsSigningIn(false);
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
            <QuestionLabel width='150px'>{question.label}</QuestionLabel>
            <InputWrapper>
              <Input
                type={question.type}
                onChange={(e) => {
                  handleInput(question.value, e);
                }}
                leftRadiusOnly={question.value === 'password' ? true : false}
                required
              />
              {question.value === 'password' && (
                <InputIcon
                  onClick={() => setPasswordIsVisible((prev) => !prev)}
                >
                  {passwordIsVisible ? (
                    <BsFillEyeSlashFill size={25} />
                  ) : (
                    <BsFillEyeFill size={25} />
                  )}
                </InputIcon>
              )}
            </InputWrapper>
          </QuestionWrapper>
        ))}
        <Button onClick={signUp}>SIGN UP</Button>
        <SignUpPromptWrapper onClick={goToSignIn}>
          <SignUpPrompt>Already Have an Account?</SignUpPrompt>
          <SignUpPrompt color='#4285f4'>Sign In</SignUpPrompt>
        </SignUpPromptWrapper>
      </ContentWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
`;

const MainContent = styled.div`
  width: 80%;
  height: 300px;
  margin: 0 auto 30px;
  display: ${(props) => props.display};
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
`;

const InputWrapper = styled.div`
  width: 100px;
  height: 35px;
  display: flex;
  flex-grow: 1;
`;

const InputIcon = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #a4a4a3;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
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
