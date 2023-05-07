import { useState, useContext } from 'react';
import styled from 'styled-components/macro';
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

  const { todayBudget, email } = useContext(PageContext);

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
    await addDoc(collection(extensionDb, 'Users', email, 'Finance'), input);
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
        <BudgetTitle>NT${isNaN(todayBudget) ? 0 : todayBudget}</BudgetTitle>
      </Budget>
      <SplitLine />
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
  width: 85%;
  box-sizing: border-box;
  display: ${(props) => props.display};
  flex-direction: column;
  gap: 20px;
  margin: 0 auto;
  align-items: center;
  padding-bottom: 20px;
`;

const Budget = styled.div`
  box-sizing: border-box;
  padding: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
  background-color: #3a6ff7;
  border-radius: 10px;
`;

const BudgetLabel = styled.label`
  color: white;
  text-align: center;
  width: 70px;
  margin-right: 50px;
  font-weight: 500;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: 1px solid #a4a4a3;
`;

const BudgetTitle = styled.div`
  font-weight: 700;
  font-size: 32px;
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  height: 35px;
`;

const QuestionLabel = styled.label`
  width: 150px;
  height: 30px;
  line-height: 30px;
  font-size: 18px;
  flex-shrink: 0;
`;

const QuestionInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: 30px;
  border-radius: 10px;
  background-color: #a4a4a3;
  color: white;
  padding: 0 10px;
  border: 0;
  outline: none;
`;

const SelectInput = styled.select`
  box-sizing: border-box;
  height: 30px;
  border-radius: 10px;
  background-color: #a4a4a3;
  color: white;
  padding: 0 10px;
  border: 0;
  outline: none;
  flex-grow: 1;
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 40px;
  border-radius: 10px;
  background-color: #3a6ff7;
  border: 0;
  outline: none;
  color: white;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
`;
