import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { FinanceContext } from '../../context/FinanceContext';

const Wrapper = styled.svg`
  width: 600px;
  height: 550px;
  transform: scale(0.9);
`;

export default function LineChart() {
  const { monthlyIncome } = useContext(FinanceContext);
  const [allCirclePos, setAllCirclePos] = useState(null);
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
  const sortedRecords = sortData(monthlyIncome);

  const circlePos = [];
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
    const initialYPos = 490;
    const recordLength = sortedRecords.length;
    const lastNumber = sortedRecords[recordLength - 1];
    const yDistance = (lastNumber - sortedRecords[0]) / (recordLength - 1);
    const distance = yDistance > 0 ? (num - sortedRecords[0]) / yDistance : 0;
    const yValue = initialYPos - distance * 35;
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
    setAllCirclePos(noCommaList);
  }

  useEffect(() => {
    monthlyIncome.length > 0 && getAllCirclePos();
  }, [monthlyIncome]);

  return (
    <Wrapper>
      <line
        stroke='#a4a4a3'
        x1='90'
        x2='590'
        y1='500'
        y2='500'
        strokeWidth='2px'
      ></line>
      {months.map((month, index) => {
        const initialXPos = 110;
        const newXPos = `${initialXPos + index * 40}`;
        return (
          <text
            x={newXPos}
            y='520'
            fontSize='14'
            textAnchor='middle'
            fill='#a4a4a3'
            key={index}
          >
            {month}
          </text>
        );
      })}
      <line
        stroke='#a4a4a3'
        x1='90'
        x2='90'
        y1='500'
        y2='80'
        strokeWidth='2px'
      ></line>
      {getYAxis(sortedRecords).map((num, index) => {
        const initialYPos = 492;
        const newYPos = `${initialYPos - index * 35}`;
        return (
          <text
            key={index}
            x='70'
            y={newYPos}
            fontSize='12'
            textAnchor='end'
            fill='#a4a4a3'
          >
            {Math.round(num / 1000) * 1000}
          </text>
        );
      })}
      {monthlyIncome.map((num, index) => {
        const firstXPos = 110;
        const xValue = firstXPos + index * 40;
        const yValue = getCircleYValue(num);
        circlePos.push({ x: xValue, y: yValue });
        if (num <= 0) {
          return (
            <React.Fragment key={index}>
              <circle cx={`${xValue}`} cy='490' fill='white' r='5' />
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={index}>
              <circle cx={`${xValue}`} cy={`${yValue}`} fill='white' r='5' />
              <text
                x={`${xValue - 20}`}
                y={`${yValue - 20}`}
                fontSize='12px'
                fill='white'
              >
                {num}
              </text>
            </React.Fragment>
          );
        }
      })}
      {allCirclePos && (
        <path d={allCirclePos} stroke='#3A6FF7' strokeWidth='3' fill='none' />
      )}
    </Wrapper>
  );
}
