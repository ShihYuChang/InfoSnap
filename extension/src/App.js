import { useContext } from 'react';
import styled from 'styled-components/macro';
import Menu from './components/Menu';
import Finance from './pages/Finance';
import Health from './pages/Health';
import Note from './pages/Note';
import Task from './pages/Task';
import { PageContext } from './context/pageContext';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 400px;
  background-color: #4f4f4f;
  color: white;
  padding: 50px 0 0 0;
`;

function App() {
  const { page } = useContext(PageContext);

  return (
    <Wrapper>
      <Finance display={page === 'finance' ? 'flex' : 'none'} />
      <Health display={page === 'health' ? 'flex' : 'none'} />
      <Note display={page === 'note' ? 'flex' : 'none'} />
      <Task display={page === 'tasks' ? 'flex' : 'none'} />
      <Menu />
    </Wrapper>
  );
}

export default App;
