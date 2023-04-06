import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const questions = ['carbs', 'protein', 'fat', 'note'];

const Form = styled.form`
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
`;

const QuestionTitle = styled.label`
  width: 50px;
  font-size: 14px;
`;

const QuestionInput = styled.input`
  width: 100px;
  height: 20px;
`;

const SubmitBtn = styled.button`
  width: 100px;
  height: 50px;
`;

const firebaseConfig = {
  apiKey: 'AIzaSyCrg6sxxS6Drp-CAFHdmvoVkUaaCkunlu8',
  authDomain: 'infosnap-4f11e.firebaseapp.com',
  projectId: 'infosnap-4f11e',
  storageBucket: 'infosnap-4f11e.appspot.com',
  messagingSenderId: '112276311326',
  appId: '1:112276311326:web:0b279e4293298cce98cd0f',
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

function Export() {
  const [data, setData] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const [userInput, setUserInput] = useState({});
  const [hasSubmit, setHasSubmit] = useState(false);
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
    const addedData = {
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

  useEffect(() => getDbData, [hasSubmit]);

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

  useEffect(() => console.log(userInput), [userInput]);

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
      <Form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <Question key={index}>
            <QuestionTitle>{question}</QuestionTitle>
            <QuestionInput
              type={question === 'note' ? 'text' : 'number'}
              onChange={(e) => {
                handleInput(e, question);
              }}
            />
          </Question>
        ))}
        <SubmitBtn>Submit</SubmitBtn>
      </Form>
      <a
        href={fileUrl}
        download='nutrition.csv'
        style={{ margin: '50px auto', fontSize: '30px' }}
      >
        download CSV!
      </a>
    </div>
  );
}

export default Export;
