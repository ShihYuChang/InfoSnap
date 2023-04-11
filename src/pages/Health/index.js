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
} from 'firebase/firestore';
import { useEffect, useState, useContext } from 'react';
import { StateContext } from '../../context/stateContext';
import styled from 'styled-components/macro';
import SearchFood from '../../components/SearchFood/SearchFood';
import Mask from '../../components/Mask';

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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

const RowContent = styled.div``;

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
`;

const FormContainer = styled.div``;

const Exit = styled.h3`
  position: absolute;
  top: 7%;
  left: 68%;
  z-index: 200;
  cursor: pointer;
  display: ${(props) => props.display};
`;

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

function Health() {
  const [nutritions, setNutritions] = useState(initialNutrition);
  const [intakeRecords, setIntakeRecords] = useState([]);
  const [plans, setPlans] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const [userInput, setUserInput] = useState({});
  const [planInput, setPlanInput] = useState({});
  const { isAdding, isSearching, setIsAdding, setIsSearching } =
    useContext(StateContext);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);

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

  useEffect(() => {
    const foodSnap = onSnapshot(
      collection(db, 'Users', 'sam21323@gmail.com', 'Health-Food'),
      (querySnapshot) => {
        const records = [];
        querySnapshot.forEach((doc) => {
          records.push({ content: doc.data(), id: doc.id });
        });
        setIntakeRecords(records);
      }
    );
    return foodSnap;
  }, []);

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

  useEffect(() => {
    if (intakeRecords) {
      createCsvFile();
      setNutritions(updateData(nutritions));
    }
  }, [intakeRecords]);

  useEffect(() => {
    const clonedNutritions = [...nutritions];
    const selectedPlan = plans[selectedPlanIndex].content;
    clonedNutritions.forEach((nutrition) => {
      const title = nutrition.title.toLowerCase();
      nutrition.goal = selectedPlan[title];
    });
    setNutritions(clonedNutritions);
  }, [selectedPlanIndex]);

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
              {plans.map((plan, index) =>
                plan ? (
                  <option key={index} value={index}>
                    {plan.content.name}
                  </option>
                ) : null
              )}
            </Plans>
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
            </Form>
            <Exit
              onClick={() => {
                setIsAddingPlan(false);
              }}
              display={isAddingPlan ? 'block' : 'none'}
            >
              X
            </Exit>
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
                    <Item fontSize='20px'>{nutrition.total}</Item>
                    <Item fontSize='20px'>{nutrition.goal}</Item>
                    <Item fontSize='20px'>
                      {nutrition.goal > nutrition.total
                        ? nutrition.goal - nutrition.total
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
          </Form>
          <Exit
            display={isAdding ? 'block' : 'none'}
            onClick={() => {
              setIsAdding(false);
              setIsSearching(false);
            }}
          >
            X
          </Exit>
        </FormContainer>
        <MainContainer>
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
        </MainContainer>
      </Wrapper>
    </>
  );
}

export default Health;
