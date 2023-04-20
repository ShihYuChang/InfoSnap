import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { db } from '../../firebase';
import {
  onSnapshot,
  query,
  collection,
  where,
  doc,
  setDoc,
} from 'firebase/firestore';
import Exit from '../../components/Buttons/Exit';
import { UserContext } from '../../context/userContext';
import { StateContext } from '../../context/stateContext';
import { EventContext } from '../../context/eventContext';
import { getUserEmail } from '../../utils/Firebase';
import ReactLoading from 'react-loading';
import { useNavigate } from 'react-router-dom';
import calendarIcon from './img/calendar.png';
import taskIcon from './img/tasks-white.png';
import budgetIcon from './img/budget.png';
import incomeIcon from './img/income.png';
import Icon from '../../components/Icon';
import { Calendar, theme, ConfigProvider } from 'antd';

const ContentTitle = styled.h2``;

export default function Dashboard() {
  const navigate = useNavigate();
  const { email, setEmail } = useContext(UserContext);
  const {
    setHeaderIcons,
    todayBudget,
    netIncome,
    setSelectedDate,
    nutritions,
  } = useContext(StateContext);
  const { todayTasks } = useContext(EventContext);
  const { token } = theme.useToken();
  const [pinnedNote, setPinnedNote] = useState(null);
  const [isSelectingDate, setIsSelectingDate] = useState(false);

  const wrapperStyle = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorInfo,
  };

  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    setSelectedDate(today);
    getUserEmail(setEmail);
  }, []);

  useEffect(() => {
    if (email) {
      const unsub = onSnapshot(
        query(
          collection(db, 'Users', email, 'Notes'),
          where('pinned', '==', true)
        ),
        (querySnapshot) => {
          const notes = [];
          querySnapshot.forEach((doc) => {
            notes.push({ content: doc.data(), id: doc.id, isVisible: true });
          });
          setPinnedNote(notes);
        }
      );
      return unsub;
    }
  }, [email]);

  async function removePin(id, note) {
    const newNote = note;
    newNote.pinned = false;
    await setDoc(doc(db, 'Users', email, 'Notes', id), newNote);
    alert('Note Unpinned!');
  }

  function clickCalendar() {
    setIsSelectingDate((prev) => !prev);
  }

  function selectDate(date) {
    setSelectedDate(date);
  }

  useEffect(() => {
    setHeaderIcons([{ imgUrl: calendarIcon, onClick: clickCalendar }]);
  }, []);

  if (!pinnedNote) {
    return <Loading type='spinningBubbles' color='#313538' />;
  }
  return (
    <Wrapper>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#3a6ff7',
            colorBgContainer: '#1B2028',
            colorText: 'white',
          },
        }}
      >
        <CalendarWrapper display={isSelectingDate ? 'block' : 'none'}>
          <div style={wrapperStyle}>
            <Calendar
              fullscreen={false}
              onSelect={(value) => selectDate(value.format('YYYY-MM-DD'))}
            />
          </div>
        </CalendarWrapper>
      </ConfigProvider>
      <Notes>
        {pinnedNote.map((note, index) => (
          <NoteContainer key={index}>
            <Note dangerouslySetInnerHTML={{ __html: note.content.context }} />
            <Exit
              top={0}
              right={0}
              handleClick={() => removePin(note.id, note.content)}
            >
              X
            </Exit>
          </NoteContainer>
        ))}
      </Notes>
      <BottomSection>
        <Box width='370px'>
          <BoxTitle>
            <Icon width='35px' imgUrl={taskIcon} />
            <Title>Today's Tasks</Title>
          </BoxTitle>
        </Box>
        <RightContainer>
          <Box height='280px'>
            <BoxTitle>
              <TitleContainer>
                <Icon width='35px' imgUrl={budgetIcon} />
                <Title>Budget</Title>
              </TitleContainer>
              <TitleContainer>
                <Icon width='35px' imgUrl={incomeIcon} />
                <Title>Net Income</Title>
              </TitleContainer>
            </BoxTitle>
          </Box>
          <Box height='280px' hasTitle>
            <BoxTitle>
              <Title>Carbs</Title>
              <Title>Protein</Title>
              <Title>Fat</Title>
            </BoxTitle>
          </Box>
        </RightContainer>
      </BottomSection>
      <Section grid='1fr 1fr' id='finance'>
        <Card onClick={() => navigate('./finance')}>
          <ContentTitle>Today's Budget</ContentTitle>
          <ContentTitle>{`NT$${todayBudget.toLocaleString()}`}</ContentTitle>
        </Card>
        <Card onClick={() => navigate('./finance')}>
          <ContentTitle>Net Income (month)</ContentTitle>
          <ContentTitle>{`NT$${netIncome.toLocaleString()}`}</ContentTitle>
        </Card>
      </Section>
      <Title>Health</Title>
      <Section grid='1fr 1fr 1fr' id='health'>
        {nutritions.map((nutrition, index) => (
          <Card key={index}>
            <ContentTitle>{nutrition.title}</ContentTitle>
            <ContentTitle>
              {nutrition.goal > nutrition.total
                ? (nutrition.goal - nutrition.total).toFixed(2)
                : 0}
            </ContentTitle>
          </Card>
        ))}
      </Section>
      <Title>Tasks</Title>
      <Section grid='1fr 1fr 1fr' id='task'>
        {todayTasks.map((task, index) => (
          <Card key={index}>
            <ContentTitle>{task.summary}</ContentTitle>
            <ContentText>{`${task.start.date} to ${task.end.date}`}</ContentText>
          </Card>
        ))}
      </Section>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  margin: 0 0 50px 0;
  padding: 84px 0;
`;

const Notes = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  row-gap: 20px;
  margin-bottom: 80px;
`;

const NoteContainer = styled.div`
  position: relative;
`;

const Note = styled.div`
  height: 200px;
  background-color: #1b2028;
  border-radius: 10px;
  padding: 30px;
`;

const TitleContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Title = styled.div`
  font-size: 28px;
  font-weight: 800;
`;

const BottomSection = styled.div`
  width: 100%;
  display: flex;
  gap: 82px;
  height: 550px;
`;

const RightContainer = styled.div`
  flex-grow: 1;
  height: 550px;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const Section = styled.div`
  width: 50%;
  display: grid;
  grid-template-columns: ${(props) => props.grid};
  gap: 30px;
  margin: 0 auto;
`;

const Card = styled.div`
  height: 200px;
  border: 1px solid black;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentText = styled.p`
  font-size: 18px;
`;

const CalendarWrapper = styled.div`
  display: ${({ display }) => display};
  position: absolute;
  z-index: 10;
  right: 30px;
  top: 120px;
`;

const Box = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: #1b2028;
  border-radius: 10px;
`;

const BoxTitle = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 80px;
  border-radius: 10px;
  background-color: #3a6ff7;
  justify-content: space-around;
  color: white;
  padding: 23px 36px;
`;
