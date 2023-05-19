import { Timestamp, addDoc, collection } from 'firebase/firestore';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import { PageContext } from '../context/pageContext';
import { extensionDb } from '../firebase';

const Wrapper = styled.div`
  display: ${[(props) => props.display]};
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.div`
  width: 100%;
  font-size: 20px;
  color: #a4a4a3;
`;

const TitleInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  border: 1px solid black;
  padding: 20px;
  top: 0;
  left: 0;
  background-color: #1b2028;
  outline: none;
  border-radius: 10px;
  color: white;
  font-size: 24px;
  font-weight: 700;
`;

const InputBox = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 220px;
  border: 1px solid black;
  padding: 20px;
  top: 0;
  left: 0;
  background-color: #1b2028;
  outline: none;
  border-radius: 10px;
  overflow-y: auto;
  margin-bottom: 10px;

  &::-webkit-scrollbar {
    background-color: #1b2028;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a4a4a3;
  }
`;

const ToggleList = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100px;
  border: 1px solid black;
  display: ${(props) => props.display};
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  z-index: 200;
`;

const Option = styled.button`
  width: 100%;
  height: 25px;
  text-align: center;
  cursor: pointer;
  border: 0;
  border-bottom: 1px solid black;
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.color};
  font-size: 14px;
  &:hover {
    background-color: black;
    color: white;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 40px;
  border-radius: 10px;
  background-color: #3a6ff7;
  border: 0;
  outline: none;
  color: white;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
`;

const MainWrapper = styled.div`
  width: 85%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const commandList = [
  { tag: 'h1', value: 'h1', isHover: false },
  { tag: 'h2', value: 'h2', isHover: false },
  { tag: 'h3', value: 'h3', isHover: false },
  { tag: 'italic', value: 'i', isHover: false },
  { tag: 'bold', value: 'b', isHover: false },
  { tag: 'underline', value: 'ins', isHover: false },
  { tag: 'strikethrough', value: 'del', isHover: false },
  { tag: 'bullet list', value: 'ul', isHover: false },
  { tag: 'number list', value: 'ol', isHover: false },
];

export default function Note({ display }) {
  const { email } = useContext(PageContext);
  const initialFocusXY = { x: 430, y: 425 };
  const [commands, setCommands] = useState(commandList);
  const [isSlashed, setIsSlashed] = useState(false);
  const [text, setText] = useState('');
  const [rawText, setRawText] = useState('');
  const [focusXY, setFocusXY] = useState(initialFocusXY);
  const [hoverIndex, setHoverIndex] = useState(0);
  const inputRef = useRef(null);
  const [selectedTag, setSelectedTag] = useState('h1');
  const [hasSelected, setHasSelected] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [titleInput, setTitleInput] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case '/':
          setIsSlashed(true);
          break;
        case 'ArrowDown':
          setHoverIndex((prev) => (prev + 1) % commandList.length);
          break;
        case 'ArrowUp':
          hoverIndex > 0 &&
            setHoverIndex((prev) => (prev - 1) % commandList.length);
          break;
        case 'Enter':
          if (isSlashed) {
            const hoveredTag = commands[hoverIndex].tag;
            e.preventDefault();
            setSelectedTag(hoveredTag);
            setHasSelected(true);
          }
          break;
        case 'Escape':
          if (isSlashed) {
            e.preventDefault();
            setIsSlashed(false);
            setHoverIndex(0);
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

  function selectCommand(tag) {
    const slashRemovedText = getTextWithoutSlash(rawText);
    const newTexts =
      tag === 'ul' || tag === 'ol'
        ? `${slashRemovedText}<${tag}><li>&nbsp</li></${tag}>`
        : `${slashRemovedText}<${tag}>&nbsp</${tag}>`;
    setText(newTexts);
    setIsSlashed(false);
    setHoverIndex(0);
  }

  function getTextWithoutSlash(originalText) {
    const clonedText = originalText;
    const lastSlashIndex = clonedText.lastIndexOf('/');
    const secondToLastSlashIndex = clonedText.lastIndexOf(
      '/',
      lastSlashIndex - 1
    );
    const slashRemovedText =
      secondToLastSlashIndex === -1
        ? `${clonedText.slice(0, -1)}${clonedText.slice(lastSlashIndex + 1)}`
        : `${clonedText.slice(0, secondToLastSlashIndex)}${clonedText.slice(
            secondToLastSlashIndex + 1
          )}`;
    return slashRemovedText;
  }

  function handleTextChange(e) {
    setRawText(e.target.innerHTML);
    getFocusPosition(e);
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
    setRawText('');
    setHasSelected(false);
  }

  function addHover(data, index) {
    const newData = [...data];
    const lastIndex = index === 0 ? commandList.length - 1 : index - 1;
    const nextIndex = index === newData.length - 1 ? 0 : index + 1;
    newData[index].isHover = true;
    newData[lastIndex].isHover = false;
    newData[nextIndex].isHover = false;
    setCommands(newData);
  }

  function getTimestamp(stringDate) {
    const timestamp = Timestamp.fromDate(stringDate);
    return timestamp;
  }

  async function storeNotes(text) {
    const now = new Date();
    const timestamp = getTimestamp(now);
    const storedDoc = {
      archived: false,
      context: rawText,
      image_url: null,
      pinned: false,
      title: titleInput,
      created_time: timestamp,
    };
    await addDoc(collection(extensionDb, 'Users', email, 'Notes'), storedDoc);
    alert('Note Added!');
    setHasSubmitted(true);
  }

  useEffect(() => moveFocusToLast(), [text]);

  useEffect(() => {
    if (hasSubmitted) {
      setRawText('');
      setText('');
      setTitleInput('');
      setHasSubmitted(false);
    }
  }, [hasSubmitted]);

  return (
    <Wrapper display={display}>
      <ToggleList
        display={isSlashed ? 'block' : 'none'}
        top={`${focusXY.y}px`}
        left={`${focusXY.x}px`}
      >
        {commands.map((command, index) => (
          <div key={index}>
            <Option
              onClick={() => selectCommand(command.value)}
              backgroundColor={command.isHover ? 'black' : 'white'}
              color={command.isHover ? 'white' : 'black'}
            >
              {command.tag}
            </Option>
          </div>
        ))}
      </ToggleList>
      <MainWrapper>
        <Title>Title</Title>
        <TitleInput
          onChange={(e) => setTitleInput(e.target.value)}
          value={titleInput}
        />
        <Title>Content</Title>
        <InputBox
          contentEditable
          suppressContentEditableWarning
          onInput={handleTextChange}
          dangerouslySetInnerHTML={{ __html: text }}
          ref={inputRef}
          maxLength='10'
          autoFocus
        ></InputBox>
        <SubmitBtn
          onClick={() => {
            storeNotes(text);
          }}
        >
          Submit
        </SubmitBtn>
      </MainWrapper>
      {/* <button onClick={addText}>ADD!</button> */}
    </Wrapper>
  );
}
