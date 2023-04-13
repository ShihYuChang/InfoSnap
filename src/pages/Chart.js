import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import LineChart from '../components/Charts/LineChart';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 50px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const Form = styled.form`
  width: 200px;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
`;

const Title = styled.label`
  width: 100px;
  font-size: 14px;
  flex-shrink: 0;
`;

const Input = styled.input`
  width: 150px;
  height: 20px;
`;

const SubmitBtn = styled.button`
  width: 100px;
  height: 50px;
`;

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
const docRef = doc(db, 'Users', 'sam21323@gmail.com');

// Database
const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const categories = [
  { tag: 'food', amount: 3000, color: 'red' },
  { tag: 'transportation', amount: 7000, color: 'orange' },
  { tag: 'education', amount: 10000, color: 'yellow' },
  { tag: 'entertainment', amount: 20000, color: 'green' },
  { tag: 'others', amount: 10000, color: 'blue' },
];

export default function Chart() {
  const pie_cx = 200;
  const pie_cy = 120;
  const pie_r = 100;
  const [rawRecords, setRawRecords] = useState([]);
  const [allXYs, setAllXYs] = useState([
    { x: pie_cx + pie_r, y: pie_cy, angle: 0 },
  ]);
  const [paths, setPaths] = useState([]);
  const circlePos = [];
  const sortedRecords = sortData(rawRecords);
  const [userInput, setUserInput] = useState([]);

  async function getMonthlyNet() {
    const docSnap = await getDoc(docRef);
    const readableSnap = docSnap.data();
    const monthlyNet = await readableSnap.monthlyNetIncome;
    const thisYearMonthlyNet = monthlyNet[2023];
    setRawRecords(thisYearMonthlyNet);
  }

  function sortData(arr) {
    const newArr = [...arr];
    newArr.sort((a, b) => a - b);
    return newArr;
  }

  useEffect(() => getMonthlyNet, []);

  const totalAmount = categories.reduce((acc, cur) => {
    return acc + cur.amount;
  }, 0);

  function getAllXYs(arr) {
    const newXYs = [...allXYs];
    arr.forEach((item, index) => {
      const percentage = item.amount / totalAmount;
      const prevAngle = index === 0 ? allXYs[0].angle : newXYs[index].angle;
      const angle = prevAngle + 360 * percentage;
      const x = Math.round(pie_cx + pie_r * Math.cos((angle * Math.PI) / 180));
      const y = Math.round(pie_cy - pie_r * Math.sin((angle * Math.PI) / 180));
      newXYs.push({ x: x, y: y, angle: angle });
    });
    setAllXYs(newXYs);
  }

  function getPercentage(amount) {
    const portion = amount / totalAmount;
    const percentageNum = portion * 100;
    const percentage = `${percentageNum.toFixed(2)}%`;
    return percentage;
  }

  function handleInput(e, index) {
    const records = [...userInput];
    records[index] = Number(e.target.value);
    setUserInput(records);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setRawRecords(userInput);
  }

  useEffect(() => {
    getAllXYs(categories);
  }, []);

  useEffect(() => {
    const newPaths = [...paths];
    if (allXYs.length > 1) {
      for (let i = 0; i < allXYs.length - 1; i++) {
        const currentXY = allXYs[i];
        const nextXY = allXYs[i + 1];
        const angle = nextXY.angle - currentXY.angle;
        const largeArc = angle > 180 ? 1 : 0;
        const path = `M${pie_cx} ${pie_cy}, L${currentXY.x} ${currentXY.y}, A${pie_r} ${pie_r} 0 ${largeArc} 0 ${nextXY.x} ${nextXY.y},Z`;
        newPaths.push(path);
      }
      setPaths(newPaths);
    }
  }, [allXYs]);

  if (!rawRecords || allXYs.length <= 1 || !paths || !categories) {
    return;
  }
  return (
    <Wrapper>
      <figure>
        <LineChart rawRecords={rawRecords} />
        <div style={{ display: 'flex', gap: '50px' }}>
          <svg
            style={{
              height: '800px',
              display: 'flex',
              marginTop: '20px',
              padding: '20px',
            }}
          >
            {paths.map((path, index) => (
              <>
                <path
                  d={path}
                  fill={categories[index % 5].color}
                  stroke='#6241f4'
                  strokeWidth='2'
                  key={index}
                ></path>
              </>
            ))}
          </svg>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              height: '30px',
            }}
          >
            {categories.map((item) => (
              <div
                style={{ display: 'flex', gap: '20px', alignItems: 'center' }}
              >
                <div
                  style={{
                    backgroundColor: `${item.color}`,
                    width: '20px',
                    height: '20px',
                    border: '1px solid black',
                    flexShrink: 0,
                  }}
                ></div>
                <p>{item.tag}</p>
                <p>{`$${item.amount.toLocaleString()}`}</p>
                <p>{getPercentage(item.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </figure>
      <InputWrapper>
        <Form onSubmit={handleSubmit}>
          {months.map((month, index) => (
            <Row key={index}>
              <Title>{month}</Title>
              <Input
                onChange={(e) => {
                  handleInput(e, index);
                }}
                type='number'
                required
              />
            </Row>
          ))}
          <SubmitBtn type='submit'>Submit</SubmitBtn>
        </Form>
      </InputWrapper>
    </Wrapper>
  );
}
