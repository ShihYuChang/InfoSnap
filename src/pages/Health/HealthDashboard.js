import Swal from 'sweetalert2';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  query,
  Timestamp,
  deleteDoc,
  orderBy,
  startAfter,
  endBefore,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Progress, theme, ConfigProvider, DatePicker } from 'antd';
import { useEffect, useState, useContext } from 'react';
import { HealthContext } from './healthContext';
import { StateContext } from '../../context/stateContext';
import { UserContext } from '../../context/userContext';
import styled from 'styled-components/macro';
import SearchFood from './SearchFood';
import Mask from '../../components/Mask';
import PopUp from '../../components/layouts/PopUp/PopUp';
import Table from '../../components/Table/Table';
import Button, { FixedAddBtn } from '../../components/Buttons/Button';
import { DateSelector } from '../../components/Inputs/Question';
import trash from './img/trash-can.png';
import Icon from '../../components/Icon';
import PopUpTitle from '../../components/Title/PopUpTitle';

const Wrapper = styled.div`
  width: 100%;
  display: 'flex';
  flex-direction: 'column';
  gap: '20px';
  align-items: 'center';
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 50px;
  margin-bottom: 50px;
`;

const ExportText = styled.a`
  color: white;
  text-decoration: none;
`;

const Plans = styled.select`
  height: 36px;
  background-color: #a4a4a3;
  color: white;
  padding: 0 30px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  outline: none;
  border: 0;
  letter-spacing: 2px;
  font-weight: 500;

  &:hover {
    background-color: #3a6ff7;
  }
`;

const TableContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-height: 430px;
  margin: ${(props) => props.margin ?? '0 auto'};
  display: flex;
  flex-direction: column;
  justify-content: start;
  background-color: black;
  padding: 40px 100px 80px;
  border-radius: 20px;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
`;

const TableContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: ${({ itemAlign }) => itemAlign ?? 'center'};
`;

const Title = styled.div`
  color: white;
  font-size: 32px;
  font-weight: 500;
`;

const PlanRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
`;

const PlanContentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const PlanTitle = styled.div`
  color: #a4a4a3;
  font-size: 24px;
  font-weight: 500;
  text-align: ${({ textAlign }) => textAlign};
`;

const PlanContent = styled.div`
  color: 'white';
  font-size: 24px;
  font-weight: 500;
  text-align: ${({ textAlign }) => textAlign ?? 'center'};
`;

const SplitLine = styled.hr`
  box-sizing: border-box;
  width: ${(props) => props.width ?? '88%'};
  border: ${(props) => props.border ?? '1px solid #a4a4a3'};
  margin: ${(props) => props.margin};
`;

const SearchBtnWrapper = styled.div`
  width: 690px;
  margin: 50px auto 0;
`;

const RecordRow = styled.div`
  box-sizing: border-box;
  width: 100%;
  background-color: ${(props) => props.backgroundColor};
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 10px 0;
`;

const FixedMenu = styled.div`
  display: flex;
  height: ${(props) => props.height};
  width: 200px;
  box-sizing: border-box;
  background-color: #a4a4a3;
  position: fixed;
  bottom: 100px;
  right: 40px;
  border-radius: 10px;
  flex-direction: column;
  transition: all, 0.5s;
  visibility: ${(props) => props.vilble};
  z-index: 100;
`;

const FixedMenuText = styled.div`
  padding: 30px;
  font-size: 20px;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: #3a6ff7;
  }
`;

const DatePickerWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: end;
  margin: 50px auto 0;
  cursor: pointer;
`;

const questions = {
  intake: [
    { label: 'Carbs', value: 'carbs', type: 'number' },
    { label: 'Protein', value: 'protein', type: 'number' },
    { label: 'Fat', value: 'fat', type: 'number' },
    { label: 'Note', value: 'note', type: 'text' },
  ],
  plans: [
    { label: 'Name', value: 'name', type: 'text' },
    { label: 'Carbs Goal', value: 'carbs', type: 'number' },
    { label: 'Protein Goal', value: 'protein', type: 'number' },
    { label: 'Fat Goal', value: 'fat', type: 'number' },
  ],
};
const recordTitles = ['Nutrition', 'Progress', 'Total', 'Goal', 'Left'];

function handleTimestamp(timestamp) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  const formattedDate = date.toLocaleString().replace(',', '');
  return formattedDate;
}

function HealthDashboard() {
  const { email } = useContext(UserContext);
  const {
    nutritions,
    setNutritions,
    intakeRecords,
    setIntakeRecords,
    setIsLoading,
  } = useContext(HealthContext);
  const [plans, setPlans] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const {
    isAdding,
    setIsAdding,
    isSearching,
    setIsSearching,
    selectedDate,
    setSelectedDate,
    userInput,
    setUserInput,
    setHeaderIcons,
    selectedTask,
    fixedMenuVisible,
    setFixedMenuVisible,
    isAddingPlan,
    setIsAddingPlan,
  } = useContext(StateContext);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [isAddingIntake, setIsAddingIntake] = useState(false);
  const recordTableTitles = [
    'Note',
    'Protein',
    'Carbs',
    'Fat',
    'Time',
    'Delete',
  ];

  async function handleIntakeSubmit(e) {
    e.preventDefault();
    Swal.fire('Saved!', 'New record has been added.', 'success').then(
      (result) => {
        if (result.isConfirmed) {
          handleExit();
          setTimeout(() => {
            addDoc(collection(db, 'Users', email, 'Health-Food'), userInput);
          }, '200');
        }
      }
    );
  }

  function createCsvFile() {
    const csvString = [
      ['note', 'carbs', 'protein', 'fat', 'created_time'],
      ...intakeRecords.map((item) => [
        item.content.note,
        item.content.carbs,
        item.content.protein,
        item.content.fat,
        handleTimestamp(item.content.created_time),
      ]),
    ]
      .map((e) => e.join(','))
      .join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    setFileUrl(url);
  }

  function addIntake() {
    setIsAddingIntake(true);
    setIsSearching(false);
  }

  function addPlan() {
    setIsAddingIntake(false);
    setIsAddingPlan(true);
    setIsSearching(false);
  }

  async function handlePlanSubmit(e) {
    e.preventDefault();
    Swal.fire('Saved!', 'New plan has been created!', 'success')
      .then((res) => {
        const todayDate = new Date().getDate();
        const selectedDateOnly = selectedDate.slice(-1);
        if (res.isConfirmed) {
          addDoc(collection(db, 'Users', email, 'Health-Goal'), {
            ...userInput,
            created_time:
              todayDate === selectedDateOnly
                ? serverTimestamp()
                : new Date(selectedDate),
          });
        }
      })
      .then(() => handleExit());
  }

  function parseTimestamp(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const newDate = date.toLocaleString([], { hour12: false });
    const noSecondsDate = newDate.slice(0, newDate.length - 3);
    return noSecondsDate;
  }

  async function removeRecord(index) {
    const targetDoc = intakeRecords[index].id;
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3a6ff7',
      cancelButtonColor: '#a4a4a3',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Deleted!', 'Your file has been deleted.', 'success').then(
          (res) => {
            if (res.isConfirmed) {
              setTimeout(() => {
                deleteDoc(doc(db, 'Users', email, 'Health-Food', targetDoc));
              }, '200');
            }
          }
        );
      }
    });
  }

  function getNutritionTotal(data) {
    const contents = [];
    data.forEach((obj) => contents.push(obj.content));
    const totals = contents.reduce(
      (acc, cur) => {
        return {
          protein: Number(acc.protein) + Number(cur.protein),
          carbs: Number(acc.carbs) + Number(cur.carbs),
          fat: Number(acc.fat) + Number(cur.fat),
        };
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
    return totals;
  }

  function updateData(rawData) {
    const newData = [...rawData];
    const intakeToday = getNutritionTotal(intakeRecords);
    newData.forEach((data) => {
      const name = data.title.toLowerCase();
      data.total = intakeToday[name];
    });
    return newData;
  }

  function getTimestamp(daysAgo, hr, min, sec, nanosec) {
    const now = new Date();
    now.setDate(now.getDate() - daysAgo);
    now.setHours(hr, min, sec, nanosec);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
  }

  function getFormattedDate(daysAgo) {
    const now = new Date();
    now.setDate(now.getDate() - daysAgo);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    return dateString;
  }

  function getDaysAgo() {
    const today = new Date();
    const inputDate = new Date(selectedDate);
    const timeDiff = today.getDate() - inputDate.getDate();
    return timeDiff;
  }

  function handleExit() {
    setIsAddingPlan(false);
    setIsAdding(false);
    setIsSearching(false);
    setIsLoading(false);
    setFixedMenuVisible(false);
    setUserInput({});
  }

  useEffect(() => {
    const daysAgo = getDaysAgo();
    const startOfToday = getTimestamp(daysAgo, 0, 0, 0, 0);
    const endOfToday = getTimestamp(daysAgo, 23, 59, 59, 59);
    const foodSnap = onSnapshot(
      query(
        collection(db, 'Users', email, 'Health-Food'),
        orderBy('created_time', 'asc'),
        startAfter(startOfToday),
        endBefore(endOfToday)
      ),
      (querySnapshot) => {
        const records = [];
        querySnapshot.forEach((doc) => {
          records.push({ content: doc.data(), id: doc.id });
        });
        setIntakeRecords(records);
      }
    );
    return foodSnap;
  }, [selectedDate]);

  useEffect(() => {
    const goalSnap = onSnapshot(
      collection(db, 'Users', email, 'Health-Goal'),
      (querySnapshot) => {
        const plans = [];
        querySnapshot.forEach((doc) => {
          plans.push({ content: doc.data(), id: doc.id });
        });
        setPlans(plans);
      }
    );

    setHeaderIcons([]);

    function handleEsc(e) {
      if (e.key === 'Escape') {
        handleExit();
      } else if (e.key === 'Shift' && e.ctrlKey) {
        isAdding ? setIsAdding(false) : setIsAdding(true);
        setFixedMenuVisible((prev) => !prev);
      }
      return;
    }

    window.addEventListener('keydown', handleEsc);

    return () => {
      goalSnap();
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isAdding]);

  useEffect(() => {
    if (intakeRecords) {
      createCsvFile();
      setNutritions(updateData(nutritions));
    }
  }, [intakeRecords]);

  useEffect(() => {
    if (plans.length > 0) {
      const clonedNutritions = [...nutritions];
      const selectedPlan = plans[selectedPlanIndex].content;
      clonedNutritions.forEach((nutrition) => {
        const title = nutrition.title.toLowerCase();
        nutrition.goal = selectedPlan[title];
      });
      setNutritions(clonedNutritions);
      updateDoc(doc(db, 'Users', email), {
        currentHealthGoal: plans[selectedPlanIndex].content,
      });
    }
  }, [selectedPlanIndex, plans]);

  useEffect(() => {
    if (selectedTask?.content.created_time) {
      const searchedRecordDate = selectedTask.content.created_time;
      const readableDate = parseTimestamp(searchedRecordDate).slice(0, 8);
      setSelectedDate(readableDate);
    }
  }, [selectedTask]);

  if (!plans) {
    return;
  }
  return (
    <>
      <Mask display={isAddingIntake || isAddingPlan ? 'block' : 'none'} />
      <Wrapper>
        <FixedAddBtn
          onClick={() => {
            setIsAdding(true);
            setFixedMenuVisible((prev) => !prev);
          }}
        />
        <FixedMenu height={fixedMenuVisible ? '170px' : '0'}>
          {fixedMenuVisible ? (
            <>
              <FixedMenuText
                onClick={() => {
                  setIsAdding(false);
                  addPlan();
                }}
              >
                Add Plan
              </FixedMenuText>
              <SplitLine border='1px solid white' width='100%' margin='0' />
              <FixedMenuText
                onClick={() => {
                  setIsAddingPlan(false);
                  addIntake();
                }}
              >
                Add Intake
              </FixedMenuText>
            </>
          ) : null}
        </FixedMenu>
        <DatePickerWrapper>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorText: 'white',
                colorTextPlaceholder: 'white',
              },
            }}
          >
            <DatePicker
              bordered={false}
              size='large'
              picker='date'
              onSelect={(value) => setSelectedDate(value.format('YYYY-MM-DD'))}
            />
          </ConfigProvider>
        </DatePickerWrapper>
        <TableContainer>
          <Header>
            <Title>My Plan</Title>
            <Plans
              onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
            >
              {plans.map((plan, index) => (
                <option key={index} value={index}>
                  {plan.content.name}
                </option>
              ))}
            </Plans>
            <Button
              width='180px'
              height='36px'
              fontSize='16px'
              textAlignment='center'
              margin='0'
              letterSpacing='2px'
            >
              <ExportText href={fileUrl} download='nutrition.csv'>
                Download
              </ExportText>
            </Button>
          </Header>
          <PlanRow>
            {recordTitles.map((record, index) => (
              <PlanTitle
                key={index}
                textAlign={record === 'Nutrition' ? 'start' : 'center'}
              >
                {record}
              </PlanTitle>
            ))}
          </PlanRow>
          <SplitLine width='100%' margin='16px 0 30px' />
          <PlanContentWrapper>
            {nutritions.map((nutrition, index) =>
              nutrition ? (
                <div key={index}>
                  <PlanRow>
                    <PlanContent textAlign='start'>
                      {nutrition.title}
                    </PlanContent>
                    <PlanContent>
                      <ConfigProvider
                        theme={{
                          algorithm: theme.darkAlgorithm,
                        }}
                      >
                        <Progress
                          percent={
                            isNaN(nutrition.total / nutrition.goal)
                              ? 0
                              : (
                                  (nutrition.total / nutrition.goal) *
                                  100
                                ).toFixed()
                          }
                          showInfo
                          trailColor='#a4a4a3'
                          style={{ height: '50px' }}
                          size={[150, 15]}
                        />
                      </ConfigProvider>
                    </PlanContent>
                    <PlanContent>{nutrition.total.toFixed()}</PlanContent>
                    <PlanContent>{nutrition.goal}</PlanContent>
                    <PlanContent>
                      {nutrition.goal > nutrition.total
                        ? (nutrition.goal - nutrition.total).toFixed()
                        : 0}
                    </PlanContent>
                    {/* <ProgressBar
                      value={`${nutrition.total}`}
                      max={`${nutrition.goal}`}
                    /> */}
                  </PlanRow>
                </div>
              ) : null
            )}
          </PlanContentWrapper>
          <PopUp
            display={
              isAddingPlan || (isAddingIntake && !isSearching) ? 'flex' : 'none'
            }
            gridFr='1fr 1fr'
            rowGap='30px'
            btnWidth='690px'
            questions={isAddingPlan ? questions.plans : questions.intake}
            labelWidth={isAddingIntake ? '100px' : '135px'}
            margin='50px auto'
            onChange={isAdding ? 'intake' : null}
            onSubmit={
              isAddingPlan
                ? handlePlanSubmit
                : isAdding
                ? handleIntakeSubmit
                : null
            }
          >
            {isAddingIntake ? (
              <>
                <PopUpTitle height='100px' fontSize='24px' onExit={handleExit}>
                  Add Intake
                </PopUpTitle>
                <SearchBtnWrapper>
                  <Button
                    textAlignment='center'
                    onClick={() => setIsSearching(!isSearching)}
                    type='button'
                    height='50px'
                    fontSize='20px'
                  >
                    Search Food
                  </Button>
                </SearchBtnWrapper>
              </>
            ) : (
              <PopUpTitle height='100px' fontSize='24px' onExit={handleExit}>
                Add Plan
              </PopUpTitle>
            )}
          </PopUp>
        </TableContainer>
        <SearchFood addIntake={setIsAddingIntake} />
        <TableContainer margin='50px auto'>
          <Table width='100%' tableTitles={recordTableTitles} title={'Records'}>
            <SplitLine width='100%' margin='16px 0 0' />
            {intakeRecords.map((record, index) => (
              <RecordRow
                key={index}
                backgroundColor={
                  record.id === selectedTask?.id ? '#3a6ff7' : null
                }
              >
                <TableContent itemAlign='start'>
                  {record.content.note}
                </TableContent>
                <TableContent>{record.content.protein}</TableContent>
                <TableContent>{record.content.carbs}</TableContent>
                <TableContent>{record.content.fat}</TableContent>
                <TableContent>
                  {parseTimestamp(record.content?.created_time)}
                </TableContent>
                <TableContent>
                  <Icon
                    width='30px'
                    imgUrl={trash}
                    onClick={() => {
                      removeRecord(index);
                    }}
                  ></Icon>
                </TableContent>
              </RecordRow>
            ))}
          </Table>
        </TableContainer>
      </Wrapper>
    </>
  );
}

export default HealthDashboard;
