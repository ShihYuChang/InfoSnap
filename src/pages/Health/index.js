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
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import SearchFood from '../../components/SearchFood/SearchFood';

const Form = styled.form`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 50px auto 0;
  align-items: center;
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
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
`;

const Row = styled.tr`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: 100px;
`;

const Item = styled.td`
  font-size: ${(props) => props.fontSize};
  font-weight: ${(props) => props.fontWeight};
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
  const [serverHasNewData, setServerHasNewData] = useState(false);
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
    console.log('trigger');
    if (dataIsStored) {
      getDbData();
    }
  }, [dataIsStored, serverHasNewData]);

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

  return (
    <div
      className='App'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
      }}
    >
      <MainContainer>
        <Row>
          {titles.map((title, index) => (
            <Item key={index} fontSize='20px' fontWeight={800}>
              {title}
            </Item>
          ))}
        </Row>
        {nutritions.map((nutrition, index) => (
          <Row key={index}>
            <Item fontSize='20px'>{nutrition.title}</Item>
            <Item fontSize='20px'>{nutrition.total}</Item>
            <Item fontSize='20px'>{nutrition.goal}</Item>
            <Item fontSize='20px'>{nutrition.left}</Item>
          </Row>
        ))}
      </MainContainer>
      {/* <SearchFood /> */}
      <Form onSubmit={handleSubmit}>
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
      <a
        href={fileUrl}
        download='nutrition.csv'
        style={{ margin: '20px auto', fontSize: '30px' }}
      >
        download CSV!
      </a>
    </div>
  );
}

export default Health;
