import { useState, useEffect, useReducer } from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  width: 100%;
`;

const Main = styled.main`
  width: 70%;
  height: 500px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  width: 50%;
  height: 300px;
  border: 1px solid black;
`;

const ToggleList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100px;
  border: 1px solid black;
  display: ${(props) => props.display};
`;

const Option = styled.button`
  width: 100%;
  height: 30px;
  text-align: center;
  cursor: pointer;
  border: 0;
  border-bottom: 1px solid black;
  background-color: white;
`;

export default function SlashCommand() {
  const [isSlashed, setIsSlashed] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/') {
        setIsSlashed(true);
        console.log('slash!');
      } else {
        setIsSlashed(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Wrapper>
      <Main>
        <Input />
        <ToggleList display={isSlashed ? 'block' : 'none'}>
          <Option>h1</Option>
          <Option>h2</Option>
          <Option>h3</Option>
        </ToggleList>
      </Main>
    </Wrapper>
  );
}
