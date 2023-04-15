import { db } from '../../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { useEffect, useContext } from 'react';
import styled from 'styled-components';
import PieChart from '../../components/Charts/PieChart';
import LineChart from '../../components/Charts/LineChart';
import { ChartContext } from '../../components/Charts/chartContex';

const docRef = doc(db, 'Users', 'sam21323@gmail.com');

const categories = [
  { tag: 'food', amount: 3000, color: 'red' },
  { tag: 'transportation', amount: 7000, color: 'orange' },
  { tag: 'education', amount: 10000, color: 'yellow' },
  { tag: 'entertainment', amount: 20000, color: 'green' },
  { tag: 'others', amount: 10000, color: 'blue' },
];

export default function Analytics({ display }) {
  const { rawRecords, setRawRecords } = useContext(ChartContext);

  async function getMonthlyNet() {
    const docSnap = await getDoc(docRef);
    const readableSnap = docSnap.data();
    const monthlyNet = await readableSnap.monthlyNetIncome;
    const thisYearMonthlyNet = monthlyNet[2023];
    setRawRecords(thisYearMonthlyNet);
  }

  useEffect(() => getMonthlyNet, []);

  if (!rawRecords || !categories) {
    return;
  }
  return (
    <Wrapper display={display}>
      <ChartWrapper>
        <LineChart rawRecords={rawRecords} setRawRecords={setRawRecords} />
        <div style={{ display: 'flex' }}>
          <PieChart />
        </div>
      </ChartWrapper>
      <TableContainer></TableContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 50px;
  display: ${(props) => props.display};
`;

const ChartWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 50px;
`;

const TableContainer = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid black;
`;
