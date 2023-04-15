import { useEffect, useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { Calendar, Badge } from 'antd';
import ReactLoading from 'react-loading';
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
import { StateContext } from '../../context/stateContext';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: 10px 20px 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Header = styled.div`
  width: 80%;
  display: flex;
  gap: 30px;
  align-items: center;
`;

const Title = styled.h2``;

const Button = styled.button`
  width: ${(props) => props.width};
  height: 50px;
  background-color: black;
  color: white;
  cursor: pointer;
  margin-right: ${(props) => props.marginRight};
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

const HeaderInfoTextWrapper = styled.div`
  width: 200px;
  display: flex;
  gap: 50px;
  align-items: center;
  justify-content: center;
`;

const HeaderInfoText = styled.h4`
  width: 100%;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
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
  const { email } = useContext(UserContext);
  const { userData, expenseRecords, todayBudget } = useContext(StateContext);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [dayTotal, setDayTotal] = useState([]);
  const [userInput, setUserInput] = useState({
    type: '',
    date: '',
    amount: '',
    category: '',
    note: '',
  });

  function addEvent(value) {
    const selectedDate = value.format('YYYY-MM-DD');
    setUserInput({ ...userInput, date: selectedDate, tag: 'expense' });
    setIsAddingRecord(true);
    getDaysLeft(selectedDate);
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

    setUserInput({
      amount: '',
      category: '',
      note: '',
    });
  }

  async function storeRecord(e, date) {
    const input = { ...userInput };
    e.preventDefault();
    const now = new Date(date);
    const timestamp = getTimestamp(now);
    input.date = timestamp;
    await addDoc(collection(db, 'Users', email, 'Finance'), input);
    alert('save');
    setIsAddingRecord(false);
    handleExit(e);
  }

  async function storeBudget(e) {
    e.preventDefault();
    const input = { ...userInput };
    for (let key in input) {
      input[key] = Number(input[key]);
    }
    try {
      await updateDoc(doc(db, 'Users', email), input);
      alert('Budget Saved!');
      handleExit(e);
    } catch (err) {
      console.log(err);
    }
  }

  function getTimestamp(stringDate) {
    const timestamp = Timestamp.fromDate(stringDate);
    return timestamp;
  }

  function parseTimestamp(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const formattedDate = date.toISOString().substring(0, 10);
    return formattedDate;
  }

  function editBudget(e) {
    setIsAddingBudget(true);
  }

  function getTotalExpense(data) {
    return data.reduce((acc, cur) => {
      return acc + Number(cur.amount);
    }, 0);
  }

  function getDaysLeft(date) {
    const now = new Date(date);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diffInMs = endOfMonth - now;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
    return diffInDays;
  }

  const dateCellRef = (date) => {
    const records = [...expenseRecords];
    const stringDateRecords = records.map((record) => ({
      ...record,
      stringDate: parseTimestamp(record.date),
    }));
    const nodes = stringDateRecords.map((record, index) => {
      if (
        new Date(record.stringDate).getDate() === new Date(date).getDate() &&
        new Date(record.stringDate).getMonth() === new Date(date).getMonth()
      ) {
        return (
          <>
            <ul>
              <li>
                <Badge
                  text={`${record.note}: NT$${record.amount}`}
                  key={index}
                  status='success'
                />
              </li>
            </ul>
          </>
        );
      }
    });
    return nodes;
  };

  useEffect(() => {
    if (isAddingBudget) {
      setUserInput({
        savingsGoal: '',
        monthlyIncome: '',
      });
    }
  }, [isAddingRecord, isAddingBudget]);

  useEffect(() => {
    const records = [...expenseRecords];
    const result = records.reduce((acc, cur) => {
      const date = parseTimestamp(cur.date);
      const amount = Number(cur.amount);
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    }, {});

    setDayTotal(result);
  }, [expenseRecords]);

  if (!userData) {
    return <Loading type='spinningBubbles' color='#313538' />;
  }
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
          storeRecord(e, userInput.date);
        }}
        top={'500px'}
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
        <Button width='150px' marginRight='auto'>
          Analytics
        </Button>
        {expenseRecords.income ? (
          <HeaderInfoTextWrapper>
            <HeaderInfoText>
              Savings Goal: NT$${userData.savingsGoal.toLocaleString()}
            </HeaderInfoText>
            <h4>Monthly Income: NT$${userData.income.toLocaleString()}</h4>
          </HeaderInfoTextWrapper>
        ) : null}
      </Header>
      <TitlesContainer>
        <TitleWrapper>
          <Title>Total Expense</Title>
          <Title>{`NT$${getTotalExpense(
            expenseRecords
          ).toLocaleString()}`}</Title>
        </TitleWrapper>
        <TitleWrapper>
          <Title>Net Income</Title>
          <Title>{`NT$${(isNaN(
            userData.income - getTotalExpense(expenseRecords)
          )
            ? 0
            : userData.income - getTotalExpense(expenseRecords)
          ).toLocaleString()}`}</Title>
        </TitleWrapper>
        <TitleWrapper>
          <Title>Daily Budget</Title>
          <Title>{`NT$${isNaN(todayBudget) ? 0 : todayBudget}`}</Title>
        </TitleWrapper>
      </TitlesContainer>
      <Calendar
        onSelect={addEvent}
        cellRender={(date) => {
          return dateCellRef(date);
        }}
      />
    </Wrapper>
  );
}
