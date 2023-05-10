import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import _ from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { RiInboxArchiveFill } from 'react-icons/ri';
import styled from 'styled-components/macro';
import Swal from 'sweetalert2';
import ContextMenu from '../../components/ContextMenu/ContextMenu';
import Icon from '../../components/Icon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { db, getUserEmail } from '../../utils/firebase';
import CommandNote from './CommandNote';
import { NoteContext } from './noteContext';

export default function Dashboard() {
  const { email, setEmail } = useContext(UserContext);
  const {
    data,
    setData,
    setSelectedNote,
    setSelectedIndex,
    selectedIndex,
    setIsEditingTitle,
    isEditingTitle,
    titleRef,
    textRef,
  } = useContext(NoteContext);
  const {
    setHeaderIcons,
    selectedContextMenu,
    setSelectedContextMenu,
    selectedTask,
    setSelectedTask,
    setIsEditingNote,
  } = useContext(StateContext);
  const [displayArchived, setDisplayArchived] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [title, setTitle] = useState('');
  const [contextMenuShow, setContextMenuShow] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState(null);
  const [rightClickedNote, setRightClickedNote] = useState(null);
  const [contextMenuOptions, setContextMenuOptions] = useState([
    {
      label: 'Pin Note',
      value: 'pin',
    },
    { label: 'Archive Note', value: 'archive' },
    { label: 'Delete Note', value: 'delete' },
  ]);
  const [titleForDisplay, setTitleForDisplay] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const dataRef = useRef(null);
  const contextMenuRef = useRef(null);
  const itemsRef = useRef(null);
  const debounce = _.debounce((input) => {
    editTitle(input);
  }, 800);

  async function editTitle(text) {
    const targetDoc = data[selectedIndex].id;
    await setDoc(doc(db, 'Users', email, 'Notes', targetDoc), {
      archived: data[selectedIndex].content.archived,
      context: data[selectedIndex].content.context,
      image_url: null,
      pinned: data[selectedIndex].content.pinned,
      title: text,
      created_time: data[selectedIndex].content.created_time,
    });
  }

  useEffect(() => {
    getUserEmail(setEmail);
    setHeaderIcons([]);
  }, []);

  useEffect(() => {
    if (email) {
      const unsub = onSnapshot(
        query(
          collection(db, 'Users', email, 'Notes'),
          orderBy('created_time', 'desc')
        ),
        (querySnapshot) => {
          const notes = [];
          querySnapshot.forEach((doc) => {
            notes.push({ content: doc.data(), id: doc.id, isVisible: true });
          });
          dataRef.current = notes;
          setData(notes);
        }
      );
      return unsub;
    }
  }, [email]);

  useEffect(() => {
    if (data[selectedIndex]?.content) {
      setTitle(data[selectedIndex].content.title);
      setTitleForDisplay(data[selectedIndex].content.title);
    }
    itemsRef.current.children[selectedIndex]?.focus();
    titleRef.current && titleRef.current.focus();
  }, [selectedIndex, data.length]);

  function clickNote(index) {
    setSelectedTask(null);
    setSelectedIndex(index);
    setSelectedNote(data[index]);
  }

  async function deleteNote(id) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3a6ff7',
      cancelButtonColor: '#a4a4a3',
      confirmButtonText: 'Yes, delete it!',
    })
      .then((result) => {
        if (result.isConfirmed) {
          deleteDoc(doc(db, 'Users', email, 'Notes', id));
        }
      })
      .then(() => {
        Swal.fire('Deleted!', 'The note has been deleted', 'success');
        setSelectedIndex(0);
      });
  }

  async function addNote() {
    await addDoc(collection(db, 'Users', email, 'Notes'), {
      archived: false,
      context: 'New Note',
      image_url: null,
      pinned: false,
      title: 'New Note',
      created_time: serverTimestamp(),
    });
    setSelectedIndex(0);
  }

  function searchNote(e) {
    const inputValue = e.target.value;
    const inputValueWithNoWhitespace = inputValue
      .replace(/\s/g, '')
      .toLowerCase();
    setUserInput(inputValue);
    const notes = dataRef.current;
    const matchedCards = notes.filter(
      (note) =>
        note.content.title
          .toLowerCase()
          .replace(
            /<\/?(h1|h2|h3|div|br)[^>]*>|&nbsp;|(\r\n|\n|\r|\t|\s+)/gi,
            ''
          )
          .trim()
          .includes(inputValueWithNoWhitespace) ||
        note.content.context
          .toLowerCase()
          .replace(
            /<\/?(h1|h2|h3|div|br)[^>]*>|&nbsp;|(\r\n|\n|\r|\t|\s+)/gi,
            ''
          )
          .trim()
          .includes(inputValueWithNoWhitespace)
    );
    setData(inputValue === ' ' ? notes : matchedCards);
  }

  async function pinNote(id, note) {
    const newNote = note;
    newNote.pinned = !newNote.pinned;
    await setDoc(doc(db, 'Users', email, 'Notes', id), newNote);
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: newNote.pinned ? 'Pinned to the dashboard!' : 'Note Unpinned!',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  async function archiveNote(id, note) {
    const newNote = note;
    newNote.archived = true;
    await updateDoc(doc(db, 'Users', email, 'Notes', id), newNote);
    alert('Archived!');
  }

  async function restoreNote(id, note) {
    const newNote = { ...note };
    newNote.archived = false;
    await updateDoc(doc(db, 'Users', email, 'Notes', id), newNote);
    alert('Restore!');
  }

  function displayNotes() {
    const notes = dataRef.current;
    if (!displayArchived) {
      setDisplayArchived(true);
      const archiveNotes = notes.filter((note) => note.content.archived);
      setData(archiveNotes);
      // setSelectedIndex(0);
    } else {
      setDisplayArchived(false);
      const currentNotes = notes.filter((note) => !note.content.archived);
      setData(currentNotes);
    }
  }

  function parseTimestamp(timestamp) {
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const formattedDate = date.toLocaleString();
    return formattedDate;
  }

  function handleTitleChange(e) {
    setIsEditingTitle(true);
    setTitle(e.target.innerHTML);
    debounce(e.target.innerHTML);
  }

  function moveFocusToLast() {
    const titleNode = titleRef.current;
    if (!titleNode || !(titleNode instanceof Node)) {
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(titleRef.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function rightClick(e, index) {
    e.preventDefault();
    setContextMenuPos({ x: e.pageX, y: e.pageY });
    setContextMenuShow(true);
    setRightClickedNote(data[index]);
  }

  useEffect(() => {
    if (title !== '') {
      moveFocusToLast();
    }
  }, [title]);

  useEffect(() => {
    if (currentIndex !== undefined && data.length > 0) {
      const visibleNotes = data.filter((note) =>
        displayArchived
          ? note.content.archived
          : !note.content.archived && !note.content.pinned
      );
      const indexes = visibleNotes.map((note) =>
        data.findIndex((obj) => obj.id === note.id)
      );
      setSelectedIndex(indexes[currentIndex]);
      itemsRef.current.children.length > 0 &&
        itemsRef.current.children[currentIndex].firstChild.focus();
    }
  }, [currentIndex, displayArchived, data.length]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        !contextMenuRef.current ||
        (contextMenuRef.current && !contextMenuRef.current.contains(e.target))
      ) {
        setContextMenuShow(false);
      }
    }

    function handleKeyDown(e) {
      const visibleNotes = data.filter((note) =>
        displayArchived
          ? note.content.archived
          : !note.content.archived && !note.content.pinned
      );
      const indexes = visibleNotes.map((note) =>
        data.findIndex((obj) => obj.id === note.id)
      );
      switch (e.key) {
        case 'Enter':
          if (isEditingTitle) {
            textRef.current.focus();
          }
          break;
        case 'n':
          if (e.ctrlKey) {
            addNote();
          }
          break;
        case 'ArrowDown':
          if (e.metaKey) {
            e.preventDefault();
            setCurrentIndex((prev) => (prev + 1) % indexes.length);
          }
          break;
        case 'ArrowUp':
          if (e.metaKey && currentIndex > 0) {
            e.preventDefault();
            setCurrentIndex((prev) => prev - 1);
          }
          break;
        case 'Backspace':
          if (e.ctrlKey) {
            e.preventDefault();
            deleteNote(data[selectedIndex].id);
          }
          break;
        case 'Tab':
          e.preventDefault();
          break;
        default:
          break;
      }
    }

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    contextMenuRef,
    textRef,
    titleRef,
    isEditingTitle,
    selectedIndex,
    displayArchived,
  ]);

  useEffect(() => {
    if (rightClickedNote) {
      switch (selectedContextMenu) {
        case 'pin':
          pinNote(rightClickedNote.id, rightClickedNote.content);
          setSelectedContextMenu('');
          break;
        case 'archive':
          const isArchived = rightClickedNote.content.archived;
          isArchived
            ? restoreNote(rightClickedNote.id, rightClickedNote.content)
            : archiveNote(rightClickedNote.id, rightClickedNote.content);
          setSelectedContextMenu('');
          break;
        case 'delete':
          deleteNote(rightClickedNote.id);
          setSelectedContextMenu('');
          break;
        default:
          break;
      }
    }
    return;
  }, [selectedContextMenu]);

  useEffect(() => {
    if (rightClickedNote) {
      const noteContent = rightClickedNote.content;
      const contextMenu = [...contextMenuOptions];
      contextMenu[0].label = noteContent.pinned ? 'Unpin Note' : 'Pin Note';
      contextMenu[1].label = noteContent.archived
        ? 'Restore Note'
        : 'Archive Note';
      setContextMenuOptions(contextMenu);
    }
  }, [rightClickedNote]);

  useEffect(() => {
    if (selectedTask && data.length > 0) {
      const searchedNoteIndex = data.findIndex(
        (item) => item.id === selectedTask.id
      );
      setSelectedIndex(searchedNoteIndex);
    }
  }, [selectedTask, data]);

  if (!data) {
    return;
  }
  return (
    <Wrapper>
      <Menu>
        <IconWrapper>
          <SearchBarWrapper>
            <SearchBar
              onChange={searchNote}
              autocompleteDisplay='none'
              zIndex='10'
            />
          </SearchBarWrapper>
          {/* <Icon
            width='40px'
            imgUrl={displayArchived ? visibleDoc : archive}
            onClick={displayNotes}
          /> */}
          <Icon width='40px' type='add' onClick={addNote} />
        </IconWrapper>
        <MenuContent>
          <ItemsWrapper>
            <CategoryText>pinned</CategoryText>
            <Items>
              {data.map((note, index) =>
                note.content.pinned ? (
                  selectedIndex === index ? (
                    <SelectedContainer
                      key={index}
                      onContextMenu={(e) => rightClick(e, index)}
                    >
                      <Title>{note.content.title}</Title>
                    </SelectedContainer>
                  ) : (
                    <ItemWrapper key={index}>
                      <Item
                        key={index}
                        onClick={() => clickNote(index)}
                        onContextMenu={(e) => rightClick(e, index)}
                      >
                        <Title>{note.content.title}</Title>
                      </Item>
                      {data.filter((note) => note.content.pinned).length > 1 ? (
                        <SplitLine />
                      ) : null}
                    </ItemWrapper>
                  )
                ) : null
              )}
            </Items>
          </ItemsWrapper>
          <ItemsWrapper>
            <CategoryText>notes</CategoryText>
            <Items ref={itemsRef}>
              {data.map((note, index) =>
                displayArchived ? (
                  note.content.archived ? (
                    selectedIndex === index ? (
                      <SelectedContainer
                        key={index}
                        onContextMenu={(e) => rightClick(e, index)}
                      >
                        <Title>{note.content.title}</Title>
                      </SelectedContainer>
                    ) : (
                      <ItemWrapper key={index}>
                        <Item
                          key={index}
                          onClick={() => clickNote(index)}
                          onContextMenu={(e) => rightClick(e, index)}
                        >
                          <Title>{note.content.title}</Title>
                        </Item>
                        <SplitLine />
                      </ItemWrapper>
                    )
                  ) : null
                ) : note.content.archived || note.content.pinned ? null : (
                  <ItemWrapper>
                    <Item
                      key={index}
                      ref={contextMenuRef}
                      onClick={() => clickNote(index)}
                      onContextMenu={(e) => rightClick(e, index)}
                      selected={selectedIndex === index}
                      tabIndex='-1'
                    >
                      <Title>{note.content.title}</Title>
                    </Item>
                    {selectedIndex !== index && <SplitLine />}
                  </ItemWrapper>
                )
              )}
            </Items>
          </ItemsWrapper>
          <Item onClick={() => displayNotes()} backgroundColor='#a4a4a3'>
            <ReactIconWrapper>
              <RiInboxArchiveFill size={30} />
            </ReactIconWrapper>
            <Title>{displayArchived ? 'Active Notes' : 'Archived Notes'}</Title>
          </Item>
        </MenuContent>
      </Menu>
      {
        <Editor>
          {data[selectedIndex]?.content ? (
            <>
              <EditorHeader>
                <EditorDate>
                  {data[selectedIndex].content.created_time
                    ? parseTimestamp(data[selectedIndex].content?.created_time)
                    : null}
                </EditorDate>
              </EditorHeader>
              {/* <EditorTitle>{selectedNote.content.title}</EditorTitle> */}
              <EditorTitle
                contentEditable
                suppressContentEditableWarning
                // dangerouslySetInnerHTML={{ __html: title }}
                onInput={handleTitleChange}
                onFocus={() => {
                  setIsEditingTitle(true);
                  setIsEditingNote(true);
                }}
                ref={titleRef}
              >
                {titleForDisplay}
              </EditorTitle>
              <CommandNote />
            </>
          ) : null}
        </Editor>
      }
      {contextMenuPos && (
        <ContextMenu
          options={contextMenuOptions}
          display={contextMenuShow ? 'block' : 'none'}
          top={`${contextMenuPos.y}px`}
          left={`${contextMenuPos.x}px`}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 950px;
  margin: 75px auto;
  display: flex;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  border-radius: 20px;
`;

const Menu = styled.div`
  box-sizing: border-box;
  width: 380px;
  background-color: 'black';
  padding: 35px 18px;
  display: flex;
  flex-direction: column;
  gap: 54px;
  background-color: black;
  flex-shrink: 0;
  overflow: auto;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;

  &::-webkit-scrollbar {
    background-color: #1b2028;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a4a4a3;
  }

  &::-webkit-scrollbar-track {
    background-color: #1b2028;
  }

  &::-webkit-scrollbar-corner {
    background-color: #1b2028;
  }
`;

const Editor = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  background-color: #1b2028;
  padding: 57px 80px;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const IconWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuContent = styled.div`
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 80px;
`;

const Item = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  box-sizing: border-box;
  padding: 0 25px;
  width: 100%;
  margin-top: auto;
  border-radius: 10px;
  cursor: pointer;
  background-color: ${(props) => (props.selected ? '#3a6ff7' : null)};

  &:focus {
    outline: none;
  }
`;

const Title = styled.div`
  font-size: 24px;
  line-height: 70px;
  opacity: 1;
  letter-spacing: 3px;
`;

const SelectedContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  padding: 0 25px;
  background-color: #3a6ff7;
  color: inherit;
  border-radius: 10px;
`;

const EditorDate = styled.div`
  width: 100%;
  text-align: center;
  color: #a4a4a3;
  font-weight: 500;
  letter-spacing: 1px;
`;

const EditorTitle = styled.div`
  height: 70px;
  width: 100%;
  font-size: 36px;
  font-weight: 800;
  color: white;
  letter-spacing: 3px;
  margin-bottom: 50px;
  outline: none;
`;

const EditorHeader = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 42px;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: 1px solid #a4a4a3;
  margin: 0;
`;

const ItemWrapper = styled.div`
  box-sizing: border-box;
  height: 70px;
`;

const SearchBarWrapper = styled.div``;

const ReactIconWrapper = styled.div``;

const CategoryText = styled.div`
  color: #a4a4a3;
`;

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

const ItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
