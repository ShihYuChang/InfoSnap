import React, { useState, useEffect, useReducer, useRef } from 'react';
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

const Text = styled.div`
  width: 50%;
  min-height: 200px;
  border: 1px solid black;
  margin-top: 50px;
  padding: 10px;
`;

const ToggleList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100px;
  border: 1px solid black;
  display: ${(props) => props.display};
  position: absolute;
`;

const Option = styled.button`
  width: 100%;
  height: 30px;
  text-align: center;
  cursor: pointer;
  border: 0;
  border-bottom: 1px solid black;
  background-color: white;
  &:hover {
    background-color: black;
    color: white;
  }
`;

export default function SlashCommand() {
  function reducer(state, action) {
    switch (action.type) {
      case 'ADD_H1': {
        const newTexts = `${rawText}<span style="font-size: 30px;">&nbsp</span>`;
        return newTexts;
      }
      default: {
        return state;
      }
    }
  }
  const commands = ['h1', 'h2', 'h3'];
  const [isSlashed, setIsSlashed] = useState(false);
  const [userInput, setUserInput] = useState({ text: '', style: '' });
  const [text, setText] = useState('');
  const [rawText, setRawText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/') {
        e.preventDefault();
        setIsSlashed(true);
      } else if (e.key === 'ArrowDown') {
        console.log('down!');
      } else {
        setIsSlashed(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function selectCommand(data) {
    const newTexts = `${rawText}<${data}>&nbsp</${data}>`;
    setText(newTexts);
    setIsSlashed(false);
  }

  function handleTextChange(e) {
    setRawText(e.target.innerHTML);
  }

  function moveFocusToStart() {
    const inputEl = inputRef.current;
    const range = document.createRange();
    range.selectNodeContents(inputEl);
    const len = inputEl.childNodes.length;
    const lastNode = inputEl.childNodes[len - 1];
    range.setStart(lastNode.firstChild, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function moveFocusToLast() {
    const range = document.createRange();
    range.selectNodeContents(inputRef.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  //   function addText() {
  //     const newTexts = `${rawText}<h2>&nbsp</h2>`;
  //     setText(newTexts);
  //   }

  useEffect(() => moveFocusToLast(), [text]);
  //   useEffect(() => console.log(rawText), [rawText]);

  return (
    <Wrapper>
      <Main>
        <ToggleList display={isSlashed ? 'block' : 'none'}>
          {commands.map((command, index) => (
            <div key={index}>
              <Option onClick={() => selectCommand(command)}>{command}</Option>
            </div>
          ))}
        </ToggleList>
        <Text
          contentEditable
          suppressContentEditableWarning
          onInput={handleTextChange}
          dangerouslySetInnerHTML={{ __html: text }}
          ref={inputRef}
        ></Text>
        {/* <button onClick={addText}>ADD!</button> */}
      </Main>
    </Wrapper>
  );
}
