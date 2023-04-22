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
import { useEffect, useState, useContext } from 'react';
import { HealthContext } from './healthContext';
import { StateContext } from '../../context/stateContext';
import { UserContext } from '../../context/userContext';
import styled from 'styled-components/macro';
import SearchFood from './SearchFood';
import Mask from '../../components/Mask';
import PopUp from '../../components/layouts/PopUp/PopUp';
import Table from '../../components/Table/Table';
import Button from '../../components/Buttons/Button';
import trash from './img/trash-can.png';
import Icon from '../../components/Icon';

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: 'flex';
  flex-direction: 'column';
  gap: '20px';
  align-items: 'center';
`;

const PopUpWindow = styled.form`
  width: 800px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: absolute;
  z-index: 100;
  background-color: white;
  top: 15%;
  left: 50%;
  transform: translate(-50%, 0);
  height: 400px;
  display: ${(props) => props.display};
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const QuestionLabel = styled.label`
  width: 150px;
  font-size: 20px;
`;

const QuestionInput = styled.input`
  width: 150px;
  height: 20px;
`;

const SubmitBtn = styled.button`
  width: 100px;
  height: 50px;
`;

const MainContainer = styled.div`
  width: 1000px;
  height: 500px;
  margin: 50px auto;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const DataTable = styled.table`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Row = styled.tr`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 50px;
`;

const Item = styled.td`
  font-size: ${(props) => props.fontSize};
  font-weight: ${(props) => props.fontWeight};
`;

const Nutrition = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProgressBar = styled.progress`
  width: 100%;
  height: 40px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 50px;
  margin-bottom: 50px;
`;

const Tab = styled.h3`
  width: 80px;
`;

const TempButton = styled.button`
  width: 120px;
  height: 30px;
  background-color: black;
  color: white;
  cursor: pointer;
  margin-right: ${(props) => props.marginRight};
`;

const DateInput = styled.input`
  width: 110px;
  height: 30px;
  cursor: pointer;
  font-size: 14px;
`;

const FormContainer = styled.div``;

const ExportText = styled.a`
  color: white;
  text-decoration: none;
`;

const RecordTd = styled.td`
  width: 80px;
`;

const RemoveBtn = styled.button`
  background: none;
  border: 0;
  width: 20px;
  cursor: pointer;
`;

const RecordTable = styled.tbody`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TitleTable = styled.thead`
  width: 100%;
`;

const Plans = styled.select`
  height: 36px;
  background-color: #a4a4a3;
  color: white;
  font-size: 20px;
  padding: 0 30px;
  margin-right: auto;
  border-radius: 10px;
  text-align: center;
  font-weight: 800;
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: #3a6ff7;
  }
`;

const TableContainer = styled.div`
  width: 90%;
  min-height: 200px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  background-color: black;
  padding: 40px;
`;

const FoodImg = styled.div`
  width: 50px;
  height: 50px;
  background-image: url(${(props) => props.imgUrl});
  background-size: contain;
`;

const TabelContent = styled.td`
  width: 100px;
`;

const Title = styled.div`
  color: white;
  font-size: 32px;
  font-weight: 800;
`;

const PlanRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
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
`;

const PlanContent = styled.div`
  color: 'white';
  font-size: 24px;
  font-weight: 500;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: 1px solid #a4a4a3;
  margin: ${(props) => props.margin};
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
const recordTitles = ['Nutrition', 'Total', 'Goal', 'Left'];

function handleTimestamp(timestamp) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  const formattedDate = date.toLocaleString().replace(',', '');
  return formattedDate;
}

function HealthDashboard() {
  const { email } = useContext(UserContext);
  const { nutritions, setNutritions, intakeRecords, setIntakeRecords } =
    useContext(HealthContext);
  // const [intakeRecords, setIntakeRecords] = useState([]);
  const [plans, setPlans] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  // const [userInput, setUserInput] = useState({});
  const {
    isAdding,
    isSearching,
    setIsAdding,
    setIsSearching,
    selectedDate,
    userInput,
    setUserInput,
  } = useContext(StateContext);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const recordTableTitles = [
    'Note',
    'Protein',
    'Carbs',
    'Fat',
    'Time',
    'Delete',
    // { label: 'Note', value: 'note' },
    // { label: 'Protein', value: 'protein' },
    // { label: 'Carbs', value: 'carbs' },
    // { label: 'Fat', value: 'fat' },
    // { label: 'Time', value: 'creaeted_time' },
  ];
  const headerButtons = [
    { label: 'Add Plan', onClick: addPlan },
    { label: 'Add Intake', onClick: addIntake },
    { label: 'Download' },
  ];

  // console.log(userInput);

  function handleInput(e, label) {
    const now = new Date();
    const addedData =
      e.target.name === 'note'
        ? {
            ...userInput,
            [label]: e.target.value,
            created_time: new Timestamp(
              now.getTime() / 1000,
              now.getMilliseconds() * 1000
            ),
          }
        : {
            ...userInput,
            [label]: Number(e.target.value),
            created_time: new Timestamp(
              now.getTime() / 1000,
              now.getMilliseconds() * 1000
            ),
          };
    setUserInput(addedData);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await addDoc(collection(db, 'Users', email, 'Health-Food'), userInput);
    setIsAdding(false);
    alert('Saved!');
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
    setIsAdding(true);
  }

  function addPlan() {
    setIsAddingPlan(true);
  }

  async function handlePlanSubmit(e) {
    e.preventDefault();
    await addDoc(collection(db, 'Users', email, 'Health-Goal'), {
      ...userInput,
      created_time: serverTimestamp(),
    });
    setIsAddingPlan(false);
    alert('Plan Created!');
    setUserInput({});
  }

  function parseTimestamp(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const newDate = date.toLocaleString();
    const now = new Date(newDate);
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}`;
    return formattedDate;
  }

  async function removeRecord(index) {
    const targetDoc = intakeRecords[index].id;
    await deleteDoc(doc(db, 'Users', email, 'Health-Food', targetDoc));
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
    function handleExit(e) {
      if (e.key === 'Escape') {
        setIsAddingPlan(false);
        setIsAdding(false);
        setIsSearching(false);
      }
      return;
    }
    window.addEventListener('keydown', handleExit);

    return () => {
      goalSnap();
      window.removeEventListener('keydown', handleExit);
    };
  }, []);

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

  if (!plans) {
    return;
  }
  return (
    <>
      <Mask display={isAdding || isAddingPlan ? 'block' : 'none'} />
      <Wrapper>
        <TableContainer>
          <Header>
            <Title>My Plan</Title>
            {headerButtons.map((button, index) => (
              <Button
                width
                height='36px'
                fontSize='20px'
                padding='0 30px'
                onClick={button.onClick}
                key={index}
              >
                {button.label === 'Download' ? (
                  <ExportText href={fileUrl} download='nutrition.csv'>
                    Download
                  </ExportText>
                ) : (
                  button.label
                )}
              </Button>
            ))}
            <Plans
              onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
            >
              {plans.map((plan, index) => (
                <option key={index} value={index}>
                  {plan.content.name}
                </option>
              ))}
            </Plans>
          </Header>
          <PlanRow>
            {recordTitles.map((record, index) => (
              <PlanTitle key={index}>{record}</PlanTitle>
            ))}
          </PlanRow>
          <SplitLine margin='16px 0 30px 0' />
          <PlanContentWrapper>
            {nutritions.map((nutrition, index) =>
              nutrition ? (
                <>
                  <PlanRow>
                    <PlanContent>{nutrition.title}</PlanContent>
                    <PlanContent>{nutrition.total.toFixed(2)}</PlanContent>
                    <PlanContent>{nutrition.goal}</PlanContent>
                    <PlanContent>
                      {nutrition.goal > nutrition.total
                        ? (nutrition.goal - nutrition.total).toFixed(2)
                        : 0}
                    </PlanContent>
                  </PlanRow>
                  <ProgressBar
                    value={`${nutrition.total}`}
                    max={`${nutrition.goal}`}
                  />
                </>
              ) : null
            )}
          </PlanContentWrapper>
          <PopUp
            display={isAddingPlan || isAdding ? 'flex' : 'none'}
            questions={
              isAddingPlan
                ? questions.plans
                : isAdding
                ? questions.intake
                : null
            }
            labelWidth='250px'
            onChange={isAdding ? 'intake' : null}
            onSubmit={
              isAddingPlan ? handlePlanSubmit : isAdding ? handleSubmit : null
            }
          />
        </TableContainer>
        <SearchFood />
        {/* <FormContainer>
          <PopUpWindow
            id='addIntake'
            onSubmit={handleSubmit}
            display={isSearching ? 'none' : isAdding ? 'flex' : 'none'}
          >
            <TempButton
              onClick={() => {
                setIsSearching(!isSearching);
              }}
              type='button'
            >
              Search Food
            </TempButton>
            {questions.intake.map((question, index) => (
              <Question key={index}>
                <QuestionLabel>{question}</QuestionLabel>
                <QuestionInput
                  type={question === 'note' ? 'text' : 'number'}
                  onChange={(e) => {
                    handleInput(e, question);
                  }}
                  name={question}
                  required
                />
              </Question>
            ))}
            <SubmitBtn>Submit</SubmitBtn>
            <Exit
              top='20px'
              right='30px'
              display={isAdding ? 'block' : 'none'}
              handleClick={() => {
                setIsAdding(false);
                setIsSearching(false);
              }}
            >
              X
            </Exit>
          </PopUpWindow>
        </FormContainer> */}
        <TableContainer>
          <Table width='100%' tableTitles={recordTableTitles} title={'Records'}>
            {intakeRecords.map((record, index) => (
              <tr key={index}>
                <TabelContent>{record.content.note}</TabelContent>
                <TabelContent>{record.content.protein}</TabelContent>
                <TabelContent>{record.content.carbs}</TabelContent>
                <TabelContent>{record.content.fat}</TabelContent>
                <TabelContent>
                  {parseTimestamp(record.content.created_time)}
                </TabelContent>
                <TabelContent>
                  <Icon
                    width='30px'
                    imgUrl={trash}
                    onClick={() => {
                      removeRecord(index);
                    }}
                  ></Icon>
                </TabelContent>
              </tr>
            ))}
          </Table>

          {/* <DataTable>
            <thead style={{ width: '100%' }}>
              <Row>
                <RemoveBtn></RemoveBtn>
                <RecordTd>Note</RecordTd>
                <RecordTd>Protein</RecordTd>
                <RecordTd>Carbs</RecordTd>
                <RecordTd>Fat</RecordTd>
                <RecordTd>Time</RecordTd>
              </Row>
            </thead>
            <RecordTable>
              {intakeRecords.map((record, index) => (
                <Row key={index}>
                  <RemoveBtn onClick={() => removeRecord(index)}>X</RemoveBtn>
                  <RecordTd>{record.content.note}</RecordTd>
                  <RecordTd>{record.content.protein}</RecordTd>
                  <RecordTd>{record.content.carbs}</RecordTd>
                  <RecordTd>{record.content.fat}</RecordTd>
                  <RecordTd>
                    {parseTimestamp(record.content.created_time)}
                  </RecordTd>
                </Row>
              ))}
            </RecordTable>
          </DataTable> */}
        </TableContainer>
      </Wrapper>
    </>
  );
}

export default HealthDashboard;
