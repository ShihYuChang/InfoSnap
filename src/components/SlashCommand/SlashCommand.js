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

const Input = styled.textarea`
  width: 50%;
  height: 300px;
  border: 1px solid black;
  font-size: ${(props) => props.fontSize};
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
  function reducer(state, action) {
    switch (action.type) {
      case 'ADD_H1': {
      }
      default: {
        return state;
      }
    }
  }
  const commands = ['h1', 'h2', 'h3'];
  const [isSlashed, setIsSlashed] = useState(false);
  const [userInput, setUserInput] = useState({ text: '', style: '' });

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

  function handleInput(e) {
    const newInput = { ...userInput };
    newInput.text = e.target.value;
    setUserInput(newInput);
  }

  function selectCommand(data) {
    const newInput = { ...userInput };
    newInput.style = data;
    setUserInput(newInput);
  }

  useEffect(() => console.log(userInput), [userInput]);

  return (
    <Wrapper>
      <Main>
        <Input onChange={handleInput} value={userInput.text} fontSize='20px' />
        <ToggleList display={isSlashed ? 'block' : 'none'}>
          {commands.map((command, index) => (
            <div key={index}>
              <Option onClick={() => selectCommand(command)}>{command}</Option>
            </div>
          ))}
        </ToggleList>
      </Main>
    </Wrapper>
  );
}
