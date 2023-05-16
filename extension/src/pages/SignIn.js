import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Timestamp, addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import styled from 'styled-components';
import GoogleLogin from '../components/GoogleLogin';
import { PageContext } from '../context/pageContext';
import { extensionDb } from '../firebase';

export default function SignIn({ display }) {
  const { setEmail } = useContext(PageContext);
  const questions = [
    { label: 'Email', value: 'email', type: 'text' },
    { label: 'Password', value: 'password', type: 'password' },
  ];
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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

  async function initUserDb(email) {
    const now = new Date();
    const currenYear = new Date().getFullYear();
    addDoc(collection(extensionDb, 'Users', email, 'Health-Food'), {
      carbs: 0,
      protein: 0,
      fat: 0,
      note: 'Template',
      created_time: Timestamp.fromDate(now),
    });
    addDoc(collection(extensionDb, 'Users', email, 'Health-Goal'), {
      carbs: 0,
      protein: 0,
      fat: 0,
      name: 'Template',
    });
    addDoc(collection(extensionDb, 'Users', email, 'Finance'), {
      amount: 0,
      categoty: 'food',
      note: 'Template',
      date: Timestamp.fromDate(now),
      tag: 'expense',
    });
    addDoc(collection(extensionDb, 'Users', email, 'Notes'), {
      archived: false,
      context: 'Template',
      created_time: Timestamp.fromDate(now),
      image_url: null,
      pinned: true,
    });
    await addDoc(collection(extensionDb, 'Users', email, 'Tasks'), {
      expireDate: Timestamp.fromDate(now),
      status: 'to-do',
      startDate: Timestamp.fromDate(now),
      task: 'Template',
    });
    setDoc(doc(extensionDb, 'Users', email), {
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
        setEmail(userEmail);
        initUserDb(userEmail);
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
        <Title>See What You Need To Know Now</Title>
        <Button onClick={() => setIsSigningIn(true)}>Sign In</Button>
        <GoogleLogin />
      </MainContent>
      <ContentWrapper
        display={isSigningIn ? 'flex' : 'none'}
        onSubmit={signIn}
        id='signIn'
      >
        {questions.map((question, index) => (
          <InputWrapper key={index}>
            <InputLabel>{question.label}</InputLabel>
            <Input
              type={question.type}
              onChange={(e) => {
                handleInput(question.value, e);
              }}
            />
          </InputWrapper>
        ))}
        <SubmitBtn>Sign In</SubmitBtn>
        <GoogleLogin />
        <SignUpPrompt
          onClick={() => {
            setIsSigningIn(false);
            setIsSignUp(true);
          }}
        >
          Don't Have an Account?
        </SignUpPrompt>
      </ContentWrapper>
      <ContentWrapper
        display={isSignUp ? 'flex' : 'none'}
        onSubmit={signIn}
        id='signUp'
      >
        {questions.map((question, index) => (
          <InputWrapper key={index}>
            <InputLabel>{question.label}</InputLabel>
            <Input
              type={question.type}
              onChange={(e) => {
                handleInput(question.value, e);
              }}
            />
          </InputWrapper>
        ))}
        <SubmitBtn onClick={signUp}>Sign Up</SubmitBtn>
        <SignUpPrompt onClick={goToSignIn}>
          Already Have an Account?
        </SignUpPrompt>
      </ContentWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: ${(props) => props.display};
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

const Button = styled.button`
  width: 150px;
  height: 50px;
  margin-bottom: 20px;
  cursor: pointer;
`;

const Title = styled.h1`
  text-align: center;
`;

const ContentWrapper = styled.form`
  width: 100%;
  display: ${(props) => props.display};
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
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
  width: 200px;
  height: 50px;
  cursor: pointer;
`;

const SignUpPrompt = styled.p`
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: #4285f4;
  }
`;
