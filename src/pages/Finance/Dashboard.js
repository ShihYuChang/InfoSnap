import { useEffect, useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { Calendar, Badge, theme, ConfigProvider } from 'antd';
import ReactLoading from 'react-loading';
import Mask from '../../components/Mask';
// import PopUp from '../../components/PopUp/PopUp';
import PopUp from '../../components/layouts/PopUp/PopUp';
import {
  Timestamp,
  addDoc,
  collection,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { UserContext } from '../../context/userContext';
import { StateContext } from '../../context/stateContext';
import Analytics from './Analytics';
import trash from './img/trash.png';
import pieChartIcon from './img/pieChart.png';
import Container from '../../components/Container/Container';

export default function Dashboard() {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const questions = {
    record: [
      {
        label: 'Type',
        value: 'tag',
        type: 'select',
        options: ['expense', 'income'],
      },
      { label: 'Date', value: 'date', type: 'date' },
      {
        label: 'Routine',
        value: 'routine',
        type: 'select',
        options: ['none', 'every week', 'every month'],
      },
      { label: 'Amount', value: 'amount', type: 'number' },
      {
        label: 'Category',
        value: 'category',
        type: 'select',
        options: ['food', 'traffic', 'entertainment', 'education', 'others'],
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
  const {
    userData,
    expenseRecords,
    todayBudget,
    netIncome,
    expenseRecordsWithDate,
    selectedDate,
    setSelectedDate,
    headerIcons,
    setHeaderIcons,
    userInput,
    setUserInput,
  } = useContext(StateContext);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  // const [userInput, setUserInput] = useState({
  //   tag: '',
  //   date: new Date().toISOString().substring(0, 10),
  //   amount: '',
  //   category: '',
  //   note: '',
  // });
  const [isCalendarView, setIsCalendarView] = useState(true);
  const [todayExpense, setTodayExpense] = useState([]);
  // const [selectedDate, setSelectedDate] = useState('');

  const containerInfos = [
    {
      label: 'Total Expense',
      value: `NT$${getTotalExpense(expenseRecordsWithDate).toLocaleString()}`,
    },
    {
      label: 'Net Income',
      value: `NT$${(isNaN(netIncome) ? 0 : netIncome).toLocaleString()}`,
    },
    {
      label: 'Daily Budget',
      value: `NT$${isNaN(todayBudget) ? 0 : todayBudget}`,
    },
  ];

  function addRecord() {
    setUserInput({
      ...userInput,
      date: userInput.date,
      routine: 'none',
      tag: 'expense',
      category: 'food',
    });
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

  function getNextDaysOfWeek(date, numToDisplay) {
    if (date && date.length > 0) {
      const targetDays = [date];
      const inputDate = new Date(date);

      // Find the next date with the same day of the week
      const nextDayOfWeek = new Date(inputDate);
      nextDayOfWeek.setDate(nextDayOfWeek.getDate() + 7);

      // Add the next two dates with the same day of the week
      for (let i = 0; i < numToDisplay; i++) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = new Date(nextDayOfWeek)
          .toLocaleDateString('zh-TW', options)
          .replace(/\//g, '-');
        targetDays.push(formattedDate);
        nextDayOfWeek.setDate(nextDayOfWeek.getDate() + 7);
      }
      return targetDays;
    }
  }

  function getNextDaysOfMonth(date, numToDisplay) {
    if (date && date.length > 0) {
      const targetDays = [date];
      const inputDate = new Date(date);

      // Find the next date with the same day of the week and month
      const nextDayOfMonth = new Date(inputDate);
      nextDayOfMonth.setMonth(nextDayOfMonth.getMonth() + 1);

      // Add the next `numToDisplay - 1` dates with the same day of the week and month
      for (let i = 0; i < numToDisplay - 1; i++) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = new Date(nextDayOfMonth)
          .toLocaleDateString('zh-TW', options)
          .replace(/\//g, '-');
        targetDays.push(formattedDate);
        nextDayOfMonth.setMonth(nextDayOfMonth.getMonth() + 1);
      }

      return targetDays;
    }
  }

  async function storeRecord(e, date) {
    e.preventDefault();
    if (userInput.routine === 'every week') {
      const targetDates = getNextDaysOfWeek(userInput.date, 3);
      targetDates.forEach((date) => {
        const input = JSON.parse(JSON.stringify(userInput));
        const timestamp = getTimestamp(new Date(date));
        input.date = timestamp;
        addDoc(collection(db, 'Users', email, 'Finance'), input);
      });
    } else if (userInput.routine === 'every month') {
      const targetDates = getNextDaysOfMonth(userInput.date, 3);
      targetDates.forEach((date) => {
        const input = JSON.parse(JSON.stringify(userInput));
        const timestamp = getTimestamp(new Date(date));
        input.date = timestamp;
        addDoc(collection(db, 'Users', email, 'Finance'), input);
      });
    } else {
      const input = { ...userInput };
      const now = new Date(date);
      const timestamp = getTimestamp(now);
      input.date = timestamp;
      await addDoc(collection(db, 'Users', email, 'Finance'), input);
    }
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

  function editBudget() {
    setUserInput({
      monthlyIncome: userData.income,
      savingsGoal: userData.savingsGoal,
    });
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

  function getTodayExpenses(date) {
    const allRecords = JSON.parse(JSON.stringify(expenseRecords));
    const todayExpense = allRecords.filter(
      (expense) => parseTimestamp(expense.date) === date
    );
    setTodayExpense(todayExpense);
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
          <div key={index}>
            <ul>
              <li>
                <Badge
                  text={`${record.note}: NT$${record.amount}`}
                  key={index}
                  status='success'
                />
              </li>
            </ul>
          </div>
        );
      } else {
        return null;
      }
    });
    return nodes;
  };

  function selectDate(e) {
    setSelectedDate(e.target.value);
  }

  function deleteRecord(item) {
    deleteDoc(doc(db, 'Users', email, 'Finance', item.docId));
    alert('Item Deleted!');
  }

  useEffect(() => {
    if (!isCalendarView) {
      getTodayExpenses(selectedDate);
    }
  }, [expenseRecords, selectedDate, isCalendarView]);

  // useEffect(() => {
  //   if (isAddingBudget) {
  //     setUserInput({
  //       savingsGoal: '',
  //       monthlyIncome: '',
  //     });
  //   }
  // }, [isAddingRecord, isAddingBudget]);

  useEffect(() => {
    const now = new Date().toLocaleDateString();
    const [month, day, year] = now.split('/');
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    const newDate = `${year}-${formattedMonth}-${formattedDay}`;
    setSelectedDate(newDate);

    const icons = [
      { button: true, text: 'Edit Budget', width: true, onClick: editBudget },
      {
        type: 'add',
        onClick: addRecord,
      },
      {
        imgUrl: pieChartIcon,
        onClick: () => {
          setIsCalendarView((prev) => !prev);
        },
      },
    ];
    setHeaderIcons(icons);

    function handleExit(e) {
      if (e.key === 'Escape') {
        setIsAddingBudget(false);
        setIsAddingRecord(false);
      }
      return;
    }

    window.addEventListener('keydown', handleExit);

    setUserInput({
      tag: '',
      date: new Date().toISOString().substring(0, 10),
      amount: '',
      category: '',
      note: '',
    });
  }, []);

  if (!userData) {
    return <Loading type='spinningBubbles' color='#313538' />;
  }
  return (
    <Wrapper>
      <PopUp
        questions={questions.budget}
        display={isAddingBudget ? 'block' : 'none'}
        labelWidth='180px'
        onSubmit={(e) => {
          storeBudget(e);
        }}
        id='budget'
      />
      <PopUp
        questions={questions.record}
        display={isAddingRecord ? 'block' : 'none'}
        labelWidth='180px'
        onSubmit={(e) => {
          storeRecord(e, userInput.date);
        }}
        id='record'
      />

      <Mask display={isAddingRecord || isAddingBudget ? 'block' : 'none'} />
      <Header></Header>
      {isCalendarView ? (
        <>
          <TitlesContainer>
            {containerInfos.map((info, index) => (
              <Container
                height={'200px'}
                title={info.label}
                titleHeight={'60px'}
                titleFontSize='24px'
                fontSize='32px'
              >
                <ContainerText>{info.value}</ContainerText>
              </Container>
            ))}
          </TitlesContainer>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimaryBg: '#3a6ff7',
              },
            }}
          >
            <Calendar
              onSelect={(value) => {
                const selectedDate = value.format('YYYY-MM-DD');
                setUserInput({
                  tag: '',
                  date: selectedDate,
                  amount: '',
                  category: '',
                  note: '',
                });
                setSelectedDate(selectedDate);
              }}
              cellRender={(date) => {
                return dateCellRef(date);
              }}
            />
          </ConfigProvider>
        </>
      ) : (
        <AnalyticWrapper>
          <Analytics />
          <TableContainer>
            <TableHeader>
              <DateSelect
                type='date'
                onChange={(e) => selectDate(e)}
                value={selectedDate}
              />
            </TableHeader>
            {todayExpense.length > 0 ? (
              todayExpense.map((record, index) =>
                record ? (
                  <Info key={index}>
                    <InfoTitle>{parseTimestamp(record.date)}</InfoTitle>
                    <InfoTitle>{record.note}</InfoTitle>
                    <InfoTitle>{`NT${record.amount}`}</InfoTitle>
                    <InfoTitle>{record.category}</InfoTitle>
                    <RemoveIcon
                      src={trash}
                      onClick={() => deleteRecord(record)}
                    />
                  </Info>
                ) : null
              )
            ) : (
              <h1>No Expense</h1>
            )}
          </TableContainer>
        </AnalyticWrapper>
      )}
    </Wrapper>
  );
}

const AnalyticWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 50px 0;
`;

const TableContainer = styled.div`
  width: 70%;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding: 20px 0;
`;

const TableHeader = styled.div`
  width: 70%;
  height: 50px;
  display: flex;
  justify-content: end;
`;

const Info = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  gap: 50px;
  justify-content: center;
`;

const InfoTitle = styled.h3``;

const DateSelect = styled.input`
  width: 120px;
  height: 50px;
  cursor: pointer;
`;

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

const TitlesContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 150px;
  margin: 35px 0 100px;
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

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const RemoveIcon = styled.img`
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin-top: 10px;
`;

const ContainerText = styled.div`
  padding: 50px 0;
`;
