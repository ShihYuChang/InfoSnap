import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { Calendar } from 'antd';
import { Dayjs } from 'dayjs';
import Mask from '../../components/Mask';
import PopUp from '../../components/PopUp/PopUp';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 50px 20px 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const Header = styled.div`
  width: 80%;
  display: flex;
  gap: 30px;
`;

const Title = styled.h2``;

const Button = styled.button`
  width: ${(props) => props.width};
  height: 50px;
  background-color: black;
  color: white;
`;

const TitlesContainer = styled.div`
  width: 80%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const QuestionLabel = styled.label`
  width: 150px;
  font-size: 20px;
`;

const QuestionInput = styled.input`
  width: 150px;
  height: 20px;
`;

export default function Dashboard() {
  const questions = [
    { label: 'Date', value: 'date', type: 'date' },
    { label: 'Amount', value: 'amount', type: 'number' },
    { label: 'Category', value: 'category', type: 'text' },
    { label: 'Note', value: 'note', type: 'text' },
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [userInput, setUserInput] = useState({});

  function addEvent(value) {
    const selectedDate = value.format('YYYY-MM-DD');
    setUserInput({ ...userInput, date: selectedDate });
    setIsEditing(true);
  }

  function handleInput(e, label) {
    const storedData = {
      ...userInput,
      [label]: e.target.value,
    };
    console.log(storedData);
    setUserInput(storedData);
  }

  function handleExit(e) {
    e.preventDefault();
    setIsEditing(false);
    setUserInput({});
  }

  useEffect(() => console.log(userInput), [userInput]);

  return (
    <Wrapper>
      <PopUp display={isEditing ? 'flex' : 'none'} exitClick={handleExit}>
        {questions.map((question, index) => (
          <Question key={index}>
            <QuestionLabel>{question.label}</QuestionLabel>
            <QuestionInput
              type={question.type}
              onChange={(e) => {
                handleInput(e, question.value);
              }}
              value={userInput[question.value]}
            />
          </Question>
        ))}
      </PopUp>

      <Mask display={isEditing ? 'block' : 'none'} />
      <Header>
        <Title>FINANCE</Title>
        <Button width='100px'>Edit</Button>
        <Button width='150px'>Analytics</Button>
      </Header>
      <TitlesContainer>
        <TitleWrapper>
          <Title>Total Expense</Title>
          <Title>NT$5,000</Title>
        </TitleWrapper>
        <TitleWrapper>
          <Title>Net Income</Title>
          <Title>$45,000</Title>
        </TitleWrapper>
        <TitleWrapper>
          <Title>Savings Goal</Title>
          <Title>$30,000</Title>
        </TitleWrapper>
      </TitlesContainer>
      <Calendar onSelect={addEvent} />
    </Wrapper>
  );
}
