import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { StateContext } from '../../context/StateContext';
import { ChartContext } from './ChartContext';

const Wrapper = styled.figure`
  transform: scale(0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Chart = styled.svg`
  width: 80%;
  height: 300px;
`;

const DetailContainer = styled.div`
  width: 70%;
  display: grid;
  grid-template-areas:
    'a b b'
    'c d e';
  column-gap: 25px;
  row-gap: 30px;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
`;

const PriceInfo = styled.div`
  display: flex;
  gap: 10px;
`;

const InfoText = styled.div``;

const ColorBox = styled.div`
  background-color: ${(props) => props.backgroundColor};
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

export default function PieChart() {
  const pie_cx = 200;
  const pie_cy = 120;
  const pie_r = 100;
  const [paths, setPaths] = useState([]);
  const { setAllXYs, allXYs } = useContext(ChartContext);
  const { categories } = useContext(StateContext);

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
  }, [categories]);

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
          <div key={index}>
            <path
              d={path}
              fill={categories[index % 5].color}
              stroke='#6241f4'
              strokeWidth='2'
            ></path>
          </div>
        ))}
      </Chart>
      <DetailContainer>
        {categories.map((item, index) => (
          <DetailRow key={index}>
            <ColorBox backgroundColor={item.color} />
            <InfoText>{item.tag}</InfoText>
            <PriceInfo>
              <InfoText>{`$${item.amount.toLocaleString()}`}</InfoText>
              <InfoText>{getPercentage(item.amount)}</InfoText>
            </PriceInfo>
          </DetailRow>
        ))}
      </DetailContainer>
    </Wrapper>
  );
}
