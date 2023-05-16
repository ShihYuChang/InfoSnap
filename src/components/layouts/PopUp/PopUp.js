import { useContext } from 'react';
import styled from 'styled-components/macro';
import { StateContext } from '../../../context/StateContext';
import Button from '../../Buttons/Button';
import Question from '../../Questions/Questions';

const Wrapper = styled.form`
  display: ${(props) => props.display};
  box-sizing: border-box;
  width: 800px;
  min-height: 300px;
  background-color: #38373b;
  border-radius: 10px;
  position: fixed;
  z-index: 30;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  flex-direction: column;
  justify-content: start;
`;

const Content = styled.div`
  box-sizing: border-box;
  margin: ${(props) => props.margin ?? '80px auto 50px'};
  width: 100%;
  padding: 0 30px;
  display: grid;
  grid-template-columns: ${(props) => props.gridFr};
  justify-content: start;
  gap: ${({ gap }) => gap ?? '50px'};
  padding: ${({ padding }) => padding};
`;

const Row = styled.div`
  box-sizing: border-box;
  gap: 30px;
  width: 100%;
  margin-bottom: ${(props) => props.marginBottom};
`;

const ButtonWrapper = styled.div`
  width: ${({ width }) => width ?? '575px'};
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
  rowGap,
  btnWidth,
  children,
  windowPadding,
}) {
  const { userInput, setUserInput, selectedDate } = useContext(StateContext);
  function handleInput(e, label) {
    const input = { ...userInput, [label]: e.target.value };
    setUserInput(input);
  }

  // function handleIntakeInput(e, label) {
  //   const now = new Date();
  //   const todayDate = now.getDate();
  //   const selectedDateOnly = selectedDate.slice(-1);
  //   const addedData = {
  //     ...userInput,
  //     [label]: e.target.value,
  //     created_time:
  //       todayDate === selectedDateOnly ? now : new Date(selectedDate),
  //   };
  //   setUserInput(addedData);
  // }
  return (
    <Wrapper display={display} onSubmit={onSubmit}>
      {children}
      <Content
        margin={margin}
        gridFr={gridFr}
        gap={rowGap}
        padding={windowPadding}
      >
        {questions
          ? questions.map((question, index) => (
              <Row key={index}>
                <Question
                  wrapperWidth='100%'
                  labelWidth={labelWidth ?? '100px'}
                  height='50px'
                  type={question.type}
                  options={question.options}
                  onChange={(e) => {
                    handleInput(e, question.value);
                  }}
                  userInput={userInput[question.value]}
                >
                  {question.label}
                </Question>
              </Row>
            ))
          : null}
      </Content>
      <ButtonWrapper width={btnWidth}>
        <Button featured textAlignment='center' type='submit'>
          SAVE
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
}
