import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
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
  const {
    setEmail,
    setHasClickedSignIn,
    setHasClickedSignUp,
    hasClickedSignUp,
  } = useContext(UserContext);

  function handleInput(value, e) {
    const inputs = { ...userInput, [value]: e.target.value };
    setUserInput(inputs);
  }

  function goToSignIn() {
    setHasClickedSignIn(true);
    setHasClickedSignUp(false);
  }

  async function initUserDb(email) {
    const now = new Date();
    const currenYear = new Date().getFullYear();
    addDoc(collection(db, 'Users', email, 'Health-Food'), {
      carbs: 0,
      protein: 0,
      fat: 0,
      note: 'Template',
      created_time: Timestamp.fromDate(now),
    });
    addDoc(collection(db, 'Users', email, 'Health-Goal'), {
      carbs: 0,
      protein: 0,
      fat: 0,
      name: 'Template',
    });
    addDoc(collection(db, 'Users', email, 'Finance'), {
      amount: 0,
      categoty: 'food',
      note: 'Template',
      date: Timestamp.fromDate(now),
      tag: 'expense',
    });
    addDoc(collection(db, 'Users', email, 'Notes'), {
      archived: false,
      context: 'Template',
      created_time: Timestamp.fromDate(now),
      image_url: null,
      pinned: true,
    });
    await addDoc(collection(db, 'Users', email, 'Tasks'), {
      expireDate: Timestamp.fromDate(now),
      status: 'to-do',
      startDate: Timestamp.fromDate(now),
      task: 'Template',
    });
    setDoc(doc(db, 'Users', email), {
      savgingsGoal: 0,
      monthlyIncome: 0,
      currentHealthGoal: {
        carbs: 0,
        fat: 0,
        protein: 0,
        name: 'Template',
      },
      monthlyNetIncome: {
        [currenYear]: Array(12).fill(0),
      },
    });
  }

  function signUp(e) {
    e.preventDefault();
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((userCredential) => {
        const userEmail = userCredential.user.email;
        initUserDb(userEmail).then(() =>
          setEmail(userEmail)
            .then(() => alert('Register Success!'))
            .then(() => (window.location.href = '/'))
        );
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
