import { useContext, useEffect } from 'react';
import styled from 'styled-components/macro';
import { ChartContext } from '../../components/Charts/ChartContext';
import LineChart from '../../components/Charts/LineChart';
import PieChart from '../../components/Charts/PieChart';
import { getMonthlyNetIncome } from '../../utils/firebase/firebase';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 50px;
  display: ${(props) => props.display};
`;

const ChartWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: #1b2028;
  border-radius: 20px;
`;

const Chart = styled.div`
  width: 600px;
  background-color: #1b2028;
  display: flex;
  justify-content: center;
  border-top-left-radius: 20px;
`;

const PieContainer = styled.div`
  display: flex;
  width: 100%;
`;

const categories = [
  { tag: 'food', amount: 3000, color: 'red' },
  { tag: 'transportation', amount: 7000, color: 'orange' },
  { tag: 'education', amount: 10000, color: 'yellow' },
  { tag: 'entertainment', amount: 20000, color: 'green' },
  { tag: 'others', amount: 10000, color: 'blue' },
];

export default function Analytics({ display }) {
  const { rawRecords, setRawRecords } = useContext(ChartContext);

  const tempRawRecords = [
    2000, 3000, 4000, 5000, 12000, 34500, 9000, 6300, 12000, 24000, 15600,
    12000,
  ];

  useEffect(() => setRawRecords(getMonthlyNetIncome), []);

  if (!rawRecords || !categories) {
    return;
  }
  return (
    <Wrapper display={display}>
      <ChartWrapper>
        <Chart>
          <LineChart
            rawRecords={tempRawRecords}
            setRawRecords={setRawRecords}
          />
        </Chart>
        <Chart>
          <PieContainer>
            <PieChart />
          </PieContainer>
        </Chart>
      </ChartWrapper>
    </Wrapper>
  );
}
