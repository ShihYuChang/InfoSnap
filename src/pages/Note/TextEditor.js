import _ from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { NoteContext } from '../../context/NoteContext';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { editNoteTexts } from '../../utils/firebase/firebase';

const Wrapper = styled.div`
  outline: none;
  border: 0;
`;

const InputBox = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  background-color: #1b2028;
  outline: none;
  line-height: 30px;
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
  text-align: center;
  cursor: pointer;
  border: 0;
  border-bottom: 1px solid white;
  background-color: ${(props) => props.backgroundColor};
  padding: 15px;
  color: white;
  &:hover {
    background-color: black;
    color: white;
  }
`;

const commandList = [
  { tag: 'regular', value: 'p' },
  { tag: 'h1', value: 'h1' },
  { tag: 'h2', value: 'h2' },
  { tag: 'h3', value: 'h3' },
  { tag: 'italic', value: 'i' },
  { tag: 'bold', value: 'b' },
  { tag: 'underline', value: 'ins' },
  { tag: 'strikethrough', value: 'del' },
  { tag: 'bullet list', value: 'ul' },
  { tag: 'number list', value: 'ol' },
];

export default function TextEditor() {
  const { userInfo } = useContext(UserContext);
  const email = userInfo.email;
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
  const { setIsEditingNote, setIsEditing, isEditing } =
    useContext(StateContext);
  const [isSlashed, setIsSlashed] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [text, setText] = useState('');
  const [rawText, setRawText] = useState('');
  const [focusXY, setFocusXY] = useState(initialFocusXY);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState('h1');
  const debounce = _.debounce((input) => {
    const targetDoc = data[selectedIndex].id;
    const targetNote = data[selectedIndex];
    editNoteTexts(targetDoc, email, targetNote, input);
  }, 800);

  function selectCommand(tag) {
    const slashRemovedText = getTextWithoutSlash(rawText);
    const commandSearchTextIndex = slashRemovedText.lastIndexOf(userInput);
    const commandSearchWordRemovedText =
      slashRemovedText.substring(0, commandSearchTextIndex - 1) +
      slashRemovedText.substring(commandSearchTextIndex + userInput.length);

    const newCommands = [...commands];
    setCommands(newCommands);

    const newTexts =
      tag === 'ul' || tag === 'ol'
        ? `${commandSearchWordRemovedText}<${tag}><li>&nbsp</li></${tag}>`
        : `${commandSearchWordRemovedText}<${tag}>&nbsp</${tag}>`;
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
    setIsEditingNote(true);
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

  useEffect(() => {
    moveFocusToLast();
  }, [text]);

  useEffect(() => {
    if (data[selectedIndex]?.content) {
      setRawText(data[selectedIndex].content.context);
      setText(data[selectedIndex].content.context);
    }
  }, [selectedIndex, data.length]);

  useEffect(() => {
    function resetCommands() {
      setIsSlashed(false);
      setCommands(commandList);
      setUserInput('');
    }

    if (isSlashed) {
      const matchedCommands = commandList.filter((command) =>
        command.tag.toLowerCase().includes(userInput)
      );
      matchedCommands.length > 0
        ? setCommands(matchedCommands)
        : resetCommands();
    }
  }, [userInput]);

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
        case 'ArrowRight':
          isSlashed && setIsSlashed(false);
          break;
        case 'ArrowLeft':
          isSlashed && setIsSlashed(false);
          break;
        case 'Enter':
          if (isSlashed && !isEditingTitle) {
            e.preventDefault();
            const hoveredTag = commands[hoverIndex].value;
            setSelectedTag(hoveredTag);
            setHasSelected(true);
            setHoverIndex(0);
          } else if (isEditingTitle) {
            e.preventDefault();
          }
          break;
        case 'Escape':
          if (isSlashed && !isComposing) {
            setIsSlashed(false);
            setCommands(commandList);
            setUserInput('');
            setHoverIndex(0);
          }
          break;
        default:
          if (isSlashed) {
            setUserInput((prev) => prev + e.key);
            return;
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hoverIndex, isSlashed, isEditingTitle, isComposing, commands]);

  useEffect(() => {
    if (textRef.current.textContent === '') {
      setFocusXY(initialFocusXY);
    }
  }, [rawText]);

  useEffect(() => {
    hasSelected && selectCommand(selectedTag);
  }, [selectedTag, hasSelected]);

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
              backgroundColor={hoverIndex === index ? 'black' : '#a4a4a3'}
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
      ></InputBox>
    </Wrapper>
  );
}
