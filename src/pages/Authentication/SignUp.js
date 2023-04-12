import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';

import styled from 'styled-components/macro';

const Wrapper = styled.div``;

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
  width: 150px;
  height: 30px;
`;

const SubmitBtn = styled.button`
  width: 150px;
  height: 50px;
  cursor: pointer;
`;

export default function SignUp() {
  const { setEmail, email } = useContext(UserContext);
  const questions = [
    { label: 'Email', value: 'email', type: 'text' },
    { label: 'Password', value: 'password', type: 'password' },
  ];
  const [userInput, setUserInput] = useState({});

  function handleInput(value, e) {
    const inputs = { ...userInput, [value]: e.target.value };
    setUserInput(inputs);
  }

  function signUp(e) {
    e.preventDefault();
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((userCredential) => {
        const user = userCredential.user;
        setEmail(user.email);
        alert('Register Success!');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`Error Code: ${errorCode}
        Error Message: ${errorMessage}`);
      });
  }

  return (
    <Wrapper>
      <ContentWrapper onSubmit={signUp}>
        {questions.map((question, index) => (
          <InputWrapper key={index}>
            <InputLabel>{question.label}</InputLabel>
            <Input
              type={question.type}
              onChange={(e) => handleInput(question.value, e)}
              value={userInput.question}
            />
          </InputWrapper>
        ))}
        <SubmitBtn>Submit</SubmitBtn>
      </ContentWrapper>
    </Wrapper>
  );
}
