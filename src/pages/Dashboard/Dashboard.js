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
  updateDoc,
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
import { BsFillCheckCircleFill } from 'react-icons/bs';

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

  console.log(nutritions);
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

  function handleCollapse(target) {
    collapseItems.includes(target)
      ? setCollapseItems(collapseItems.filter((item) => item !== target))
      : setCollapseItems([...collapseItems, target]);
  }

  function handleCheck(task) {
    const docId = task.docId;
    const newTask = {
      task: task.summary,
      status: 'done',
      startDate: new Date(task.start.date),
      expireDate: new Date(task.end.date),
    };
    updateDoc(doc(db, 'Users', email, 'Tasks', docId), newTask);
    alert('Status Updated!');
  }

  if (!pinnedNote) {
    return <Loading type='spinningBubbles' color='#313538' />;
  }

  return (
    <Wrapper>
      <Notes display={pinnedNote.length > 0 ? 'grid' : 'none'}>
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
        <BottomContainer height='100%'>
          <BoxTitle>
            {/* <Icon width='35px' imgUrl={taskIcon} /> */}
            <Title>Today's Tasks</Title>
            <Button
              width='30px'
              type='collapse'
              top={0}
              right='15px'
              onClick={() => handleCollapse('tasks')}
              data={collapseItems}
              target='tasks'
            />
          </BoxTitle>
          <Container
            padding='36px 36px'
            display={collapseItems.includes('tasks') ? 'none' : 'block'}
            bottomRadius
          >
            {todayTasks.map((task, index) => (
              <TaskRow key={index}>
                <TaskIcon onClick={() => handleCheck(task)}>
                  <BsFillCheckCircleFill size={25} />
                </TaskIcon>
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
                onClick={() => handleCollapse('finance')}
                data={collapseItems}
                target='finance'
              />
              <TitleContainer>
                {/* <Icon width='35px' imgUrl={budgetIcon} /> */}
                <Title>Finance Summary</Title>
              </TitleContainer>
              {/* <TitleContainer>
                <Icon width='35px' imgUrl={incomeIcon} />
                <Title>Net Income</Title>
              </TitleContainer> */}
            </BoxTitle>
            <Container
              width='100%'
              padding='40px 23px'
              bottomRadius
              display={collapseItems.includes('finance') ? 'none' : 'block'}
            >
              <FinanceContainer>
                <FinanceContent>
                  <SubTitle>Budget</SubTitle>
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
                  <SubTitle>Net Income</SubTitle>
                  <FinanceText>{`NT$${netIncome.toLocaleString()}`}</FinanceText>
                  <IncomeChange>+ 1.25% ↗</IncomeChange>
                </FinanceContent>
              </FinanceContainer>
            </Container>
          </BottomContainer>
          <BottomContainer>
            <BoxTitle>
              <Button
                width='30px'
                type='collapse'
                top='0'
                right='20px'
                onClick={() => handleCollapse('health')}
                data={collapseItems}
                target='health'
              />
              <Title>Nutrition Summary</Title>
              {/* <Title>Protein</Title>
              <Title>Fat</Title> */}
            </BoxTitle>
            <Container
              width='100%'
              padding='40px 23px'
              bottomRadius
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
                        <SubTitle>{nutrition.title}</SubTitle>
                        <CircleText>
                          {nutrition.goal > nutrition.total
                            ? `${parseInt(nutrition.goal - nutrition.total)}g`
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
  padding-top: 70px;
`;

const Notes = styled.div`
  width: 100%;
  display: ${(props) => props.display};
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
  margin: 10px auto 36px;
  align-items: center;
`;

const TaskTexts = styled.div`
  font-size: 24px;
  width: 150px;
  flex-wrap: wrap;
  word-wrap: break-word;
  flex-grow: 1;
  font-weight: 500;
`;

const TaskIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #45c489;
`;

const TaskDate = styled.div`
  color: #a4a4a3;
  font-weight: 500;
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
  font-weight: 500;
`;

const BottomSection = styled.div`
  width: 100%;
  display: flex;
  gap: 82px;
  height: 750px;
`;

const RightContainer = styled.div`
  flex-grow: 1;
  height: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 50px;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const BoxTitle = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 80px;
  /* background-color: #1b1f28; */
  background-color: #4f4f4f;
  opacity: 0.8;
  justify-content: space-around;
  color: white;
  padding: 23px 36px;
  position: relative;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const BottomContainer = styled.div`
  width: ${(props) => props.width};
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const FinanceContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FinanceContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
`;

const FinanceText = styled.div`
  font-size: 32px;
  font-weight: 500;
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
  font-size: 32px;
  font-weight: 500;
`;

const Circle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const SubTitle = styled.div`
  margin-bottom: 10px;
  font-size: 22px;
  font-weight: 400;
  color: #a4a4a3;
`;
