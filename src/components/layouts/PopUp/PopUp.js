import { useContext } from 'react';
import styled from 'styled-components/macro';
import Question from '../../Inputs/Question';
import Button from '../../Buttons/Button';
import { StateContext } from '../../../context/stateContext';
import { Timestamp } from 'firebase/firestore';

const Wrapper = styled.form`
  display: ${(props) => props.display};
  box-sizing: border-box;
  width: 800px;
  min-height: 600px;
  background-color: #38373b;
  border-radius: 10px;
  position: absolute;
  z-index: 30;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  flex-direction: column;
  justify-content: start;
`;

const Title = styled.div`
  box-sizing: border-box;
  width: 100%;
  border-radius: 10px;
  background-color: #3a6ff7;
  color: white;
  font-size: 36px;
  font-weight: 800;
  padding: 38px 60px;
`;

const Content = styled.div`
  box-sizing: border-box;
  margin: ${(props) => props.margin ?? '100px auto 50px'};
  width: 575px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 50px;
`;

const Row = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: ${(props) => props.gridFr};
  gap: 30px;
  width: 100%;
  margin-bottom: ${(props) => props.marginBottom};
`;

const ButtonWrapper = styled.div`
  width: 575px;
  margin: 0 auto 50px;
`;

export default function PopUp({
  display,
  labelWidth,
  gridFr,
  questions,
  onChange,
  onSubmit,
  margin,
  children,
}) {
  const { userInput, setUserInput } = useContext(StateContext);
  function handleInput(e, label) {
    const input = { ...userInput, [label]: e.target.value };
    setUserInput(input);
  }

  function handleIntakeInput(e, label) {
    const now = new Date();
    const addedData =
      e.target.type === 'text'
        ? {
            ...userInput,
            [label]: e.target.value,
            created_time: new Timestamp(
              now.getTime() / 1000,
              now.getMilliseconds() * 1000
            ),
          }
        : {
            ...userInput,
            [label]: Number(e.target.value),
            created_time: new Timestamp(
              now.getTime() / 1000,
              now.getMilliseconds() * 1000
            ),
          };
    setUserInput(addedData);
  }

  console.log(userInput);

  return (
    <Wrapper display={display} onSubmit={onSubmit}>
      {children}
      {/* <Title>TITLE</Title> */}
      <Content margin={margin}>
        {questions
          ? questions.map((question, index) => (
              <Row gridFr={gridFr} key={index}>
                <Question
                  wrapperWidth='100%'
                  labelWidth={labelWidth ?? '100px'}
                  height='50px'
                  type={question.type}
                  options={question.options}
                  onChange={(e) => {
                    onChange === 'intake'
                      ? handleIntakeInput(e, question.value)
                      : handleInput(e, question.value);
                  }}
                  userInput={userInput[question.value]}
                >
                  {question.label}
                </Question>
              </Row>
            ))
          : null}
      </Content>
      <ButtonWrapper>
        <Button featured textAlignment='center' type='submit'>
          SAVE
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
}
