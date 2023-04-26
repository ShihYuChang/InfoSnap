import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components/macro';
import _ from 'lodash';
import { StateContext } from '../../context/stateContext';
import { NoteContext } from './noteContext';
import { UserContext } from '../../context/userContext';
import { db } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';

const Wrapper = styled.div`
  outline: none;
  border: 0;
`;

const InputBox = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  background-color: #1b2028;
  outline: none;
`;

const ToggleList = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 100px;
  border: 1px solid black;
  display: ${(props) => props.display};
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  z-index: 200;
`;

const Option = styled.button`
  box-sizing: border-box;
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

export default function CommandNote({ display }) {
  const { email } = useContext(UserContext);
  const initialFocusXY = { x: 430, y: 425 };
  const [commands, setCommands] = useState(commandList);
  const [userInput, setUserInput] = useState('');
  const {
    selectedIndex,
    data,
    isEditingTitle,
    setIsEditingTitle,
    textRef,
    isComposing,
  } = useContext(NoteContext);
  const [isSlashed, setIsSlashed] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [text, setText] = useState('');
  const [rawText, setRawText] = useState('');
  const [focusXY, setFocusXY] = useState(initialFocusXY);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState('h1');
  const debounce = _.debounce((input) => {
    storeNotes(input);
  }, 800);

  useEffect(() => {
    data[selectedIndex].content && setText(data[selectedIndex].content.context);
  }, [selectedIndex]);

  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case '/':
          if (!isEditingTitle) {
            setIsSlashed(true);
          }
          break;
        case 'ArrowDown':
          setHoverIndex((prev) => (prev + 1) % commands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          hoverIndex > 0 &&
            setHoverIndex((prev) => (prev - 1) % commands.length);
          break;
        case 'Enter':
          if (isSlashed && !isEditingTitle) {
            const hoveredTag = commands[hoverIndex].value;
            e.preventDefault();
            setSelectedTag(hoveredTag);
            setHasSelected(true);
          } else if (isEditingTitle) {
            // textRef.current.focus();
            e.preventDefault();
          }
          break;
        case 'Escape':
          if (isSlashed && !isComposing) {
            setIsSlashed(false);
            setCommands(commandList);
            setUserInput('');
          }
          break;
        default:
          if (isSlashed) {
            setUserInput((prev) => prev + e.key);
            return;
          }
          // setToDefault();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hoverIndex, isSlashed, isEditingTitle, isComposing]);

  useEffect(() => {
    if (textRef.current.textContent === '') {
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
    const newCommands = [...commands];
    newCommands[hoverIndex].isHover = false;
    setCommands(newCommands);

    const slashRemovedText = getTextWithoutSlash(rawText);

    const newTexts =
      tag === 'ul' || tag === 'ol'
        ? `${slashRemovedText}<${tag}><li>&nbsp</li></${tag}>`
        : `${slashRemovedText}<${tag}>&nbsp</${tag}>`;
    setText(newTexts);
    setIsSlashed(false);
    setHoverIndex(0);
    setCommands(commandList);
    setUserInput('');
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
    debounce(e.target.innerHTML);
    getFocusPosition(e);
  }

  function moveFocusToStart() {
    const inputEl = textRef.current;
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
    range.selectNodeContents(textRef.current);
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
    setRawText('');
  }

  function addHover(data, index) {
    const newData = [...data];
    const lastIndex = index === 0 ? commands.length - 1 : index - 1;
    const nextIndex = index === newData.length - 1 ? 0 : index + 1;
    newData[index].isHover = true;
    newData[lastIndex].isHover = false;
    newData[nextIndex].isHover = false;
    setCommands(newData);
  }

  async function storeNotes(text) {
    const targetDoc = data[selectedIndex].id;
    await setDoc(doc(db, 'Users', email, 'Notes', targetDoc), {
      archived: data[selectedIndex].content.archived,
      context: text,
      image_url: null,
      pinned: data[selectedIndex].content.pinned,
      title: data[selectedIndex].content.title,
      created_time: data[selectedIndex].content.created_time,
    });
  }

  useEffect(() => moveFocusToLast(), [text]);

  useEffect(() => {
    if (data[selectedIndex]?.content) {
      // setRawText(selectedNote.content.context);
      setRawText(data[selectedIndex].content.context);
    }
  }, [selectedIndex, data]);

  useEffect(() => {
    if (isSlashed) {
      const matchedCommands = commandList.filter((command) =>
        command.tag.toLowerCase().includes(userInput)
      );
      setCommands(matchedCommands);
    }
  }, [userInput]);

  return (
    <Wrapper>
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

      <InputBox
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: text }}
        onInput={handleTextChange}
        ref={textRef}
        onFocus={() => {
          setIsEditingTitle(false);
        }}
      ></InputBox>
    </Wrapper>
  );
}
