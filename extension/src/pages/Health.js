import { useEffect, useState } from 'react';
import { extensionDb } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  query,
  orderBy,
  startAfter,
  endBefore,
  Timestamp,
} from 'firebase/firestore';
import styled from 'styled-components';

const questions = ['carbs', 'protein', 'fat', 'note'];

const Wrapper = styled.form`
  width: 80%;
  margin: 0 auto;
  display: ${(props) => props.display};
  flex-direction: column;
  gap: 30px;
  box-sizing: border-box;
  padding-bottom: 30px;
  align-items: center;
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  gap: 20px;
`;

const QuestionLabel = styled.label`
  width: 100px;
  font-size: 22px;
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

export default function Health({ display }) {
  const [userInput, setUserInput] = useState({
    carbs: '',
    protein: '',
    fat: '',
    note: '',
  });
  const [healthGoal, setHealthGoal] = useState({});
  const [intakeRecords, setIntakeRecords] = useState([]);
  const [intakeLeft, setIntakeLeft] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
      collection(extensionDb, 'Users', 'sam21323@gmail.com', 'Health-Food'),
      userInput
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await storeData();
    alert('submit!');
    setHasSubmitted(true);
  }

  function getTimestamp(hr, min, sec, nanosec) {
    const now = new Date();
    now.setHours(hr, min, sec, nanosec);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
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

  function getNutrtionLeft() {
    const intakeByNutrition = getNutritionTotal(intakeRecords);
    const intakeLeft = { carbs: null, protein: null, fat: null };
    for (let key in intakeByNutrition) {
      intakeLeft[key] = Number(
        healthGoal[key] - intakeByNutrition[key] > 0
          ? Number(healthGoal[key] - intakeByNutrition[key])
          : 0
      );
    }
    return intakeLeft;
  }

  useEffect(() => {
    const startOfToday = getTimestamp(0, 0, 0, 0);
    const endOfToday = getTimestamp(23, 59, 59, 59);
    setHasSubmitted(false);

    const healthSnap = onSnapshot(
      doc(extensionDb, 'Users', 'sam21323@gmail.com'),
      (doc) => {
        const data = doc.data();
        setHealthGoal(data.currentHealthGoal);
      }
    );

    const foodSnap = onSnapshot(
      query(
        collection(extensionDb, 'Users', 'sam21323@gmail.com', 'Health-Food'),
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

    return () => {
      healthSnap();
      foodSnap();
    };
  }, []);

  useEffect(() => {
    setIntakeLeft(getNutrtionLeft());
    if (hasSubmitted) {
      setUserInput({
        carbs: '',
        protein: '',
        fat: '',
        note: '',
      });
    }
  }, [healthGoal, intakeRecords]);

  return (
    <Wrapper onSubmit={handleSubmit} display={display}>
      <Goal>
        <Row>
          <GoalTitle>Carbs</GoalTitle>
          <GoalTitle>Protein</GoalTitle>
          <GoalTitle>Fat</GoalTitle>
        </Row>
        <Row>
          <GoalNumber>{parseInt(intakeLeft.carbs)}</GoalNumber>
          <GoalNumber>{parseInt(intakeLeft.protein)}</GoalNumber>
          <GoalNumber>{parseInt(intakeLeft.fat)}</GoalNumber>
        </Row>
      </Goal>
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
              value={userInput[item]}
            />
          </Question>
        );
      })}
      <SubmitBtn type='submit'>Submit</SubmitBtn>
    </Wrapper>
  );
}

const Goal = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  margin-bottom: 10px;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const GoalTitle = styled.h1`
  font-weight: 700;
  font-size: 30px;
`;

const GoalNumber = styled.h2`
  font-weight: 700;
  font-size: 40px;
`;
