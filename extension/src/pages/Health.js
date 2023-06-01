import {
  Timestamp,
  addDoc,
  collection,
  doc,
  endBefore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { PageContext } from '../context/pageContext';
import { extensionDb } from '../firebase';

const questions = ['carbs', 'protein', 'fat', 'note'];

const Wrapper = styled.form`
  width: 85%;
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
  width: 120px;
  font-size: 18px;
  line-height: 20px;
  flex-shrink: 0;
`;

const QuestionInput = styled.input`
  flex-grow: 1;
  height: 35px;
  border-radius: 10px;
  background-color: #a4a4a3;
  border: 0;
  outline: none;
  padding: 0 10px;
  color: white;
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 40px;
  border-radius: 10px;
  background-color: #3a6ff7;
  border: 0;
  outline: none;
  color: white;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
`;

const Goal = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const Row = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 50px;
`;

const GoalTitle = styled.div`
  width: 100%;
  font-weight: 500;
  font-size: 18px;
  color: #a4a4a3;
  margin-bottom: 15px;
  text-align: center;
`;

const GoalNumber = styled.div`
  width: 100%;
  font-weight: 700;
  font-size: 40px;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: 1px solid #a4a4a3;
  margin-top: 20px;
`;

export default function Health({ display }) {
  const { email } = useContext(PageContext);
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
      collection(extensionDb, 'Users', email, 'Health-Food'),
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

    const healthSnap = onSnapshot(doc(extensionDb, 'Users', email), (doc) => {
      const data = doc.data();
      setHealthGoal(
        data ? data.currentHealthGoal : { carbs: 0, protein: 0, fat: 0 }
      );
    });

    const foodSnap = onSnapshot(
      query(
        collection(extensionDb, 'Users', email, 'Health-Food'),
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
        <SplitLine />
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
