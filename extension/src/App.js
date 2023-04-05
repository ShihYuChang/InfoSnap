import styled from 'styled-components';
import Signup from './pages/Signup';

const Wrapper = styled.div`
  width: 400px;
  height: 300px;
`;

function App() {
  return (
    <Wrapper>
      <Signup />
    </Wrapper>
  );
}

export default App;
