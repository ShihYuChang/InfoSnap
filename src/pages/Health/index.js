import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useState, useContext } from 'react';
import { StateContext } from '../../context/stateContext';
import styled from 'styled-components/macro';
import SearchFood from '../../components/SearchFood/SearchFood';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: 'flex';
  flex-direction: 'column';
  gap: '20px';
  align-items: 'center';
`;

const Mask = styled.div`
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 1;
  position: fixed;
  top: 0;
  display: ${(props) => props.display};
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
  top: 25%;
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
  width: 100px;
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

const MainContainer = styled.table`
  width: 800px;
  height: 500px;
  margin: 50px auto;
  border: 1px solid black;
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

const nutritions = [
  { title: 'Protein', total: 50, goal: 170, left: 100 },
  { title: 'Carbs', total: 300, goal: 347, left: 47 },
  { title: 'Fat', total: 69, goal: 69, left: 0 },
];
const questions = ['carbs', 'protein', 'fat', 'note'];
const titles = ['My Plan', 'Total', 'Goal', 'Left'];

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userRef = collection(db, 'Users');
const userDocRef = doc(userRef, 'sam21323@gmail.com');
const healthFoodRef = collection(userDocRef, 'Health-Food');

function handleTimestamp(timestamp) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  const formattedDate = date.toLocaleString().replace(',', '');
  return formattedDate;
}

function Health() {
  const [data, setData] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const [userInput, setUserInput] = useState({});
  const [hasSubmit, setHasSubmit] = useState(false);
  const [dataIsStored, setDataIsStored] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { isSearching, setIsSearching } = useContext(StateContext);

  function getDbData() {
    getDocs(healthFoodRef)
      .then((querySnapshot) => {
        const records = [];
        querySnapshot.forEach((doc) => {
          records.push(doc.data());
        });
        setData(records);
      })
      .catch((error) => {
        console.error('Error getting documents:', error);
      });
  }

  function handleInput(e, label) {
    const addedData =
      e.target.name === 'note'
        ? {
            ...userInput,
            [label]: e.target.value,
            created_time: serverTimestamp(),
          }
        : {
            ...userInput,
            [label]: Number(e.target.value),
            created_time: serverTimestamp(),
          };
    setUserInput(addedData);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await addDoc(
      collection(db, 'Users', 'sam21323@gmail.com', 'Health-Food'),
      userInput
    );
    setHasSubmit(!hasSubmit);
    alert('Saved!');
  }

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'Users', 'sam21323@gmail.com', 'Health-Food'),
      (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.metadata.hasPendingWrites) {
            setDataIsStored(false);
          } else {
            setDataIsStored(true);
          }
        });
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (dataIsStored) {
      getDbData();
    }
  }, [dataIsStored]);

  useEffect(() => {
    const csvString = [
      ['note', 'carbs', 'protein', 'fat', 'created_time'],
      ...data.map((item) => [
        item.note,
        item.carbs,
        item.protein,
        item.fat,
        handleTimestamp(item.created_time),
      ]),
    ]
      .map((e) => e.join(','))
      .join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    setFileUrl(url);
  }, [data]);

  function addPlan() {
    setIsAdding(true);
  }

  return (
    <>
      <Mask display={isAdding ? 'block' : 'none'} />
      <Wrapper>
        <MainContainer>
          <Header>
            <Tab>Health</Tab>
            <Button>Add Plans</Button>
            <Button onClick={addPlan}>Add Intake</Button>
          </Header>
          <Row>
            {titles.map((title, index) => (
              <Item key={index} fontSize='20px' fontWeight={800}>
                {title}
              </Item>
            ))}
          </Row>
          {nutritions.map((nutrition, index) => (
            <Nutrition>
              <Row key={index}>
                <Item fontSize='20px'>{nutrition.title}</Item>
                <Item fontSize='20px'>{nutrition.total}</Item>
                <Item fontSize='20px'>{nutrition.goal}</Item>
                <Item fontSize='20px'>{nutrition.left}</Item>
              </Row>
              <ProgressBar value='70' max='100'></ProgressBar>
            </Nutrition>
          ))}
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
                />
              </Question>
            ))}
            <SubmitBtn>Submit</SubmitBtn>
          </Form>
          <Exit
            display={isAdding ? 'block' : 'none'}
            onClick={() => {
              setIsAdding(!isAdding);
              setIsSearching(!isSearching);
            }}
          >
            X
          </Exit>
        </FormContainer>
        <a
          href={fileUrl}
          download='nutrition.csv'
          style={{ margin: '20px auto', fontSize: '30px' }}
        >
          download CSV!
        </a>
      </Wrapper>
    </>
  );
}

export default Health;
