import { Badge, Calendar, ConfigProvider, DatePicker, theme } from 'antd';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { FaCalendar, FaChartPie } from 'react-icons/fa';
import ReactLoading from 'react-loading';
import styled from 'styled-components/macro';
import { FixedAddBtn } from '../../components/Buttons/Button';
import Container from '../../components/Container';
import Mask from '../../components/Mask';
import PopUpTitle from '../../components/Title/PopUpTitle';
import PopUp from '../../components/layouts/PopUp/PopUp';
import { FinanceContext } from '../../context/FinanceContext';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { deleteExpense, storeBudget, storeExpense } from '../../utils/firebase';
import Analytics from './Analytics';
import './antd.css';
import trash from './img/trash.png';

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

  const { email } = useContext(UserContext);
  const {
    userData,
    selectedDate,
    setSelectedDate,
    userInput,
    setUserInput,
    selectedTask,
    setIsAdding,
    setSelectedMonth,
  } = useContext(StateContext);
  const { expenseRecords, todayBudget, netIncome, monthExpense } =
    useContext(FinanceContext);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [isCalendarView, setIsCalendarView] = useState(true);

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
      date: dayjs().format('YYYY-MM-DD'),
      routine: 'none',
      tag: 'expense',
      category: 'food',
    });
    setIsAddingRecord(true);
    setIsAdding(true);
    getDaysLeft(selectedDate);
  }

  function handleExit() {
    setIsAddingRecord(false);
    setIsAddingBudget(false);
    setIsAdding(false);

    setUserInput({
      amount: '',
      category: '',
      note: '',
    });
  }

  async function handleSubmit(callback) {
    await callback;
    handleExit();
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

  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case 'Escape':
          setIsAddingBudget(false);
          setIsAddingRecord(false);
          setIsAdding(false);
          break;
        case 'n':
          if (e.ctrlKey) {
            e.preventDefault();
            isAddingRecord ? handleExit() : addRecord();
          }
          break;
        case 'Shift':
          if (e.ctrlKey) {
            break;
          }
          e.preventDefault();
          setIsCalendarView((prev) => !prev);
          break;
        case 'b':
          if (e.ctrlKey) {
            isAddingBudget ? handleExit() : editBudget();
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddingRecord, isCalendarView, isAddingBudget]);

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
        labelWidth='130px'
        id='budget'
        onSubmit={(e) => handleSubmit(storeBudget(e, userInput, email))}
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
          handleSubmit(storeExpense(e, userInput, email));
        }}
        id='record'
      >
        <PopUpTitle height='100px' fontSize='24px' onExit={handleExit}>
          Add Record
        </PopUpTitle>
      </PopUp>

      <Mask display={isAddingRecord || isAddingBudget ? 'block' : 'none'} />
      <Header />
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
              components: {
                overflow: 'hidden',
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
                          onClick={() => deleteExpense(record, email)}
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
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;

  &::-webkit-scrollbar {
    background-color: #1b2028;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a4a4a3;
  }

  &::-webkit-scrollbar-track {
    background-color: #1b2028;
  }

  &::-webkit-scrollbar-corner {
    background-color: #1b2028;
  }
`;
