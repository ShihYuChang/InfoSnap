import { useState, useEffect, useContext } from 'react';
import { ChartContext } from './chartContex';

export default function PieChart() {
  const pie_cx = 200;
  const pie_cy = 120;
  const pie_r = 100;
  const categories = [
    { tag: 'food', amount: 3000, color: 'red' },
    { tag: 'transportation', amount: 7000, color: 'orange' },
    { tag: 'education', amount: 10000, color: 'yellow' },
    { tag: 'entertainment', amount: 20000, color: 'green' },
    { tag: 'others', amount: 10000, color: 'blue' },
  ];
  const [paths, setPaths] = useState([]);
  const { setAllXYs, allXYs } = useContext(ChartContext);

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

  return (
    <>
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
    </>
  );
}
