import { useState, useContext } from 'react';
import styled from 'styled-components';
import { extensionDb } from '../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { PageContext } from '../context/pageContext';
export default function Finance({ display }) {
  const questions = [
    {
      label: 'Type',
      value: 'tag',
      type: 'select',
      options: ['expense', 'income'],
    },
    { label: 'Date', value: 'date', type: 'date' },
    { label: 'Amout', value: 'amount', type: 'number' },
    {
      label: 'Category',
      value: 'category',
      type: 'select',
      options: ['food', 'traffic', 'entertainment', 'education', 'others'],
    },
    { label: 'Note', value: 'note', type: 'text' },
  ];
  const [userInput, setUserInput] = useState({
    tag: 'expense',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    category: 'food',
    note: '',
  });

  const { todayBudget } = useContext(PageContext);

  function addReocrd(e, label) {
    setUserInput({
      ...userInput,
      [label]: e.target.value,
    });
  }

  function getTimestamp(stringDate) {
    const timestamp = Timestamp.fromDate(stringDate);
    return timestamp;
  }

  async function storeRecord(e) {
    e.preventDefault();
    const input = JSON.parse(JSON.stringify(userInput));
    const now = new Date(input.date);
    const timestamp = getTimestamp(now);
    input.date = timestamp;
    await addDoc(
      collection(extensionDb, 'Users', 'sam21323@gmail.com', 'Finance'),
      input
    );
    alert('save');
    setUserInput({
      tag: 'expense',
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      category: 'food',
      note: '',
    });
  }

  return (
    <Wrapper display={display} onSubmit={(e) => storeRecord(e)}>
      <Budget>
        <BudgetLabel>Today's Budget</BudgetLabel>
        <BudgetTitle>{todayBudget}</BudgetTitle>
      </Budget>
      {questions.map((question, index) =>
        question.type === 'select' ? (
          <Question key={index}>
            <QuestionLabel>{question.label}</QuestionLabel>
            <SelectInput
              onChange={(e) => addReocrd(e, question.value)}
              value={userInput[question.value]}
              required
            >
              {question.options.map((option, index) => (
                <option key={index}>{option}</option>
              ))}
            </SelectInput>
          </Question>
        ) : (
          <Question key={index}>
            <QuestionLabel>{question.label}</QuestionLabel>
            <QuestionInput
              type={question.type}
              onChange={(e) => addReocrd(e, question.value)}
              value={userInput[question.value]}
              required
            />
          </Question>
        )
      )}
      <SubmitBtn>Submit</SubmitBtn>
    </Wrapper>
  );
}

const Wrapper = styled.form`
  width: 90%;
  box-sizing: border-box;
  display: ${(props) => props.display};
  flex-direction: column;
  gap: 20px;
  margin: 0 auto;
  align-items: center;
  padding-bottom: 20px;
`;

const Budget = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: start;
  margin-bottom: 20px;
`;

const BudgetLabel = styled.label`
  background-color: black;
  color: white;
  text-align: center;
  width: 70px;
  margin-right: 100px;
`;

const BudgetTitle = styled.h1`
  font-weight: 700;
  font-size: 50px;
`;

const Question = styled.div`
  width: 360px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 50px;
`;

const QuestionLabel = styled.label`
  height: 30px;
  line-height: 30px;
  font-size: 22px;
`;

const QuestionInput = styled.input`
  height: 30px;
`;

const SelectInput = styled.select`
  height: 30px;
`;

const SubmitBtn = styled.button`
  width: 150px;
  height: 50px;
`;
