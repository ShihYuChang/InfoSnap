import { ConfigProvider, DatePicker, Progress, theme } from 'antd';
import dayjs from 'dayjs';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  endBefore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import styled from 'styled-components/macro';
import Swal from 'sweetalert2';
import Button from '../../components/Buttons/Button';
import Icon from '../../components/Icon';
import Mask from '../../components/Mask';
import Table from '../../components/Table/Table';
import PopUpTitle from '../../components/Title/PopUpTitle';
import PopUp from '../../components/layouts/PopUp/PopUp';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { db } from '../../utils/firebase';
import SearchFood from './SearchFood';
import { HealthContext } from './healthContext';
import trash from './img/trash-can.png';

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

const TitleWrapper = styled.div`
  position: relative;
`;

const Title = styled.div`
  box-sizing: border-box;
  padding-right: 50px;
  height: 50px;
  color: white;
  font-size: 32px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  /* border-bottom: 2px solid white; */
`;

const TitleArrow = styled.div`
  color: white;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(-50%, -50%);
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

const PlanWrapper = styled.div`
  display: ${({ display }) => display};
  flex-direction: column;
  width: 220px;
  background-color: #a4a4a3;
  border-radius: 10px;
  height: ${({ height }) => height};
  position: absolute;
  top: 53px;
  left: 0;
  z-index: 10;
`;

const Plan = styled.div`
  box-sizing: border-box;
  width: 100%;
  text-align: center;
  font-size: 16px;
  padding: 10px 0;
  cursor: pointer;
  border-radius: 10px;

  &:hover {
    background-color: #3a6ff7;
  }
`;

const HeaderIcon = styled.div`
  color: #a4a4a3;
  display: flex;
  align-items: center;
  cursor: pointer;

  &:focus {
    outline: none;
  }
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
  const [hasClickTitle, setHasClickTitle] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
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
    setIsAdding(true);
    setUserInput({
      note: '',
      carbs: 0,
      protein: 0,
      fat: 0,
    });
  }

  function addPlan() {
    setUserInput({
      name: '',
      carbs: 0,
      protein: 0,
      fat: 0,
    });
    setIsAdding(true);
    setIsAddingIntake(false);
    setIsAddingPlan(true);
    setIsSearching(false);
  }

  function handleWindowClick(e) {
    if (hasClickTitle) {
      setHasClickTitle(false);
    } else if (
      fixedMenuVisible &&
      e.target.innerHTML !== 'Add Intake' &&
      e.target.innerHTML !== 'Add Plan'
    ) {
      setFixedMenuVisible(false);
      setIsAdding(false);
    }
  }

  async function updatePlan(e) {
    e.preventDefault();
    const newPlan = { ...userInput };
    const targetId = plans[selectedPlanIndex].id;
    await updateDoc(doc(db, 'Users', email, 'Health-Goal', targetId), newPlan);
    Swal.fire('Updated!', 'Plan has been updated', 'success').then(() =>
      handleExit()
    );
  }

  async function deletePlan() {
    const targetId = plans[selectedPlanIndex].id;
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3a6ff7',
      cancelButtonColor: '#a4a4a3',
      confirmButtonText: 'Yes, delete it!',
    })
      .then((result) => {
        if (result.isConfirmed) {
          deleteDoc(doc(db, 'Users', email, 'Health-Goal', targetId));
        }
      })
      .then(() =>
        Swal.fire('Deleted!', 'The plan has been deleted', 'success')
      );
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

  function getDaysAgo() {
    const today = new Date();
    const inputDate = new Date(selectedDate);
    const timeDiff = today.getDate() - inputDate.getDate();
    return timeDiff;
  }

  function handleExit() {
    setIsAddingPlan(false);
    setIsAdding(false);
    setIsAddingIntake(false);
    setIsSearching(false);
    setIsLoading(false);
    setFixedMenuVisible(false);
    setHasClickTitle(false);
    setIsEditingPlan(false);
  }

  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const date = year + '-' + month + '-' + day;
    return date;
  }

  function editPlan() {
    setIsEditingPlan(true);
    setIsAdding(true);
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

    function handleKeyDown(e) {
      switch (e.key) {
        case 'Escape':
          handleExit();
          break;
        case 'n':
          if (e.ctrlKey) {
            addPlan();
          }
          break;
        case '=':
          if (e.ctrlKey) {
            addIntake();
          }
          break;
        case 'e':
          if (e.ctrlKey) {
            editPlan();
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      goalSnap();
      window.removeEventListener('keydown', handleKeyDown);
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

  useEffect(() => {
    if (isEditingPlan) {
      const currentPlan = plans[selectedPlanIndex].content;
      setUserInput({
        carbs: currentPlan.carbs,
        protein: currentPlan.protein,
        fat: currentPlan.fat,
        name: currentPlan.name,
      });
    }
  }, [isEditingPlan]);

  if (!plans) {
    return;
  }
  return (
    <div
      onClick={(e) => {
        handleWindowClick(e);
      }}
    >
      <Mask display={isAdding ? 'block' : 'none'} />
      <Wrapper>
        {/* <FixedAddBtn
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
        </FixedMenu> */}
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
              defaultValue={dayjs(getTodayDate())}
              bordered={false}
              size='large'
              picker='date'
              onSelect={(value) => setSelectedDate(value.format('YYYY-MM-DD'))}
              tabIndex='-1'
            />
          </ConfigProvider>
        </DatePickerWrapper>
        <TableContainer>
          {/* <ContainerTitle>Progress</ContainerTitle> */}
          <Header>
            <TitleWrapper>
              <Title onClick={() => setHasClickTitle((prev) => !prev)}>
                {plans.length > 0
                  ? plans[selectedPlanIndex].content.name
                  : null}
                <TitleArrow>
                  <IoIosArrowDown size={15} />
                </TitleArrow>
              </Title>
              <PlanWrapper display={hasClickTitle ? 'flex' : 'none'}>
                {plans?.map((plan, index) => (
                  <div key={index}>
                    <Plan
                      onClick={() => {
                        setSelectedPlanIndex(index);
                        setHasClickTitle(false);
                      }}
                    >
                      {plan.content.name}
                    </Plan>
                  </div>
                ))}
              </PlanWrapper>
            </TitleWrapper>
            <PopUp
              display={isEditingPlan ? 'block' : 'none'}
              questions={questions.plans}
              gridFr='1fr 1fr'
              rowGap='30px'
              labelWidth='135px'
              margin='50px auto'
              onSubmit={updatePlan}
            >
              <PopUpTitle height='100px' fontSize='24px' onExit={handleExit}>
                Edit Plan
              </PopUpTitle>
            </PopUp>
            <HeaderIcon tabIndex='-1'>
              <FaEdit size={30} onClick={editPlan} tabIndex='-1' />
            </HeaderIcon>
            <HeaderIcon tabIndex='-1'>
              <FaTrash size={30} onClick={() => deletePlan()} />
            </HeaderIcon>
            <HeaderIcon tabIndex='-1'>
              <FaPlus size={30} onClick={addPlan} />
            </HeaderIcon>
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
          <Table
            width='100%'
            tableTitles={recordTableTitles}
            title={'Records'}
            fileUrl={fileUrl}
            addIntake={addIntake}
          >
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
    </div>
  );
}

export default HealthDashboard;
