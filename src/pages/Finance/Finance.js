import { Badge, Calendar, ConfigProvider, DatePicker, theme } from 'antd';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { FaCalendar, FaChartPie } from 'react-icons/fa';
import ReactLoading from 'react-loading';
import styled from 'styled-components/macro';
import { FixedAddBtn } from '../../components/Buttons/Button';
import Container from '../../components/Container';
import Mask from '../../components/Mask/Mask';
import PopUpTitle from '../../components/Title/PopUpTitle';
import PopUp from '../../components/layouts/PopUp/PopUp';
import { FinanceContext } from '../../context/FinanceContext';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { useShortcuts } from '../../hooks/useShortcuts';
import {
  deleteExpense,
  storeBudget,
  storeExpense,
} from '../../utils/firebase/firebase';
import { getDaysLeft, parseTimestamp } from '../../utils/timestamp';
import Analytics from './Analytics';
import './antd.css';
import trash from './img/trash.png';

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

const RecordRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-radius: 10px;
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

const InfoText = styled.div`
  font-size: 20px;
  display: flex;
  line-height: 30px;
  justify-content: center;
`;

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
  align-items: start;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 100px;
  margin: 35px 0 70px;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const RemoveIcon = styled.img`
  width: 25px;
  height: 25px;
  cursor: pointer;
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

export default function Finance() {
  const { userInfo } = useContext(UserContext);
  const email = userInfo.email;
  const {
    selectedDate,
    setSelectedDate,
    userInput,
    setUserInput,
    selectedTask,
    isEditing,
    setIsEditing,
    setSelectedMonth,
  } = useContext(StateContext);
  const {
    userFinanceData,
    expenseRecords,
    todayBudget,
    netIncome,
    monthExpense,
  } = useContext(FinanceContext);
  const [itemAdding, setItemAdding] = useState(null);
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
  const shortcuts = {
    Escape: handleExit,
    n: (e) => {
      if (e.ctrlKey) {
        itemAdding === 'record' ? handleExit() : addRecord();
      }
    },
    b: (e) => {
      if (e.ctrlKey) {
        itemAdding === 'budget' ? handleExit() : editBudget();
      }
    },
    Shift: () => setIsCalendarView((prev) => !prev),
  };

  function handleExit() {
    setItemAdding(null);
    setIsEditing(false);
    setUserInput({
      amount: '',
      category: '',
      note: '',
    });
  }

  function addRecord() {
    setUserInput({
      ...userInput,
      date: dayjs().format('YYYY-MM-DD'),
      routine: 'none',
      tag: 'expense',
      category: 'food',
    });
    setIsEditing(true);
    setItemAdding('record');
    getDaysLeft(selectedDate);
  }

  function editBudget() {
    setUserInput({
      monthlyIncome: `${userFinanceData.income}`,
      savingsGoal: `${userFinanceData.savingsGoal}`,
    });
    setItemAdding('budget');
    setIsEditing(true);
  }

  async function handleSubmit(callback) {
    await callback;
    handleExit();
  }

  function getTotalExpense(data) {
    return data.reduce((acc, cur) => {
      return acc + Number(cur.amount);
    }, 0);
  }

  const dateCellRef = (date) => {
    const records = [...expenseRecords];
    const stringDateRecords = records.map((record) => ({
      ...record,
      stringDate: parseTimestamp(record.date, 'YYYY-MM-DD'),
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

  useShortcuts(shortcuts);

  useEffect(() => {
    if (selectedTask?.content.date) {
      setIsCalendarView(false);
      const searchedRecordDate = selectedTask.content.date;
      const recordMonth = parseTimestamp(searchedRecordDate, 'M');
      setSelectedMonth(Number(recordMonth));
      // const selectedTaskNode = document.getElementById(`${selectedTask.id}`);
      // selectedTaskNode?.scrollIntoView({
      //   behavior: 'smooth',
      //   block: 'nearest',
      //   inline: 'nearest',
      // });
    }
  }, [selectedTask]);

  if (!userFinanceData) {
    return <Loading type='spinningBubbles' color='#313538' />;
  }
  return (
    <Wrapper>
      <Mask display={isEditing ? 'block' : 'none'} />
      <FixedAddBtn onClick={addRecord} />
      <PopUp
        questions={questions.budget}
        display={itemAdding === 'budget' ? 'block' : 'none'}
        labelWidth='130px'
        gridFr='1fr 1fr'
        id='budget'
        onSubmit={(e) => handleSubmit(storeBudget(e, userInput, email))}
      >
        <PopUpTitle height='100px' fontSize='24px' onExit={handleExit}>
          Edit Budget
        </PopUpTitle>
      </PopUp>
      <PopUp
        questions={questions.record}
        display={itemAdding === 'record' ? 'block' : 'none'}
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
                    <RecordRow
                      key={index}
                      backgroundColor={
                        record.docId === selectedTask?.id && '#3a6ff7'
                      }
                      id={record.docId}
                    >
                      <InfoText>
                        {parseTimestamp(record.date, 'YYYY-MM-DD')}
                      </InfoText>
                      <InfoText>{record.note}</InfoText>
                      <InfoText>{`NT${record.amount}`}</InfoText>
                      <InfoText>{record.category}</InfoText>
                      <InfoText>
                        <RemoveIcon
                          src={trash}
                          onClick={() => deleteExpense(record, email)}
                        />
                      </InfoText>
                    </RecordRow>
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
