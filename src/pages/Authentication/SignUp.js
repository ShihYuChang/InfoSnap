import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../context/userContext';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: ${(props) => props.display};
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentWrapper = styled.form`
  box-sizing: border-box;
  width: 540px;
  height: 575px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1b2028;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoWrapper = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 45px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const HeaderTitle = styled.div`
  font-size: 32px;
  font-weight: 700;
`;

const HeaderText = styled.div`
  color: ${(props) => props.color ?? '#a4a4a3'};
  font-size: 20px;
`;

const PromptWrapper = styled.div`
  display: flex;
  gap: 5px;
  cursor: pointer;
`;

const QuestionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 34px;
`;

const Question = styled.div`
  width: 100%;
  position: relative;
`;

const InputDescription = styled.div`
  position: absolute;
  font-size: 12px;
  color: #3c3c3c;
  top: 5px;
  left: 15px;
  z-index: 10;
`;

const InputBar = styled.input`
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  border-radius: 10px;
  border: 0;
  outline: none;
  background-color: #8e8e8e;
  color: white;
  padding: 20px 14px 0;

  &:focus {
    border: 2px solid #3a6ff7;
    + ${InputDescription} {
      color: #3a6ff7;
    }
  }
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

export default function SignUp({ display }) {
  const questions = [
    { label: 'First Name', value: 'first_name', type: 'text' },
    { label: 'Last Name', value: 'last_name', type: 'text' },
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
      title: 'Template',
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
    <Wrapper display={display}>
      <ContentWrapper>
        <InfoWrapper>
          <Header>
            <HeaderText>START FOR FREE</HeaderText>
            <HeaderTitle>Create new account</HeaderTitle>
            <PromptWrapper>
              <HeaderText>Already A Member?</HeaderText>
              <HeaderText color='#3a6ff7'>Sign in</HeaderText>
            </PromptWrapper>
          </Header>
          <QuestionWrapper>
            {questions.map((question, index) => (
              <Question key={index}>
                <InputBar type={question.type} required />
                <InputDescription>{question.label}</InputDescription>
              </Question>
            ))}
          </QuestionWrapper>
        </InfoWrapper>
      </ContentWrapper>
      {/* <ContentWrapper onSubmit={signUp}>
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
      </ContentWrapper> */}
    </Wrapper>
  );
}
