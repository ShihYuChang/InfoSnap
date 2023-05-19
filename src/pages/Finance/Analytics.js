import { useContext, useEffect } from 'react';
import styled from 'styled-components/macro';
import { ChartContext } from '../../components/Charts/ChartContext';
import LineChart from '../../components/Charts/LineChart';
import PieChart from '../../components/Charts/PieChart';
import { UserContext } from '../../context/UserContext';
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

export default function Analytics({ display }) {
  const { rawRecords, setRawRecords } = useContext(ChartContext);
  const { userInfo } = useContext(UserContext);
  const email = userInfo.email;

  useEffect(() => {
    getMonthlyNetIncome(email, setRawRecords);
  }, [email, setRawRecords]);

  if (!rawRecords) {
    return;
  }
  return (
    <Wrapper display={display}>
      <ChartWrapper>
        <Chart>
          <LineChart rawRecords={rawRecords} setRawRecords={setRawRecords} />
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
