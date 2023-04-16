import styled from 'styled-components/macro';

const Wrapper = styled.svg`
  width: 700px;
  height: 500px;
  transform: scale(0.9);
`;

export default function LineChart({ rawRecords }) {
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
  const sortedRecords = sortData(rawRecords);

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
    const distance = (num - sortedRecords[0]) / yDistance;
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
    return noCommaList;
  }

  return (
    <Wrapper>
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
        const initialYPos = 492;
        const newYPos = `${initialYPos - index * 35}`;
        return (
          <text
            key={index}
            x='70'
            y={newYPos}
            fontSize='12'
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
              fontSize='12px'
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
    </Wrapper>
  );
}
