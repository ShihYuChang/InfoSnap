import { ConfigProvider, DatePicker, Progress, theme } from 'antd';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import styled from 'styled-components/macro';
import Button from '../../components/Buttons/Button';
import Icon from '../../components/Icon';
import Mask from '../../components/Mask';
import Table from '../../components/Table';
import PopUpTitle from '../../components/Title/PopUpTitle';
import PopUp from '../../components/layouts/PopUp/PopUp';
import { HealthContext } from '../../context/HealthContext';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { useShortcuts } from '../../hooks/useShortcuts';
import {
  deleteHealthPlan,
  getDailyIntakeRecords,
  getHealthPlan,
  removeHealthRecord,
  storeHealthPlan,
  storeIntake,
  updateCurrentPlan,
  updateHealthPlan,
} from '../../utils/firebase/firebase';
import { parseRegularTimestamp, parseTimestamp } from '../../utils/timestamp';
import SearchFood from './SearchFood';
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
  box-sizing: border-box;
  width: 100%;
  padding: 0 30px;
  margin: 50px 0 0;
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
  min-width: 220px;
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
  padding: 10px;
  cursor: pointer;
  border-radius: 10px;

  &:hover {
    background-color: #3a6ff7;
  }
`;

const HeaderIcon = styled.div`
  color: #a4a4a3;
  display: ${({ display }) => display ?? 'flex'};
  align-items: center;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const popUpQuestions = {
  intake: [
    {
      label: 'Title',
      value: 'note',
      type: 'text',
      errorMessage: '⚠ Please input at least 1 word.',
      displayErrorMessage: false,
    },
    {
      label: 'Carbs',
      value: 'carbs',
      type: 'number',
      displayErrorMessage: false,
    },
    {
      label: 'Protein',
      value: 'protein',
      type: 'number',
      displayErrorMessage: false,
    },
    { label: 'Fat', value: 'fat', type: 'number', displayErrorMessage: false },
  ],
  plans: [
    {
      label: 'Name',
      value: 'name',
      type: 'text',
      errorMessage: '⚠ Please input at least 1 word.',
      displayErrorMessage: false,
      maxLength: 20,
    },
    {
      label: 'Carbs Goal',
      value: 'carbs',
      type: 'number',
      displayErrorMessage: false,
    },
    {
      label: 'Protein Goal',
      value: 'protein',
      type: 'number',
      displayErrorMessage: false,
    },
    {
      label: 'Fat Goal',
      value: 'fat',
      type: 'number',
      displayErrorMessage: false,
    },
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
  const { userInfo } = useContext(UserContext);
  const email = userInfo.email;
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
    isEditing,
    setIsEditing,
    isSearching,
    setIsSearching,
    selectedDate,
    setSelectedDate,
    userInput,
    setUserInput,
    selectedTask,
    fixedMenuVisible,
    setFixedMenuVisible,
    isAddingPlan,
    setIsAddingPlan,
  } = useContext(StateContext);
  const [questions, setQuestions] = useState(popUpQuestions);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [isAddingIntake, setIsAddingIntake] = useState(false);
  const [hasClickTitle, setHasClickTitle] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const recordTableTitles = [
    'Title',
    'Carbs',
    'Protein',
    'Fat',
    'Time',
    'Delete',
  ];

  const shortcuts = {
    Escape: handleExit,
    n: (e) => {
      if (e.ctrlKey) {
        addPlan();
      }
    },
    '=': (e) => {
      if (e.ctrlKey) {
        addIntake();
      }
    },
    e: (e) => {
      if (e.ctrlKey) {
        editPlan();
      }
    },
  };

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
    setIsEditing(true);
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
    setIsEditing(true);
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
      setIsEditing(false);
    }
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

  function getDaysAgo() {
    const today = new Date();
    const inputDate = new Date(selectedDate);
    const timeDiff = today.getDate() - inputDate.getDate();
    return timeDiff;
  }

  function handleExit() {
    setIsAddingPlan(false);
    setIsEditing(false);
    setIsAddingIntake(false);
    setIsSearching(false);
    setIsLoading(false);
    setFixedMenuVisible(false);
    setHasClickTitle(false);
    setIsEditingPlan(false);
    setQuestions(popUpQuestions);
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
    setIsEditing(true);
  }

  function updateNutritions() {
    const clonedNutritions = [...nutritions];
    const selectedPlan = plans[selectedPlanIndex].content;
    clonedNutritions.forEach((nutrition) => {
      const title = nutrition.title.toLowerCase();
      nutrition.goal = selectedPlan[title];
    });
    setNutritions(clonedNutritions);
  }

  function handleIntakeSubmit(e) {
    e.preventDefault();
    const questions = JSON.parse(JSON.stringify(popUpQuestions));
    if (userInput.note.trim() === '') {
      questions.intake[0].displayErrorMessage = true;
      setQuestions(questions);
      return;
    }
    setQuestions(popUpQuestions);
    const today = parseRegularTimestamp(new Date(), 'YYYY-MM-DD');
    const created_time =
      selectedDate === today ? new Date() : new Date(selectedDate);
    storeIntake(e, userInput, created_time, email, handleExit);
  }

  function handlePlanEdit(e) {
    e.preventDefault();
    const questions = JSON.parse(JSON.stringify(popUpQuestions));
    if (userInput.name.trim() === '') {
      questions.plans[0].displayErrorMessage = true;
      setQuestions(questions);
      return;
    }
    setQuestions(popUpQuestions);
    updateHealthPlan(e, userInput, plans[selectedPlanIndex].id, email);
    handleExit();
  }

  useShortcuts(shortcuts);

  useEffect(() => {
    const daysAgo = getDaysAgo();
    getDailyIntakeRecords(daysAgo, email, setIntakeRecords);
  }, [selectedDate]);

  useEffect(() => {
    getHealthPlan(email, setPlans);
  }, [isEditing]);

  useEffect(() => {
    if (intakeRecords) {
      createCsvFile();
      setNutritions(updateData(nutritions));
    }
  }, [intakeRecords]);

  useEffect(() => {
    if (plans.length > 0) {
      const currentPlan = plans[selectedPlanIndex].content;
      updateCurrentPlan(currentPlan, email);
      updateNutritions();
    }
  }, [selectedPlanIndex, plans]);

  useEffect(() => {
    if (selectedTask?.content.created_time) {
      const searchedRecordDate = selectedTask.content.created_time;
      const readableDate = parseTimestamp(searchedRecordDate, 'YYYY-MM-DD');
      setSelectedDate(readableDate);
      // const selectedTaskNode = document.getElementById(`${selectedTask.id}`);
      // selectedTaskNode.scrollIntoView({
      //   behavior: 'smooth',
      //   block: 'nearest',
      //   inline: 'nearest',
      // });
    }
  }, [selectedTask]);

  useEffect(() => {
    if (isEditingPlan) {
      const currentPlan = plans[selectedPlanIndex].content;
      setUserInput({
        carbs: `${currentPlan.carbs}`,
        protein: `${currentPlan.protein}`,
        fat: `${currentPlan.fat}`,
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
      <Mask display={isEditing ? 'block' : 'none'} />
      <Wrapper>
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
          <Header>
            <TitleWrapper>
              <Title onClick={() => setHasClickTitle((prev) => !prev)}>
                {plans.length > 0
                  ? plans[selectedPlanIndex].content.name
                  : null}
                <TitleArrow>
                  <IoIosArrowDown size={20} />
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
              onSubmit={(e) => handlePlanEdit(e)}
            >
              <PopUpTitle height='100px' fontSize='24px' onExit={handleExit}>
                Edit Plan
              </PopUpTitle>
            </PopUp>
            <HeaderIcon tabIndex='-1'>
              <FaEdit size={30} onClick={editPlan} />
            </HeaderIcon>
            <HeaderIcon tabIndex='-1' display={plans.length <= 1 && 'none'}>
              <FaTrash
                size={30}
                onClick={() =>
                  deleteHealthPlan(plans[selectedPlanIndex].id, email)
                }
              />
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
            onChange={isEditing ? 'intake' : null}
            onSubmit={
              isAddingPlan
                ? (e) =>
                    storeHealthPlan(
                      e,
                      userInput,
                      selectedDate,
                      email,
                      handleExit
                    )
                : isEditing
                ? (e) => handleIntakeSubmit(e)
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
            onClick={addIntake}
          >
            <SplitLine width='100%' margin='16px 0 0' />
            {intakeRecords.map((record, index) => (
              <RecordRow
                key={index}
                backgroundColor={
                  record.id === selectedTask?.id ? '#3a6ff7' : null
                }
                id={record.id}
              >
                <TableContent itemAlign='start'>
                  {record.content.note}
                </TableContent>
                <TableContent>{record.content.carbs}</TableContent>
                <TableContent>{record.content.protein}</TableContent>
                <TableContent>{record.content.fat}</TableContent>
                <TableContent>
                  {parseTimestamp(
                    record.content?.created_time,
                    'YYYY-MM-DD HH:mm'
                  )}
                </TableContent>
                <TableContent>
                  <Icon
                    width='30px'
                    imgUrl={trash}
                    onClick={() =>
                      removeHealthRecord(intakeRecords[index].id, email)
                    }
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
