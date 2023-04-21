import { useState } from 'react';
import styled from 'styled-components/macro';
import Question from '../../Inputs/Question';
import Button from '../../Buttons/Button';

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
  margin: 100px auto 50px;
  width: 575px;
  height: 325px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  gridFr,
  questions,
  onSubmit,
  state,
  setState,
}) {
  function handleInput(e, label) {
    const input = { ...state, [label]: e.target.value };
    setState(input);
  }

  return (
    <Wrapper display={display} onSubmit={onSubmit}>
      {/* <Title>TITLE</Title> */}
      <Content>
        {questions.map((question, index) => (
          <Row gridFr={gridFr} key={index}>
            <Question
              wrapperWidth='100%'
              labelWidth='150px'
              height='50px'
              type={question.type}
              options={question.options}
              onChange={(e) => {
                handleInput(e, question.value);
              }}
            >
              {question.label}
            </Question>
          </Row>
        ))}
      </Content>
      <ButtonWrapper>
        <Button featured textAlignment='center'>
          SAVE
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
}
