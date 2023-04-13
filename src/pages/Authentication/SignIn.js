import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { UserContext } from '../../context/userContext';

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

export default function SignIn({ display }) {
  const questions = [
    { label: 'Email', value: 'email', type: 'text' },
    { label: 'Password', value: 'password', type: 'password' },
  ];
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
        // alert('Login Success!');
        window.location.href = '/';
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
  return (
    <Wrapper display={display}>
      <ContentWrapper onSubmit={signIn}>
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
