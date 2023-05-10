import { useContext, useState } from 'react';
import { BsFillEyeFill } from 'react-icons/bs';
import styled from 'styled-components/macro';
import { UserContext } from '../../context/UserContext';
import { nativeSignIn } from '../../utils/firebase';
import GoogleLogin from './GoogleLogin';

const Wrapper = styled.div`
  display: ${(props) => props.display};
  width: 100%;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
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

const Title = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 800;
  font-size: 36px;
  letter-spacing: 5px;
  margin-bottom: 32px;
`;

const QuestionWrapper = styled.div`
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 34px;
  margin-bottom: 34px;
`;

const Question = styled.form`
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

const ButtonWrapper = styled.div`
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 14px;
  right: 30px;
  cursor: pointer;

  &:hover {
    color: #3a6ff7;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 10px;
  border: 0;
  outline: none;
  color: white;
  letter-spacing: 2px;
  background-color: #45c489;
  cursor: pointer;
`;

const SignUpPrompt = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
`;

const PromptText = styled.div`
  color: ${(props) => props.color};
`;

export default function SignIn() {
  const { setHasClickedSignIn, hasClickedSignIn, setHasClickedSignUp } =
    useContext(UserContext);
  const [passwordIsVisible, setPasswordIsVisible] = useState(false);
  const [userInput, setUserInput] = useState({});
  const questions = [
    { label: 'Email', value: 'email', type: 'email' },
    {
      label: 'Password',
      value: 'password',
      type: passwordIsVisible ? 'text' : 'password',
    },
  ];

  function handleInput(value, e) {
    const inputs = { ...userInput, [value]: e.target.value };
    setUserInput(inputs);
  }

  return (
    <Wrapper display={hasClickedSignIn ? 'flex' : 'none'}>
      <FormContainer>
        <FormContainer
          onSubmit={(e) => nativeSignIn(e, userInput.email, userInput.password)}
        >
          <Title>SIGN IN</Title>
          <QuestionWrapper>
            {questions.map((question, index) => (
              <Question key={index}>
                <InputBar
                  type={question.type}
                  onChange={(e) => handleInput(question.value, e)}
                  required
                />
                <InputDescription>{question.label}</InputDescription>
                {question.value === 'password' && (
                  <IconWrapper
                    onClick={() => setPasswordIsVisible((prev) => !prev)}
                  >
                    <BsFillEyeFill size={25} />
                  </IconWrapper>
                )}
              </Question>
            ))}
          </QuestionWrapper>
          <ButtonWrapper>
            <Button
              onClick={(e) =>
                nativeSignIn(e, userInput.email, userInput.password)
              }
            >
              SIGN IN
            </Button>
            <GoogleLogin />
          </ButtonWrapper>
          <SignUpPrompt
            onClick={() => {
              setHasClickedSignUp(true);
              setHasClickedSignIn(false);
            }}
          >
            <PromptText color='#a4a4a3'>Do not have an account?</PromptText>
            <PromptText color='#3a6ff7'>Sign Up</PromptText>
          </SignUpPrompt>
        </FormContainer>
      </FormContainer>
    </Wrapper>
  );
}
