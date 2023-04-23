import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
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
  min-height: 800px;
  background-color: #1b2028;
  outline: none;
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

export default function CommandNote({ display }) {
  const { email } = useContext(UserContext);
  const initialFocusXY = { x: 430, y: 425 };
  const [commands, setCommands] = useState([
    { tag: 'h1', isHover: false },
    { tag: 'h2', isHover: false },
    { tag: 'h3', isHover: false },
  ]);
  const { isAdding, setIsAdding } = useContext(StateContext);
  const { selectedNote, setSelectedNote, selectedIndex, data } =
    useContext(NoteContext);
  const [isSlashed, setIsSlashed] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [text, setText] = useState('');
  const [rawText, setRawText] = useState('');
  const [focusXY, setFocusXY] = useState(initialFocusXY);
  const [hoverIndex, setHoverIndex] = useState(0);
  const inputRef = useRef(null);
  const [selectedTag, setSelectedTag] = useState('h1');
  const debounce = _.debounce((input) => {
    storeNotes(input);
  }, 800);

  useEffect(() => {
    selectedNote.content && setText(selectedNote.content.context);
  }, [selectedNote]);

  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case '/':
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
        case 'Escape':
          if (isAdding && isSlashed) {
            setIsSlashed(false);
          } else if (isAdding) {
            setIsAdding(!isAdding);
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
  }, [hoverIndex, isSlashed, isAdding]);

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
    const newTexts = `${slashRemovedText}<${tag}>&nbsp</${tag}>`;
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
    debounce(e.target.innerHTML);
    getFocusPosition(e);
  }

  // function getElementPos(element) {
  //   const rect = element.getBoundingClientRect();
  //   const distanceFromTop = rect.top;
  //   const distanceFromLeft = rect.left;
  //   console.log('Distance from top: ' + distanceFromTop + 'px');
  //   console.log('Distance from left: ' + distanceFromLeft + 'px');
  // }

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
    setRawText('');
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

  async function storeNotes(text) {
    const targetDoc = selectedNote.id;
    await setDoc(doc(db, 'Users', email, 'Notes', targetDoc), {
      archived: selectedNote.content.archived,
      context: text,
      image_url: null,
      pinned: selectedNote.content.pinned,
      title: selectedNote.content.title,
      created_time: selectedNote.content.created_time,
    });
  }

  useEffect(() => moveFocusToLast(), [text]);

  useEffect(() => {
    !isAdding && setSelectedNote([]);
  }, [isAdding]);

  useEffect(() => {
    if (isAdding && rawText.length === 0) {
      setRawText(selectedNote.content.context);
    }
  }, [selectedNote]);

  // window.addEventListener('click', (e) => {
  //   const id = Number(e.target.id);
  //   console.log(data[id]);
  // });

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
              onClick={() => selectCommand(command.tag)}
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
        onInput={handleTextChange}
        dangerouslySetInnerHTML={{ __html: text }}
        ref={inputRef}
        maxLength='10'
        autoFocus
      ></InputBox>
      {/* <SubmitBtn
          onClick={() => {
            handleEditSubmit();
          }}
        >
          Submit
        </SubmitBtn> */}
      {/* <button onClick={addText}>ADD!</button> */}
    </Wrapper>
  );
}
