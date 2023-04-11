import { hover } from '@testing-library/user-event/dist/hover';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
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
  min-height: 300px;
  border: 1px solid black;
  padding: 10px;
  position: absolute;
  top: 500.953125px;
  left: 273.5px;
  background-color: white;
  z-index: 100;
`;

const ToggleList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100px;
  border: 1px solid black;
  display: ${(props) => props.display};
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  z-index: 200;
`;

const Option = styled.button`
  width: 100%;
  height: 30px;
  text-align: center;
  cursor: pointer;
  border: 0;
  border-bottom: 1px solid black;
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  &:hover {
    background-color: black;
    color: white;
  }
`;

export default function CommandNote() {
  const initialFocusXY = { x: 300, y: 532 };
  const [commands, setCommands] = useState([
    { tag: 'h1', isHover: false },
    { tag: 'h2', isHover: false },
    { tag: 'h3', isHover: false },
  ]);
  const [isSlashed, setIsSlashed] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [text, setText] = useState('');
  const [rawText, setRawText] = useState('');
  const [focusXY, setFocusXY] = useState(initialFocusXY);
  const [hoverIndex, setHoverIndex] = useState(0);
  const inputRef = useRef(null);
  const [selectedTag, setSelectedTag] = useState('h1');

  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case '/':
          e.preventDefault();
          setIsSlashed(true);
          break;
        case 'ArrowDown':
          setHoverIndex((prev) => (prev + 1) % 3);
          break;
        case 'ArrowUp':
          hoverIndex > 0 && setHoverIndex((prev) => (prev - 1) % 3);
          break;
        case 'Enter':
          if (isSlashed) {
            const hoveredTag = commands[hoverIndex].tag;
            e.preventDefault();
            setSelectedTag(hoveredTag);
            setHasSelected(true);
          }
          break;
        default:
          setToDefault();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hoverIndex, isSlashed]);

  useEffect(() => {
    if (inputRef.current.textContent === '') {
      setFocusXY(initialFocusXY);
    }
  }, [rawText]);

  useEffect(() => {
    addHover(commands, hoverIndex);
  }, [hoverIndex]);

  useEffect(() => {
    hasSelected && selectCommand(selectedTag);
  }, [selectedTag, hasSelected]);

  // useEffect(() => console.log(commands[hoverIndex].tag), [hoverIndex]);

  function selectCommand(tag) {
    console.log(selectedTag);
    const newTexts = `${rawText}<${tag}>&nbsp</${tag}>`;
    setText(newTexts);
    setIsSlashed(false);
    setHoverIndex(0);
  }

  function handleTextChange(e) {
    setRawText(e.target.innerHTML);
    getFocusPosition(e);
  }

  function getElementPos(element) {
    const rect = element.getBoundingClientRect();
    const distanceFromTop = rect.top;
    const distanceFromLeft = rect.left;
    console.log('Distance from top: ' + distanceFromTop + 'px');
    console.log('Distance from left: ' + distanceFromLeft + 'px');
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

  function getFocusPosition() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setFocusXY({ x: rect.left, y: rect.bottom });
  }

  function setToDefault() {
    setIsSlashed(false);
    setCommands(commands);
    setHoverIndex(0);
    setHasSelected(false);
  }

  function addHover(data, index) {
    const newData = [...data];
    const lastIndex = index === 0 ? 2 : index - 1;
    const nextIndex = index === newData.length - 1 ? 0 : index + 1;
    newData[index].isHover = true;
    newData[lastIndex].isHover = false;
    newData[nextIndex].isHover = false;
    setCommands(newData);
  }

  useEffect(() => moveFocusToLast(), [text]);

  return (
    <Wrapper>
      <Main>
        <ToggleList
          display={isSlashed ? 'block' : 'none'}
          top={`${focusXY.y}px`}
          left={`${focusXY.x}px`}
        >
          {commands.map((command, index) => (
            <div key={index}>
              <Option
                onClick={() => selectCommand(command.tag)}
                backgroundColor={command.isHover ? 'black' : 'white'}
                color={command.isHover ? 'white' : 'black'}
              >
                {command.tag}
              </Option>
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
