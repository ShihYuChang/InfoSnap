import styled from 'styled-components';
import Food from './pages/Food';

const Wrapper = styled.div`
  width: 400px;
  height: 300px;
`;

function App() {
  return (
    <Wrapper>
      <Food />
    </Wrapper>
  );
}

export default App;
