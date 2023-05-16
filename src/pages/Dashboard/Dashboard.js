import { ConfigProvider, Progress } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { BsFillCheckCircleFill } from 'react-icons/bs';
import ReactLoading from 'react-loading';
import styled from 'styled-components/macro';
import Container from '../../components//Container';
import Button from '../../components/Buttons/Button';
import Exit from '../../components/Buttons/Exit';
import { EventContext } from '../../context/EventContext';
import { FinanceContext } from '../../context/FinanceContext';
import { HealthContext } from '../../context/HealthContext';
import { UserContext } from '../../context/UserContext';
import {
  finishTask,
  getPinnedNotes,
  removePin,
} from '../../utils/firebase/firebase';

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
  box-sizing: border-box;
  font-size: 24px;
  width: 150px;
  flex-wrap: wrap;
  word-wrap: break-word;
  flex-grow: 1;
  font-weight: 500;
  text-align: start;
  padding-left: 10px;
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
  box-sizing: border-box;
  height: 300px;
  background-color: #1b2028;
  border-radius: 10px;
  padding: 10px 50px;
  overflow: scroll;
  font-size: 20px;
  line-height: 35px;
  letter-spacing: 1px;
  line-height: 0 50px;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;

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

const TitleContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
`;

const BottomSection = styled.div`
  width: 100%;
  display: flex;
  gap: 82px;
  height: 850px;
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
  background-color: #1b1f28;
  color: white;
  padding: 23px 36px;
  position: relative;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const BottomContainer = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  display: flex;
  flex-direction: column;
  flex-grow: ${(props) => props.flexGrow ?? 1};
  box-shadow: ${(props) => props.shadow};
  border-radius: 20px;
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
  padding-top: 30px;
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

export default function Dashboard() {
  const { userInfo } = useContext(UserContext);
  const { dailyBudget, todayBudget, netIncome, todayExpense } =
    useContext(FinanceContext);
  const { nutritions } = useContext(HealthContext);
  const { todayTasks } = useContext(EventContext);
  const [pinnedNote, setPinnedNote] = useState(null);
  const [collapseItems, setCollapseItems] = useState([]);
  const email = userInfo?.email;

  function handleCollapse(target) {
    collapseItems.includes(target)
      ? setCollapseItems(collapseItems.filter((item) => item !== target))
      : setCollapseItems([...collapseItems, target]);
  }

  useEffect(() => {
    email && getPinnedNotes(email, setPinnedNote);
  }, [email]);

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
              top='20px'
              right='30px'
              handleClick={() => removePin(note.id, note.content, email)}
            >
              ×
            </Exit>
          </NoteContainer>
        ))}
      </Notes>
      <BottomSection>
        <BottomContainer
          height='100%'
          width='350px'
          shadow={
            collapseItems.includes('tasks')
              ? null
              : 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px'
          }
        >
          <BoxTitle>
            <Title>Today's Tasks</Title>
            <Button
              width='30px'
              type='collapse'
              top='0'
              right='15px'
              onClick={() => handleCollapse('tasks')}
              data={collapseItems}
              target='tasks'
            />
          </BoxTitle>
          <Container
            padding={collapseItems.includes('tasks') ? 0 : '36px'}
            flexGrow={collapseItems.includes('tasks') ? 0 : 1}
            bottomRadius
          >
            {collapseItems.includes('tasks')
              ? null
              : todayTasks
                  .filter((task) => task.status !== 'done')
                  .map((task, index) => (
                    <TaskRow key={index}>
                      <TaskIcon onClick={() => finishTask(email, task)}>
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
            height='380px'
            flexGrow='0'
            shadow={
              collapseItems.includes('finance')
                ? null
                : 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px'
            }
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
                <Title>Finance Summary</Title>
              </TitleContainer>
            </BoxTitle>
            <Container
              width='100%'
              height={collapseItems.includes('finance') ? 0 : '250px'}
              padding={collapseItems.includes('finance') ? 0 : '40px 23px'}
              bottomRadius
              flexGrow={collapseItems.includes('finance') ? 0 : 1}
            >
              <FinanceContainer>
                {collapseItems.includes('finance') ? null : (
                  <>
                    <FinanceContent>
                      <SubTitle>Budget</SubTitle>
                      <FinanceText>
                        {isNaN(todayBudget)
                          ? `NT$${0}`
                          : `NT$${todayBudget.toLocaleString()}`}
                      </FinanceText>
                      <ProgressContainer>
                        <ProgressBar
                          // value={
                          //   todayExpense / dailyBudget > 0
                          //     ? parseInt((todayExpense / dailyBudget) * 100)
                          //     : 0
                          // }
                          value={30}
                          max='100'
                        ></ProgressBar>
                        <ProgressInfoText>
                          {/* {todayBudget > 0
                            ? `${parseInt((todayExpense / dailyBudget) * 100)}%`
                            : '100%'} */}
                          30%
                        </ProgressInfoText>
                      </ProgressContainer>
                    </FinanceContent>
                    <FinanceContent>
                      <SubTitle>Net Income</SubTitle>
                      <FinanceText>
                        {isNaN(netIncome)
                          ? 'NT$0'
                          : `NT$${netIncome.toLocaleString()}`}
                      </FinanceText>
                      <IncomeChange>+ 1.25% ↗</IncomeChange>
                    </FinanceContent>
                  </>
                )}
              </FinanceContainer>
            </Container>
          </BottomContainer>
          <BottomContainer
            shadow={
              collapseItems.includes('health')
                ? null
                : 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px'
            }
          >
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
            </BoxTitle>
            <Container
              width='100%'
              padding={collapseItems.includes('health') ? 0 : '40px 23px'}
              bottomRadius
              flexGrow={collapseItems.includes('health') ? 0 : 1}
            >
              {collapseItems.includes('health') ? null : (
                <CircleProgressContainer>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorText: 'white',
                      },
                    }}
                  >
                    {nutritions.map((nutrition, index) => (
                      <div key={index}>
                        <Circle>
                          <SubTitle>{nutrition.title}</SubTitle>
                          <CircleText>
                            {nutrition.goal > nutrition.total
                              ? `${parseInt(nutrition.goal - nutrition.total)}g`
                              : 0}
                          </CircleText>
                          <Progress
                            type='circle'
                            percent={
                              nutrition.total / nutrition.goal > 0
                                ? parseInt(
                                    (nutrition.total / nutrition.goal) * 100
                                  )
                                : 0
                            }
                            size={90}
                            trailColor='#a4a4a3'
                          />
                        </Circle>
                      </div>
                    ))}
                  </ConfigProvider>
                </CircleProgressContainer>
              )}
            </Container>
          </BottomContainer>
        </RightContainer>
      </BottomSection>
    </Wrapper>
  );
}
