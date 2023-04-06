import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

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

export default function App() {
  const [rawRecords, setRawRecords] = useState([]);
  const [allXYs, setAllXYs] = useState([{ x: 200, y: 100, angle: 0 }]);
  const [paths, setPaths] = useState([]);
  const circlePos = [];
  const sortedRecords = sortData(rawRecords);
  const cx = 100;
  const cy = 100;
  const r = 100;

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

  function getYAxis(arr) {
    const arrayLength = arr.length;
    const yAxis = [];
    for (let i = 0; i < arrayLength; i++) {
      const yDistance = (arr[arrayLength - 1] - arr[0]) / (arrayLength - 1);
      const yValue = Math.ceil(arr[0] + i * yDistance);
      yAxis.push(yValue);
    }
    return yAxis;
  }

  function getCircleYValue(num) {
    const recordLength = sortedRecords.length;
    const lastNumber = sortedRecords[recordLength - 1];
    const yDistance = (lastNumber - sortedRecords[0]) / (recordLength - 1);
    const distance = (num - sortedRecords[0]) / yDistance;
    const yValue = 490 - distance * 35;
    return yValue;
  }

  function getAllCirclePos() {
    const posList = [];
    circlePos.map((obj) => {
      const values = Object.values(obj);
      posList.push(values);
      return null;
    });
    const flattenPosList = posList.flat();
    flattenPosList[0] = `M${flattenPosList[0]}`;
    const withLMList = flattenPosList.map((num) => {
      if (
        flattenPosList.indexOf(num) % 2 === 0 &&
        flattenPosList.indexOf(num) !== 0
      ) {
        return `L${num}`;
      } else {
        return num;
      }
    });
    const noCommaList = withLMList.join(' ');
    return noCommaList;
  }

  useEffect(() => getMonthlyNet, []);
  const categories = [
    { tag: 'food', amount: 10000 },
    { tag: 'transportation', amount: 10000 },
    { tag: 'education', amount: 10000 },
    { tag: 'entertainment', amount: 10000 },
    // { tag: 'others', amount: 10000 },
  ];

  const totalAmount = categories.reduce((acc, cur) => {
    return acc + cur.amount;
  }, 0);

  function getAllXYs(arr) {
    const newXYs = [...allXYs];
    arr.forEach((item, index) => {
      const percentage = item.amount / totalAmount;
      const prevAngle = index === 0 ? allXYs[0].angle : newXYs[index].angle;
      const angle = prevAngle + 360 * percentage;
      const x = Math.round(cx + r * Math.cos((angle * Math.PI) / 180));
      const y = Math.round(cy - r * Math.sin((angle * Math.PI) / 180));
      newXYs.push({ x: x, y: y, angle: angle });
    });
    setAllXYs(newXYs);
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
        const path = `M${cx} ${cy}, L${currentXY.x} ${currentXY.y}, A${r} ${r} 0 ${largeArc} 0 ${nextXY.x} ${nextXY.y},Z`;
        newPaths.push(path);
      }
      setPaths(newPaths);
    }
    // setPaths(path);
  }, [allXYs]);

  if (!rawRecords || allXYs.length === 1) {
    return;
  }
  return (
    <div className='App'>
      <figure>
        <svg height='600' width='800'>
          <line stroke='black' x1='90' x2='590' y1='500' y2='500'></line>
          {months.map((month, index) => {
            const initialXPos = 110;
            const newXPos = `${initialXPos + index * 40}`;
            return (
              <text
                x={newXPos}
                y='520'
                fontSize='14'
                textAnchor='middle'
                fill='blue'
                key={index}
              >
                {month}
              </text>
            );
          })}
          <line stroke='black' x1='90' x2='90' y1='500' y2='80'></line>
          {getYAxis(sortedRecords).map((num, index) => {
            const initialYPos = 490;
            const newYPos = `${initialYPos - index * 35}`;
            return (
              <text
                key={index}
                x='70'
                y={newYPos}
                fontSize='14'
                textAnchor='end'
                fill='blue'
              >
                {Math.round(num / 1000) * 1000}
              </text>
            );
          })}
          {rawRecords.map((num, index) => {
            const firstXPos = 110;
            const xValue = firstXPos + index * 40;
            const yValue = getCircleYValue(num);
            circlePos.push({ x: xValue, y: yValue });
            return (
              <>
                <circle
                  cx={`${xValue}`}
                  cy={`${yValue}`}
                  fill='#24C1E0'
                  stroke='#21A2BF'
                  strokeWidth='2'
                  r='5'
                  key={index}
                />
                <text
                  x={`${xValue - 20}`}
                  y={`${yValue - 20}`}
                  fontSize='12'
                  fill='red'
                >
                  {num}
                </text>
              </>
            );
          })}
          <path
            d={getAllCirclePos()}
            stroke='#6241f4'
            strokeWidth='2'
            fill='none'
          />
        </svg>
        <svg style={{ height: '800px', display: 'flex', marginTop: '20px' }}>
          <circle
            cx='100'
            cy='100'
            r='100'
            stroke='black'
            strokeWidth={2}
            fill='none'
          />
          {paths.map((path) => (
            <path d={path} fill='#fa0' stroke='#6241f4' strokeWidth='2'></path>
          ))}
        </svg>
      </figure>
    </div>
  );
}
