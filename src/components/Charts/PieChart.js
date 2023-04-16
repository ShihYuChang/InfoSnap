import { useState, useEffect, useContext } from 'react';
import { ChartContext } from './chartContex';
import styled from 'styled-components/macro';
import { StateContext } from '../../context/stateContext';

const Wrapper = styled.figure`
  transform: scale(0.9);
  display: flex;
  gap: 50px;
  padding-top: 90px;
`;

const Chart = styled.svg`
  width: '300px';
  height: '500px';
  display: 'flex';
  margin-top: '20px';
`;

export default function PieChart() {
  const pie_cx = 200;
  const pie_cy = 120;
  const pie_r = 100;
  const [paths, setPaths] = useState([]);
  const { setAllXYs, allXYs } = useContext(ChartContext);
  const { categories, expenseRecords } = useContext(StateContext);

  const totalAmount = categories.reduce((acc, cur) => {
    return acc + cur.amount;
  }, 0);

  function getPercentage(amount) {
    const portion = amount / totalAmount;
    const percentageNum = portion * 100;
    const percentage = `${percentageNum.toFixed(2)}%`;
    return percentage;
  }

  function getAllXYs(arr) {
    const newXYs = JSON.parse(JSON.stringify(allXYs));
    arr.forEach((item, index) => {
      const percentage = parseInt(item.amount) / totalAmount;
      const prevAngle = index === 0 ? allXYs[0].angle : newXYs[index].angle;
      const angle = prevAngle + 360 * percentage;
      const x = Math.round(pie_cx + pie_r * Math.cos((angle * Math.PI) / 180));
      const y = Math.round(pie_cy - pie_r * Math.sin((angle * Math.PI) / 180));
      newXYs.push({ x: x, y: y, angle: angle });
    });

    setAllXYs(newXYs);
  }

  useEffect(() => {
    if (allXYs && categories[0].amount > 0) {
      getAllXYs(categories);
    }
  }, [categories, expenseRecords]);

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

  return (
    <Wrapper>
      <Chart>
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
      </Chart>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '30px',
        }}
      >
        {categories.map((item) => (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
    </Wrapper>
  );
}
