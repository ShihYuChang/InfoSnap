import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';

import styled from 'styled-components/macro';

const Wrapper = styled.div`
  display: ${(props) => props.display};
`;

const ContentWrapper = styled.form`
  box-sizing: border-box;
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;
  margin: 100px auto;
  border: 1px solid black;
  padding: 50px;
`;

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InputLabel = styled.label`
  width: 100px;
  height: 30px;
  line-height: 30px;
`;

const Input = styled.input`
  width: 200px;
  height: 30px;
`;

const SubmitBtn = styled.button`
  width: 150px;
  height: 50px;
  cursor: pointer;
`;

const SignInPrompt = styled.p`
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: #4285f4;
  }
`;

export default function SignUp() {
  const questions = [
    { label: 'Email', value: 'email', type: 'text' },
    { label: 'Password', value: 'password', type: 'password' },
  ];
  const [userInput, setUserInput] = useState({});
  const { setHasClickedSignIn, setHasClickedSignUp, hasClickedSignUp } =
    useContext(UserContext);

  function handleInput(value, e) {
    const inputs = { ...userInput, [value]: e.target.value };
    setUserInput(inputs);
  }

  function goToSignIn() {
    setHasClickedSignIn(true);
    setHasClickedSignUp(false);
  }

  function signUp(e) {
    e.preventDefault();
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((userCredential) => {
        alert('Register Success!');
        window.location.href = '/';
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
          alert('Something went wrong. Please try again later.');
        }
        console.log(`Error Code: ${errorCode}
          Error Message: ${errorMessage}`);
      });
  }

  return (
    <Wrapper display={hasClickedSignUp ? 'flex' : 'none'}>
      <ContentWrapper onSubmit={signUp}>
        {questions.map((question, index) => (
          <InputWrapper key={index}>
            <InputLabel>{question.label}</InputLabel>
            <Input
              type={question.type}
              onChange={(e) => handleInput(question.value, e)}
              value={userInput.question}
              required
            />
          </InputWrapper>
        ))}
        <SubmitBtn>Sign Up Now</SubmitBtn>
        <SignInPrompt onClick={goToSignIn}>
          Already Have an Account?
        </SignInPrompt>
      </ContentWrapper>
    </Wrapper>
  );
}
