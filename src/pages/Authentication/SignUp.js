import { useContext, useState } from 'react';
import styled from 'styled-components/macro';
import Button from '../../components/Buttons/Button';
import { UserContext } from '../../context/UserContext';
import { nativeSignUp } from '../../utils/firebase/firebaseAuth';

const Wrapper = styled.div`
  display: ${(props) => props.display};
  width: 100%;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
`;

const ContentWrapper = styled.form`
  box-sizing: border-box;
  width: 540px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1b2028;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
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

export default function SignUp() {
  const questions = [
    { label: 'First Name', value: 'first_name', type: 'text' },
    { label: 'Last Name', value: 'last_name', type: 'text' },
    { label: 'Email', value: 'email', type: 'email' },
    { label: 'Password', value: 'password', type: 'password' },
  ];
  const [userInput, setUserInput] = useState({});
  const {
    setHasClickedSignIn,
    setHasClickedSignUp,
    hasClickedSignUp,
    setUserInfo,
  } = useContext(UserContext);

  function handleInput(value, e) {
    const inputs = { ...userInput, [value]: e.target.value };
    setUserInput(inputs);
  }

  function goToSignIn() {
    setHasClickedSignIn(true);
    setHasClickedSignUp(false);
  }

  return (
    <Wrapper display={hasClickedSignUp ? 'flex' : 'none'}>
      <ContentWrapper
        onSubmit={(e) => nativeSignUp(e, setUserInfo, userInput, goToSignIn)}
      >
        <InfoWrapper>
          <Header>
            <HeaderText>START FOR FREE</HeaderText>
            <HeaderTitle>Create new account</HeaderTitle>
            <PromptWrapper onClick={goToSignIn}>
              <HeaderText>Already A Member?</HeaderText>
              <HeaderText color='#3a6ff7'>Sign in</HeaderText>
            </PromptWrapper>
          </Header>
          <QuestionWrapper>
            {questions.map((question, index) => (
              <Question
                key={index}
                onChange={(e) => handleInput(question.value, e)}
              >
                <InputBar type={question.type} required />
                <InputDescription>{question.label}</InputDescription>
              </Question>
            ))}
          </QuestionWrapper>
          <Button featured textAlignment='center' height='50px'>
            SIGN UP
          </Button>
        </InfoWrapper>
      </ContentWrapper>
    </Wrapper>
  );
}
