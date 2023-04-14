import { useEffect, useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { Calendar } from 'antd';
import Mask from '../../components/Mask';
import PopUp from '../../components/PopUp/PopUp';
import {
  Timestamp,
  addDoc,
  collection,
  updateDoc,
  doc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { UserContext } from '../../context/userContext';

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
  cursor: pointer;
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
  align-items: center;
`;

const QuestionLabel = styled.label`
  width: 150px;
  font-size: 20px;
`;

const QuestionInput = styled.input`
  width: 150px;
  height: 20px;
`;

const SelectInput = styled.select`
  text-align: center;
  width: 150px;
  height: 30px;
`;

export default function Dashboard() {
  const questions = {
    record: [
      {
        label: 'Type',
        value: 'tag',
        type: 'select',
        options: ['expense', 'income'],
      },
      { label: 'Date', value: 'date', type: 'date' },
      { label: 'Amount', value: 'amount', type: 'number' },
      {
        label: 'Category',
        value: 'category',
        type: 'select',
        options: ['food', 'traffic', 'entertainment'],
      },
      { label: 'Note', value: 'note', type: 'text' },
    ],
    budget: [
      {
        label: 'Income',
        value: 'monthlyIncome',
        type: 'number',
      },
      {
        label: 'Saving Goal',
        value: 'savingsGoal',
        type: 'number',
      },
    ],
  };
  const [userData, setUserData] = useState({});
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [userInput, setUserInput] = useState({
    type: '',
    date: '',
    amount: '',
    category: '',
    note: '',
  });
  const { email } = useContext(UserContext);

  function addEvent(value) {
    const selectedDate = value.format('YYYY-MM-DD');
    setUserInput({ ...userInput, date: selectedDate, tag: 'expense' });
    setIsAddingRecord(true);
  }

  function handleInput(e, label) {
    const storedData = {
      ...userInput,
      [label]: e.target.value,
    };
    setUserInput(storedData);
  }

  function handleExit(e) {
    e.preventDefault();
    setIsAddingRecord(false);
    setIsAddingBudget(false);
    setUserInput({});
  }

  async function storeRecord(e, data) {
    const input = { ...userInput };
    e.preventDefault();
    const date = new Date(data.date);
    const timestamp = getTimestamp(date);
    input.date = timestamp;
    await addDoc(collection(db, 'Users', email, 'Finance'), input);
    alert('save');
    setIsAddingRecord(false);
  }

  async function storeBudget(e) {
    e.preventDefault();
    const input = { ...userInput };
    for (let key in input) {
      input[key] = Number(input[key]);
    }
    try {
      await updateDoc(doc(db, 'Users', email), input);
    } catch (err) {
      console.log(err);
    }
  }

  function getTimestamp(stringDate) {
    const timestamp = Timestamp.fromDate(stringDate);
    return timestamp;
  }

  function editBudget(e) {
    setIsAddingBudget(true);
  }

  useEffect(() => {
    if (!isAddingRecord && !isAddingBudget) {
      setUserInput({
        amount: '',
        category: '',
        note: '',
      });
    } else if (isAddingBudget) {
      setUserInput({
        savingsGoal: '',
        monthlyIncome: '',
      });
    }
  }, [isAddingRecord, isAddingBudget]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'Users', email), (doc) => {
      const data = doc.data();
      const income = data.monthlyIncome;
      const goal = data.savingsGoal;
      setUserData({ income: income, savingsGoal: goal });
    });
    return unsub;
  }, []);

  return (
    <Wrapper>
      <PopUp
        id='budget'
        display={isAddingBudget ? 'flex' : 'none'}
        exitClick={handleExit}
        onSubmit={(e) => {
          storeBudget(e);
        }}
      >
        {questions.budget.map((question, index) => (
          <Question key={index}>
            <QuestionLabel>{question.label}</QuestionLabel>
            <QuestionInput
              required
              type={question.type}
              onChange={(e) => {
                handleInput(e, question.value);
              }}
              value={userInput[question.value]}
            />
          </Question>
        ))}
      </PopUp>
      <PopUp
        id='record'
        display={isAddingRecord ? 'flex' : 'none'}
        exitClick={handleExit}
        onSubmit={(e) => {
          storeRecord(e, userInput);
        }}
      >
        {questions.record.map((question, index) =>
          question.type === 'select' ? (
            <Question key={index}>
              <QuestionLabel>Type</QuestionLabel>
              <SelectInput
                required
                onChange={(e) => {
                  handleInput(e, question.value);
                }}
                value={userInput[question.value]}
              >
                {question.options.map((option, index) => (
                  <option value={option} key={index}>
                    {option}
                  </option>
                ))}
              </SelectInput>
            </Question>
          ) : (
            <Question key={index}>
              <QuestionLabel>{question.label}</QuestionLabel>
              <QuestionInput
                required
                type={question.type}
                onChange={(e) => {
                  handleInput(e, question.value);
                }}
                value={userInput[question.value]}
              />
            </Question>
          )
        )}
      </PopUp>

      <Mask display={isAddingRecord || isAddingBudget ? 'block' : 'none'} />
      <Header>
        <Title>FINANCE</Title>
        <Button width='100px' onClick={() => editBudget()}>
          Edit
        </Button>
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
          <Title>{`NT$${userData.savingsGoal}`}</Title>
        </TitleWrapper>
      </TitlesContainer>
      <Calendar onSelect={addEvent} />
    </Wrapper>
  );
}
