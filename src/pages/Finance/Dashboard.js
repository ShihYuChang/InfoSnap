import { useEffect, useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { Calendar, Badge, theme, ConfigProvider, DatePicker } from 'antd';
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
import Container from '../../components/Container/Container';
import PopUpTitle from '../../components/Title/PopUpTitle';
import { FaCalendar, FaChartPie } from 'react-icons/fa';
import { FixedAddBtn } from '../../components/Buttons/Button';

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
    detailsTitles: ['DATE', 'NOTE', 'AMOUNT', 'CATEGORY', 'DELETE'],
  };

  const { email, isSearching, setIsSearching } = useContext(UserContext);
  const {
    userData,
    expenseRecords,
    todayBudget,
    netIncome,
    selectedDate,
    setSelectedDate,
    userInput,
    setUserInput,
    selectedTask,
    isAdding,
    setIsAdding,
    monthExpense,
    selectedMonth,
    setSelectedMonth,
  } = useContext(StateContext);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [isCalendarView, setIsCalendarView] = useState(true);
  const [todayExpense, setTodayExpense] = useState([]);

  const containerInfos = [
    {
      label: 'Total Expense',
      value: `NT$${getTotalExpense(monthExpense).toLocaleString()}`,
      promptPos: { x: '-130px', y: '30px' },
      promptText: 'The total expense this month.',
      editBtn: false,
    },
    {
      label: 'Net Income',
      value: `NT$${(isNaN(netIncome) ? 0 : netIncome).toLocaleString()}`,
      promptPos: { x: '-130px', y: '30px' },
      promptText: 'Monthly income - Total expenses for the month.',
      editBtn: false,
    },
    {
      label: 'Daily Budget',
      value: `NT$${(isNaN(todayBudget) ? 0 : todayBudget).toLocaleString()}`,
      promptPos: { x: '30px', y: '20px' },
      promptText:
        'The daily spending limit until the end of the month based on your remaining budget.',
      editBtn: true,
      editFunction: editBudget,
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
    setIsAdding(true);
    getDaysLeft(selectedDate);
  }

  function handleExit(e) {
    e.preventDefault();
    setIsAddingRecord(false);
    setIsAddingBudget(false);
    setIsAdding(false);

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
    setIsAdding(true);
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

  function deleteRecord(item) {
    deleteDoc(doc(db, 'Users', email, 'Finance', item.docId));
    alert('Item Deleted!');
  }

  useEffect(() => {
    if (!isCalendarView && expenseRecords) {
      getTodayExpenses(selectedDate);
    }
  }, [expenseRecords, selectedDate, isCalendarView]);

  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case 'Escape':
          setIsAddingBudget(false);
          setIsAddingRecord(false);
          setIsAdding(false);
          break;
        case 'Shift':
          e.ctrlKey && addRecord();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    setUserInput({
      tag: '',
      date: new Date().toISOString().substring(0, 10),
      amount: '',
      category: '',
      note: '',
    });

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (selectedTask?.content.date) {
      const searchedRecordDate = selectedTask.content.date;
      const readableDate = parseTimestamp(searchedRecordDate)?.slice(0, 11);
      setSelectedDate(readableDate);
    }
  }, [selectedTask]);

  if (!userData) {
    return <Loading type='spinningBubbles' color='#313538' />;
  }
  return (
    <Wrapper>
      <FixedAddBtn onClick={addRecord} />
      <PopUp
        questions={questions.budget}
        display={isAddingBudget ? 'flex' : 'none'}
        labelWidth='180px'
        onSubmit={(e) => {
          storeBudget(e);
        }}
        id='budget'
      >
        <PopUpTitle height='100px' fontSize='24px' onExit={handleExit}>
          Edit Budget
        </PopUpTitle>
      </PopUp>
      <PopUp
        questions={questions.record}
        display={isAddingRecord ? 'block' : 'none'}
        labelWidth='100px'
        gridFr='1fr 1fr'
        onSubmit={(e) => {
          storeRecord(e, userInput.date);
        }}
        id='record'
      >
        <PopUpTitle height='100px' fontSize='24px' onExit={handleExit}>
          Add Record
        </PopUpTitle>
      </PopUp>

      <Mask display={isAddingRecord || isAddingBudget ? 'block' : 'none'} />
      <Header></Header>
      <TitlesContainer>
        {containerInfos.map((info, index) => (
          <Container
            key={index}
            height={'200px'}
            title={info.label}
            titleHeight={'60px'}
            titleFontSize='20px'
            fontSize='32px'
            quesitonIcon
            promptTop={info.promptPos.y}
            promptRight={info.promptPos.x}
            promptText={info.promptText}
            editBtn={info.editBtn}
            onEdit={info.editFunction}
            overflow='visible'
            titleColor='#a4a4a3'
          >
            <ContainerText>{info.value}</ContainerText>
          </Container>
        ))}
      </TitlesContainer>
      <ViewsWrapper>
        <View
          onClick={() => setIsCalendarView(true)}
          color={isCalendarView ? 'white' : '#5b5b5b'}
          borderBottom={isCalendarView ? '2px solid #3a6ff7' : '0'}
        >
          <ViewIcon>
            <FaCalendar />
          </ViewIcon>
          <ViewText>Calendar view</ViewText>
        </View>
        <View
          onClick={() => setIsCalendarView(false)}
          color={!isCalendarView ? 'white' : '#5b5b5b'}
          borderBottom={!isCalendarView ? '2px solid #3a6ff7' : '0'}
          marginRight='auto'
        >
          <ViewIcon>
            <FaChartPie />
          </ViewIcon>
          <ViewText>Analytics view</ViewText>
        </View>
        {!isCalendarView && (
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorText: 'white',
                colorTextPlaceholder: '#a4a4a3',
              },
            }}
          >
            <DatePicker
              bordered={false}
              size='large'
              picker='month'
              onChange={(date, dateString) => {
                dateString !== '' &&
                  setSelectedMonth(new Date(dateString).getMonth() + 1);
              }}
            />
          </ConfigProvider>
        )}
      </ViewsWrapper>
      {isCalendarView ? (
        <>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimaryBg: '#4F4F4F',
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
              <TableTitle>Monthly Expense</TableTitle>
            </TableHeader>
            <TitleRow>
              {questions.detailsTitles.map((title, index) => (
                <Titles key={index}>{title}</Titles>
              ))}
            </TitleRow>
            <SplitLine />
            <InfoContainer>
              {monthExpense.length > 0 ? (
                monthExpense.map((record, index) =>
                  record ? (
                    <Info key={index}>
                      <InfoText>{parseTimestamp(record.date)}</InfoText>
                      <InfoText>{record.note}</InfoText>
                      <InfoText>{`NT${record.amount}`}</InfoText>
                      <InfoText>{record.category}</InfoText>
                      <InfoText>
                        <RemoveIcon
                          src={trash}
                          onClick={() => deleteRecord(record)}
                        />
                      </InfoText>
                    </Info>
                  ) : null
                )
              ) : (
                <InfoText>No Expense</InfoText>
              )}
            </InfoContainer>
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
  margin-top: 20px;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  border-radius: 20px;
`;

const TableContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-height: 300px;
  background-color: #1b2028;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding: 40px 70px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const TableHeader = styled.div`
  width: 100%;
  margin-bottom: 30px;
  display: flex;
  justify-content: start;
`;

const TableTitle = styled.div`
  font-size: 32px;
  font-weight: 500;
  letter-spacing: 4px;
`;

const TitleRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const Titles = styled.div`
  width: 20%;
  text-align: center;
  font-size: 24px;
  font-weight: 400;
  color: #a4a4a3;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: ${(props) => props.border ?? '1px solid #a4a4a3'};
  margin: ${(props) => props.margin};
`;

const Info = styled.div`
  width: 100%;
  display: grid;
  /* gap: 50px; */
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
`;

const InfoText = styled.div`
  font-size: 20px;
  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
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
  gap: 100px;
  margin: 35px 0 70px;
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
  padding: 40px 0;
  letter-spacing: 5px;
`;

const ViewsWrapper = styled.div`
  width: 100%;
  display: flex;
  border-bottom: 1px solid #a4a4a3;
  gap: 40px;
  position: relative;
`;

const View = styled.div`
  box-sizing: border-box;
  display: flex;
  gap: 10px;
  cursor: pointer;
  padding: 10px 5px 10px 0;
  position: relative;
  color: ${(props) => props.color};
  border-bottom: ${(props) => props.borderBottom};
  z-index: 1;
  bottom: -1px;
  margin-right: ${(props) => props.marginRight};

  &:hover {
    color: #a4a4a3;
  }
`;

const ViewText = styled.div`
  font-size: 20px;
`;

const ViewIcon = styled.div`
  display: flex;
  align-items: center;
`;

const InfoContainer = styled.div`
  width: 100%;
  height: 300px;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
`;
