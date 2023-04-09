import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import styled from 'styled-components';

const questions = ['carbs', 'protein', 'fat', 'note'];

const Wrapper = styled.form`
  width: 50%;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  gap: 20px;
`;

const QuestionLabel = styled.label`
  width: 62px;
  font-size: 14px;
  line-height: 20px;
  flex-shrink: 0;
`;

const QuestionInput = styled.input`
  width: 50%;
  height: 20px;
`;

const SubmitBtn = styled.button`
  width: 90px;
  height: 40px;
  background-color: black;
  color: white;
  margin: 0 auto;
  margin-top: 20px;
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

export default function Signup() {
  const [userInput, setUserInput] = useState({});

  function handleChange(e, data) {
    e.target.name === 'note'
      ? setUserInput({
          ...userInput,
          [data]: e.target.value,
          created_time: serverTimestamp(),
        })
      : setUserInput({
          ...userInput,
          [data]: Number(e.target.value),
          created_time: serverTimestamp(),
        });
  }

  async function storeData() {
    await addDoc(
      collection(db, 'Users', 'sam21323@gmail.com', 'Health-Food'),
      userInput
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await storeData();
    alert('submit!');
  }

  return (
    <Wrapper onSubmit={handleSubmit}>
      {questions.map((item, index) => {
        return (
          <Question key={index}>
            <QuestionLabel>{item}</QuestionLabel>
            <QuestionInput
              onChange={(e) => {
                handleChange(e, item);
              }}
              type={item === 'note' ? 'text' : 'number'}
              name={item}
            />
          </Question>
        );
      })}
      <SubmitBtn type='submit'>Submit</SubmitBtn>
    </Wrapper>
  );
}
