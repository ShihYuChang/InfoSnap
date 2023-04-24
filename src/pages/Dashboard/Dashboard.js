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
import taskIcon from './img/tasks-white.png';
import budgetIcon from './img/budget.png';
import incomeIcon from './img/income.png';
import Icon from '../../components/Icon';
import { Progress, ConfigProvider } from 'antd';
import Container from '../../components/Container/Container';
import Button from '../../components/Buttons/Button';
import { IoIosArrowDown } from 'react-icons/io';
import { IoIosArrowUp } from 'react-icons/io';

export default function Dashboard() {
  const navigate = useNavigate();
  const { email, setEmail } = useContext(UserContext);
  const {
    todayBudget,
    netIncome,
    setSelectedDate,
    nutritions,
    dailyBudget,
    setHeaderIcons,
    todayExpense,
  } = useContext(StateContext);
  const { todayTasks } = useContext(EventContext);
  const [pinnedNote, setPinnedNote] = useState(null);
  const [collapseItems, setCollapseItems] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    setSelectedDate(today);
    getUserEmail(setEmail);
    setHeaderIcons([]);
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

  function handleCollpase(target) {
    collapseItems.includes(target)
      ? setCollapseItems(collapseItems.filter((item) => item !== target))
      : setCollapseItems([...collapseItems, target]);
  }

  if (!pinnedNote) {
    return <Loading type='spinningBubbles' color='#313538' />;
  }
  return (
    <Wrapper>
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
        <BottomContainer width='370px' height={'100%'}>
          <BoxTitle>
            <Icon width='35px' imgUrl={taskIcon} />
            <Title>Today's Tasks</Title>
            <Button
              width='30px'
              type='collapse'
              top={0}
              right='5px'
              onClick={() => handleCollpase('tasks')}
              data={collapseItems}
              target='tasks'
            />
          </BoxTitle>
          <Container
            width='370px'
            padding='36px 36px'
            display={collapseItems.includes('tasks') ? 'none' : 'block'}
          >
            {todayTasks.map((task, index) => (
              <TaskRow key={index}>
                <TaskTexts>{task.summary}</TaskTexts>
                <TaskDate>{task.end.date}</TaskDate>
              </TaskRow>
            ))}
          </Container>
        </BottomContainer>
        <RightContainer>
          <BottomContainer
            height={collapseItems.includes('finance') ? null : '280px'}
          >
            <BoxTitle>
              <Button
                width='30px'
                type='collapse'
                top='0'
                right='20px'
                onClick={() => handleCollpase('finance')}
                data={collapseItems}
                target='finance'
              />
              <TitleContainer>
                <Icon width='35px' imgUrl={budgetIcon} />
                <Title>Budget</Title>
              </TitleContainer>
              <TitleContainer>
                <Icon width='35px' imgUrl={incomeIcon} />
                <Title>Net Income</Title>
              </TitleContainer>
            </BoxTitle>
            <Container
              width='100%'
              padding='40px 23px'
              display={collapseItems.includes('finance') ? 'none' : 'block'}
            >
              <FinanceContainer>
                <FinanceContent>
                  <FinanceText>
                    {isNaN(todayBudget)
                      ? `NT$${0}`
                      : `NT$${todayBudget.toLocaleString()}`}
                  </FinanceText>
                  <ProgressContainer>
                    <ProgressBar
                      value={parseInt((todayExpense / todayBudget) * 100)}
                      max='100'
                    ></ProgressBar>
                    <ProgressInfoText>
                      {todayBudget > 0
                        ? `${parseInt((todayExpense / todayBudget) * 100)}%`
                        : '100%'}
                    </ProgressInfoText>
                  </ProgressContainer>
                </FinanceContent>
                <FinanceContent>
                  <FinanceText>{`NT$${netIncome.toLocaleString()}`}</FinanceText>
                  <IncomeChange>+ 1.25% ↗</IncomeChange>
                </FinanceContent>
              </FinanceContainer>
            </Container>
          </BottomContainer>
          <BottomContainer height='280px'>
            <BoxTitle>
              <Button
                width='30px'
                type='collapse'
                top='0'
                right='20px'
                onClick={() => handleCollpase('health')}
                data={collapseItems}
                target='health'
              />
              <Title>Carbs</Title>
              <Title>Protein</Title>
              <Title>Fat</Title>
            </BoxTitle>
            <Container
              width='100%'
              padding='23px 36px'
              display={collapseItems.includes('health') ? 'none' : 'block'}
            >
              <CircleProgressContainer>
                <ConfigProvider
                  theme={{
                    token: {
                      colorText: 'white',
                    },
                  }}
                >
                  {nutritions.map((nutrition, index) => (
                    <>
                      <Circle>
                        <CircleText>
                          {nutrition.goal > nutrition.total
                            ? `${parseInt(nutrition.goal - nutrition.total)} g`
                            : 0}
                        </CircleText>
                        <Progress
                          type='circle'
                          percent={parseInt(
                            (nutrition.total / nutrition.goal) * 100
                          )}
                          size={90}
                          trailColor='#a4a4a3'
                        />
                      </Circle>
                    </>
                  ))}
                </ConfigProvider>
              </CircleProgressContainer>
            </Container>
          </BottomContainer>
        </RightContainer>
      </BottomSection>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  margin: 0 0 50px 0;
  padding: 70px 0;
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

const TaskRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 36px auto;
  align-items: center;
`;

const TaskTexts = styled.div`
  font-size: 24px;
  width: 150px;
  flex-wrap: wrap;
  word-wrap: break-word;
`;

const TaskDate = styled.div`
  flex-grow: 1;
  color: #a4a4a3;
`;

const Note = styled.div`
  height: 200px;
  background-color: #1b2028;
  border-radius: 10px;
  padding: 30px;
  overflow: scroll;
  font-size: 20px;
  line-height: 30px;
  letter-spacing: 1px;
  line-height: 50px;
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
  position: relative;
`;

const BottomContainer = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  display: flex;
  flex-direction: column;
`;

const FinanceContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FinanceContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
`;

const FinanceText = styled.div`
  font-size: 30px;
  font-weight: 700;
`;

const ProgressContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ProgressInfoText = styled.div`
  color: grey;
  font-size: 20px;
  font-weight: 500;
  line-height: 25px;
`;

const ProgressBar = styled.progress`
  height: 30px;
`;

const IncomeChange = styled.div`
  font-size: 24px;
  color: #45c489;
  font-weight: 500;
`;

const CircleProgressContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const CircleText = styled.div`
  font-size: 24px;
  font-weight: 700;
`;

const Circle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;
