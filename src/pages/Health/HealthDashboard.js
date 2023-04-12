import { db } from '../../firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  Timestamp,
  deleteDoc,
  orderBy,
  startAfter,
  endBefore,
} from 'firebase/firestore';
import { useEffect, useState, useContext } from 'react';
import { StateContext } from '../../context/stateContext';
import styled from 'styled-components/macro';
import SearchFood from '../../components/SearchFood/SearchFood';
import Mask from '../../components/Mask';
import Exit from '../../components/Buttons/Exit';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: 'flex';
  flex-direction: 'column';
  gap: '20px';
  align-items: 'center';
`;

const Form = styled.form`
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

const QuestionTitle = styled.label`
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
  width: 80%;
  height: 40px;
`;

const Header = styled.div`
  width: 80%;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
`;

const Tab = styled.h3`
  width: 80px;
`;

const Button = styled.button`
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
  width: 100px;
  height: 30px;
  background-color: white;
  margin-right: auto;
`;

const RecordsContainer = styled.div`
  width: 1000px;
  min-height: 200px;
  margin: 50px auto;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
`;

const FoodImg = styled.div`
  width: 50px;
  height: 50px;
  background-image: url(${(props) => props.imgUrl});
  background-size: contain;
`;

const initialNutrition = [
  { title: 'Protein', total: 0, goal: 170 },
  { title: 'Carbs', total: 0, goal: 347 },
  { title: 'Fat', total: 0, goal: 69 },
];
const questions = ['carbs', 'protein', 'fat', 'note'];
const recordTitles = ['My Plan', 'Total', 'Goal', 'Left'];
const planQuestions = [
  { label: 'Name', value: 'name' },
  { label: 'Carbs Goal', value: 'carbs' },
  { label: 'Protein Goal', value: 'protein' },
  { label: 'Fat Goal', value: 'fat' },
];

function handleTimestamp(timestamp) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  const formattedDate = date.toLocaleString().replace(',', '');
  return formattedDate;
}

function HealthDashboard() {
  const [nutritions, setNutritions] = useState(initialNutrition);
  const [intakeRecords, setIntakeRecords] = useState([]);
  const [plans, setPlans] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const [userInput, setUserInput] = useState({});
  const [planInput, setPlanInput] = useState({});
  const { isAdding, isSearching, setIsAdding, setIsSearching } =
    useContext(StateContext);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(getFormattedDate(0));

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
    await addDoc(
      collection(db, 'Users', 'sam21323@gmail.com', 'Health-Food'),
      userInput
    );
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

  function handlePlanInput(e, key) {
    const addedPlan = {
      ...planInput,
      [key]: e.target.value,
    };
    setPlanInput(addedPlan);
  }

  async function handlePlanSubmit(e) {
    e.preventDefault();
    await addDoc(
      collection(db, 'Users', 'sam21323@gmail.com', 'Health-Goal'),
      planInput
    );
    setIsAddingPlan(false);
    alert('Plan Created!');
  }

  function parseTimestamp(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const formattedDate = date.toLocaleString();
    return formattedDate;
  }

  async function removeRecord(index) {
    const targetDoc = intakeRecords[index].id;
    await deleteDoc(
      doc(db, 'Users', 'sam21323@gmail.com', 'Health-Food', targetDoc)
    );
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

  function selectDate(e) {
    setSelectedDate(e.target.value);
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
        collection(db, 'Users', 'sam21323@gmail.com', 'Health-Food'),
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
      collection(db, 'Users', 'sam21323@gmail.com', 'Health-Goal'),
      (querySnapshot) => {
        const plans = [];
        querySnapshot.forEach((doc) => {
          plans.push({ content: doc.data(), id: doc.id });
        });
        setPlans(plans);
      }
    );
    return goalSnap;
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
    }
  }, [selectedPlanIndex, plans]);

  if (!plans) {
    return;
  }
  return (
    <>
      <Mask display={isAdding || isAddingPlan ? 'block' : 'none'} />
      <Wrapper>
        <MainContainer>
          <Header>
            <Tab>Health</Tab>
            <Button onClick={addPlan}>Add Plans</Button>
            <Button onClick={addIntake}>Add Intake</Button>
            <Button>
              <ExportText href={fileUrl} download='nutrition.csv'>
                Export CSV
              </ExportText>
            </Button>
            <Plans
              onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
            >
              {plans.map((plan, index) => (
                <option key={index} value={index}>
                  {plan.content.name}
                </option>
              ))}
            </Plans>
            <DateInput type='date' onChange={selectDate} value={selectedDate} />
          </Header>
          <FormContainer>
            <Form
              id='addPlan'
              display={isAddingPlan ? 'flex' : 'none'}
              onSubmit={handlePlanSubmit}
            >
              {planQuestions.map((question, index) => (
                <Question key={index}>
                  <QuestionTitle>{question.label}</QuestionTitle>
                  <QuestionInput
                    name={question.value}
                    onChange={(e) => handlePlanInput(e, question.value)}
                    type={question.value !== 'name' && 'number'}
                    required
                  />
                </Question>
              ))}
              <SubmitBtn type='submit'>Submit</SubmitBtn>
              <Exit
                top='20px'
                right='30px'
                handleClick={() => {
                  setIsAddingPlan(false);
                }}
                display={isAddingPlan ? 'block' : 'none'}
              >
                X
              </Exit>
            </Form>
          </FormContainer>
          <DataTable>
            <TitleTable>
              <Row>
                {recordTitles.map((title, index) => (
                  <Item key={index} fontSize='20px' fontWeight={800}>
                    {title}
                  </Item>
                ))}
              </Row>
            </TitleTable>
            {nutritions.map((nutrition, index) =>
              nutrition ? (
                <Nutrition key={index}>
                  <Row>
                    <Item fontSize='20px'>{nutrition.title}</Item>
                    <Item fontSize='20px'>{nutrition.total.toFixed(2)}</Item>
                    <Item fontSize='20px'>{nutrition.goal}</Item>
                    <Item fontSize='20px'>
                      {nutrition.goal > nutrition.total
                        ? (nutrition.goal - nutrition.total).toFixed(2)
                        : 0}
                    </Item>
                  </Row>
                  <ProgressBar
                    value={`${nutrition.total}`}
                    max={`${nutrition.goal}`}
                  ></ProgressBar>
                </Nutrition>
              ) : null
            )}
          </DataTable>
        </MainContainer>
        <SearchFood />
        <FormContainer>
          <Form
            id='addIntake'
            onSubmit={handleSubmit}
            display={isSearching ? 'none' : isAdding ? 'flex' : 'none'}
          >
            <Button
              onClick={() => {
                setIsSearching(!isSearching);
              }}
              type='button'
            >
              Search Food
            </Button>
            {questions.map((question, index) => (
              <Question key={index}>
                <QuestionTitle>{question}</QuestionTitle>
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
          </Form>
        </FormContainer>
        <RecordsContainer>
          <DataTable>
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
                  {/* <FoodImg imgUrl={record.imgUrl} /> */}
                  <RecordTd>{record.content.protein}</RecordTd>
                  <RecordTd>{record.content.carbs}</RecordTd>
                  <RecordTd>{record.content.fat}</RecordTd>
                  <RecordTd>
                    {parseTimestamp(record.content.created_time)}
                  </RecordTd>
                </Row>
              ))}
            </RecordTable>
          </DataTable>
        </RecordsContainer>
      </Wrapper>
    </>
  );
}

export default HealthDashboard;
