import { useEffect, useState, useContext, useRef, useCallback } from 'react';
import _ from 'lodash';
import styled from 'styled-components/macro';
import archive from './img/archive.png';
import trash from './img/trash.png';
import view from './img/view.png';
import CommandNote from './CommandNote';
import hidden from './img/hidden.png';
import visibleDoc from './img/doc.png';
import { StateContext } from '../../context/stateContext';
import { NoteContext } from './noteContext';
import { db } from '../../firebase';
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  addDoc,
  setDoc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { UserContext } from '../../context/userContext';
import { getUserEmail } from '../../utils/Firebase';
import Icon from '../../components/Icon';
import SearchBar from '../../components/SearchBar/SearchBar';

// const Wrapper = styled.div`
//   width: 800px;
//   margin: 50px auto;
// `;

// const Cards = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr 1fr;
//   row-gap: 30px;
//   column-gap: 20px;
// `;

// const Card = styled.div`
//   min-height: 150px;
//   border: 1px solid black;
//   padding: 30px 20px 20px 20px;
//   cursor: pointer;
// `;

// const CardContainer = styled.div`
//   position: relative;
// `;

// const TitleContainer = styled.div`
//   display: flex;
//   gap: 20px;
//   align-items: center;
// `;

// const AddNote = styled.button`
//   font-size: 30px;
//   border: 0;
//   background: none;
//   padding: 0;
//   cursor: pointer;
//   margin-right: auto;
// `;

// const SearchBar = styled.input`
//   width: 150px;
//   height: 30px;
//   border-radius: 8px;
// `;

// const Button = styled.button`
//   width: 70px;
//   height: 20px;
//   background: black;
//   color: white;
//   border: 0;
//   position: absolute;
//   top: ${(props) => props.top};
//   right: ${(props) => props.right};
//   cursor: pointer;
//   display: ${(props) => props.display};
// `;

// const ArchiveBtn = styled.button`
//   width: 150px;
//   height: 30px;
// `;

export default function Dashboard() {
  const { email, setEmail } = useContext(UserContext);
  const {
    data,
    setData,
    setSelectedNote,
    setSelectedIndex,
    selectedIndex,
    selectedNote,
  } = useContext(NoteContext);
  const { isAdding, setIsAdding } = useContext(StateContext);
  const [displayArchived, setDisplayArchived] = useState(false);
  const [userInput, setUserInput] = useState('');
  const dataRef = useRef(null);
  const [title, setTitle] = useState(
    searchNote.content ? selectedNote.content.title : ''
  );
  const inputRef = useRef(null);
  const debounce = useCallback(
    _.debounce((input) => {
      editTitle(input);
    }, 800),
    []
  );

  async function editTitle(text) {
    const targetDoc = selectedNote.id;
    await updateDoc(doc(db, 'Users', email, 'Notes', targetDoc), {
      archived: false,
      context: selectedNote.content.context,
      image_url: null,
      pinned: false,
      title: text,
      created_time: serverTimestamp(),
    });
  }

  useEffect(() => {
    getUserEmail(setEmail);
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

  function clickCard(index) {
    setIsAdding(true);
    setSelectedIndex(index);
    setSelectedNote(data[index]);
  }

  async function deleteNote() {
    const targetDoc = selectedNote.id;
    await deleteDoc(doc(db, 'Users', email, 'Notes', targetDoc));
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
    newNote.pinned ? alert('Pinned!') : alert('Unpinned!');
  }

  async function archiveNote(id, note) {
    const newNote = note;
    newNote.archived = true;
    await updateDoc(doc(db, 'Users', email, 'Notes', id), newNote);
    alert('Archived!');
  }

  async function restoreNote(id, note) {
    const newNote = note;
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
    let originalDateTime = new Date(formattedDate + ' UTC');
    if (originalDateTime.getHours() === 24) {
      originalDateTime.setHours(0);
      originalDateTime.setDate(originalDateTime.getDate() + 1);
    }
    let convertedDateStr = originalDateTime.toISOString().slice(0, 10);
    let convertedTimeStr = originalDateTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    if (convertedTimeStr.startsWith('24')) {
      convertedTimeStr = '00' + convertedTimeStr.slice(2);
    }
    let convertedDateTimeStr = convertedDateStr + ' ' + convertedTimeStr;
    return convertedDateTimeStr;
  }

  function handleTitleChange(e) {
    setTitle(e.target.innerHTML);
    debounce(e.target.innerHTML);
  }

  function moveFocusToLast() {
    const range = document.createRange();
    range.selectNodeContents(inputRef.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // useEffect(() => {
  //   if (data) {
  //     const firstVisibleNote = data.findIndex((note) => note.content.archived);
  //     console.log(firstVisibleNote);
  //     return firstVisibleNote;
  //   }
  //   return;
  // }, []);

  useEffect(() => {
    if (title !== '') {
      moveFocusToLast();
    }
  }, [title]);

  // return (
  //   <>
  //     <Mask display={isAdding ? 'block' : 'none'} />
  //     <Wrapper>
  //       <p>
  //         (1)
  //         某天，一位小孩問他的爸爸：「爸爸，你什麼時候開始變成老頭子的？」爸爸回答道：「我想應該是在你媽媽開始叫我『親愛的』的時候吧。」小孩皺起眉頭說：「那我想媽媽一定很快就變成老太婆了！」
  //       </p>
  //       <p>
  //         (2)
  //         當一個人心情不好時，有人建議他去找笑話書來讀。於是他去圖書館借了一本，但是借回家開始讀之後，他不停地看到「下一頁」這三個字，卻一直都沒看到「笑話」這兩個字，最後他只好把書還回圖書館，但他還是大聲地吐槽說：「這本笑話書沒有笑話，只有下一頁。」
  //       </p>
  //       <p>
  //         (3)
  //         一天，一位女士到蛋糕店買了一個巨大的蛋糕，店員問她這個蛋糕是要用來慶祝什麼日子的。女士回答：「這個蛋糕是給我先生的生日用的。」店員接著問：「你先生幾歲了？」女士回答：「他今年一百零一歲了。」店員聽了之後感到驚訝，但是她很有禮貌地問女士：「那麼您先生的生日蛋糕通常是要切幾塊呢？」女士想了想，回答道：「我猜應該切成四塊吧，因為他現在已經沒有牙齒了。」
  //       </p>
  //       <hr />
  //       <TitleContainer>
  //         <h2>Collected Notes</h2>
  //         <AddNote onClick={addNote}>+</AddNote>
  //         <ArchiveBtn
  //           onClick={() => {
  //             displayNotes();
  //           }}
  //         >
  //           {displayArchived ? 'Current Note' : 'Archived Notes'}
  //         </ArchiveBtn>
  //         <SearchBar
  //           value={userInput}
  //           onChange={(e) => {
  //             searchNote(e);
  //           }}
  //         />
  //       </TitleContainer>
  //       <CommandNote display={isAdding ? 'flex' : 'none'} />
  //       <Cards>
  //         {data
  //           ? data.map((note, index) => {
  //               return displayArchived ? (
  //                 note.content.archived ? (
  //                   <CardContainer key={index}>
  //                     <Button
  //                       top={'3px'}
  //                       right={'150px'}
  //                       onClick={() => {
  //                         pinNote(note.id, note.content);
  //                       }}
  //                       display='none'
  //                     >
  //                       Pin
  //                     </Button>
  //                     <Button
  //                       top={'3px'}
  //                       right={'50px'}
  //                       onClick={() => {
  //                         restoreNote(note.id, note.content);
  //                       }}
  //                     >
  //                       Restore
  //                     </Button>
  //                     <Card
  //                       id={index}
  //                       onClick={() => clickCard(index)}
  //                       dangerouslySetInnerHTML={{
  //                         __html: note.content.context,
  //                       }}
  //                     ></Card>
  //                     <Exit
  //                       top='0'
  //                       right='0'
  //                       handleClick={() => deleteNote(index)}
  //                       display={isAdding ? 'none' : 'block'}
  //                     >
  //                       X
  //                     </Exit>
  //                   </CardContainer>
  //                 ) : null
  //               ) : note.content.archived ? null : (
  //                 <CardContainer key={index}>
  //                   <Button
  //                     top={'3px'}
  //                     right={'150px'}
  //                     onClick={() => {
  //                       pinNote(note.id, note.content);
  //                     }}
  //                     display={displayArchived ? 'none' : 'block'}
  //                   >
  //                     {note.content.pinned ? 'Unpin' : 'Pin'}
  //                   </Button>
  //                   <Button
  //                     top={'3px'}
  //                     right={'50px'}
  //                     onClick={() => {
  //                       displayArchived
  //                         ? restoreNote(note.id, note.content)
  //                         : archiveNote(note.id, note.content);
  //                     }}
  //                   >
  //                     {displayArchived ? 'Restore' : 'Archive'}
  //                   </Button>
  //                   <Card
  //                     id={index}
  //                     onClick={() => clickCard(index)}
  //                     dangerouslySetInnerHTML={{ __html: note.content.context }}
  //                     suppressContentEditableWarning
  //                   ></Card>
  //                   <Exit
  //                     top='0'
  //                     right='0'
  //                     handleClick={() => deleteNote(index)}
  //                     display={isAdding ? 'none' : 'block'}
  //                   >
  //                     X
  //                   </Exit>
  //                 </CardContainer>
  //               );
  //             })
  //           : null}
  //       </Cards>
  //     </Wrapper>
  //   </>
  // );
  if (!data) {
    return;
  }
  return (
    <Wrapper>
      <Menu>
        <IconWrapper>
          <Icon
            width='40px'
            imgUrl={displayArchived ? visibleDoc : archive}
            onClick={displayNotes}
          />
          <Icon
            width='40px'
            imgUrl={displayArchived ? view : hidden}
            onClick={() =>
              displayArchived
                ? restoreNote(selectedNote.id, selectedNote.content)
                : archiveNote(selectedNote.id, selectedNote.content)
            }
          />
          <Icon width='40px' imgUrl={trash} onClick={deleteNote} />
          <Icon width='40px' type='add' onClick={addNote} />
        </IconWrapper>
        <MenuContent>
          {data.map((note, index) =>
            displayArchived ? (
              note.content.archived ? (
                selectedIndex === index ? (
                  <SelectedContainer key={index}>
                    <Title>{note.content.title}</Title>
                  </SelectedContainer>
                ) : (
                  <Item key={index} onClick={() => clickCard(index)}>
                    <Title>{note.content.title}</Title>
                  </Item>
                )
              ) : null
            ) : note.content.archived ? null : selectedIndex === index ? (
              <SelectedContainer key={index}>
                <Title>{note.content.title}</Title>
              </SelectedContainer>
            ) : (
              <Item key={index} onClick={() => clickCard(index)}>
                <Title>{note.content.title}</Title>
              </Item>
            )
          )}
        </MenuContent>
      </Menu>
      {
        <Editor>
          {selectedNote.content ? (
            <>
              <EditorHeader>
                <EditorDate>
                  {parseTimestamp(selectedNote.content.created_time)}
                </EditorDate>
                <SearchBar onChange={searchNote} />
              </EditorHeader>
              {/* <EditorTitle>{selectedNote.content.title}</EditorTitle> */}
              <EditorTitle
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: title }}
                onInput={handleTitleChange}
                ref={inputRef}
              />
              <CommandNote />
            </>
          ) : null}
        </Editor>
      }
    </Wrapper>
  );
}

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-height: 800px;
  margin: 75px auto;
  display: flex;
`;

const Menu = styled.div`
  box-sizing: border-box;
  width: 380px;
  min-height: 800px;
  background-color: 'black';
  padding: 35px 18px;
  display: flex;
  flex-direction: column;
  gap: 54px;
  background-color: black;
  flex-shrink: 0;
`;

const Editor = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  min-height: 800px;
  background-color: #1b2028;
  padding: 57px 80px;
`;

const IconWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const MenuContent = styled.div`
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

const Item = styled.div`
  box-sizing: border-box;
  padding: 0 25px;
  width: 100%;
  height: 70px;
  border-bottom: 3px solid #9e9e9e;
  cursor: pointer;
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: 600;
  line-height: 70px;
  color: white;
  opacity: 1;
  letter-spacing: 1px;
`;

const SelectedContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  padding: 0 25px;
  background-color: #a4a4a3;
  color: inherit;
  border-radius: 10px;
`;

const EditorDate = styled.div`
  width: 100%;
  text-align: center;
  color: #a4a4a3;
  font-weight: 500;
  font-size: 24px;
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
