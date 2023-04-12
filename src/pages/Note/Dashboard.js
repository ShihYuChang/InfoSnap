import { useEffect, useState, useContext, useRef } from 'react';
import styled from 'styled-components/macro';
import CommandNote from './CommandNote';
import Mask from '../../components/Mask';
import Exit from '../../components/Buttons/Exit';
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
} from 'firebase/firestore';
import { UserContext } from '../../context/userContext';
import { getUserEmail } from '../../utils/Firebase';

const Wrapper = styled.div`
  width: 800px;
  margin: 50px auto;
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  row-gap: 30px;
  column-gap: 20px;
`;

const Card = styled.div`
  min-height: 150px;
  border: 1px solid black;
  padding: 30px 20px 20px 20px;
  cursor: pointer;
`;

const CardContainer = styled.div`
  position: relative;
`;

const TitleContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const AddNote = styled.button`
  font-size: 30px;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
  margin-right: auto;
`;

const SearchBar = styled.input`
  width: 150px;
  height: 30px;
  border-radius: 8px;
`;

const PinButton = styled.button`
  width: 50px;
  height: 20px;
  background: black;
  color: white;
  border: 0;
  position: absolute;
  top: 3px;
  right: 50px;
  cursor: pointer;
`;

export default function Dashboard() {
  const { email, setEmail } = useContext(UserContext);
  const { data, setData, setSelectedNote, setSelectedIndex } =
    useContext(NoteContext);
  const { isAdding, setIsAdding } = useContext(StateContext);
  const [userInput, setUserInput] = useState('');
  const dataRef = useRef(null);

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

  async function deleteNote(index) {
    const targetDoc = data[index].id;
    await deleteDoc(doc(db, 'Users', email, 'Notes', targetDoc));
  }

  async function addNote() {
    await addDoc(collection(db, 'Users', email, 'Notes'), {
      archived: false,
      context: 'New Card',
      image_url: null,
      pinned: false,
      title: 'Saved Note',
      created_time: serverTimestamp(),
    });
  }

  function handleInput(e) {
    const inputValue = e.target.value;
    const inputValueWithNoWhitespace = inputValue
      .replace(/\s/g, '')
      .toLowerCase();
    setUserInput(inputValue);
    const notes = dataRef.current;
    const matchedCards = notes.filter((note) =>
      note.content.context
        .toLowerCase()
        .replace(/<\/?(h1|h2|h3|div|br)[^>]*>|&nbsp;|(\r\n|\n|\r|\t|\s+)/gi, '')
        .trim()
        .includes(inputValueWithNoWhitespace)
    );
    setData(inputValue === ' ' ? notes : matchedCards);
  }

  async function pinNote(id, note) {
    const newNote = note;
    newNote.pinned = true;
    await setDoc(doc(db, 'Users', email, 'Notes', id), newNote);
    alert('Pinned!');
  }

  return (
    <>
      <Mask display={isAdding ? 'block' : 'none'} />
      <Wrapper>
        <p>
          (1)
          某天，一位小孩問他的爸爸：「爸爸，你什麼時候開始變成老頭子的？」爸爸回答道：「我想應該是在你媽媽開始叫我『親愛的』的時候吧。」小孩皺起眉頭說：「那我想媽媽一定很快就變成老太婆了！」
        </p>
        <p>
          (2)
          當一個人心情不好時，有人建議他去找笑話書來讀。於是他去圖書館借了一本，但是借回家開始讀之後，他不停地看到「下一頁」這三個字，卻一直都沒看到「笑話」這兩個字，最後他只好把書還回圖書館，但他還是大聲地吐槽說：「這本笑話書沒有笑話，只有下一頁。」
        </p>
        <p>
          (3)
          一天，一位女士到蛋糕店買了一個巨大的蛋糕，店員問她這個蛋糕是要用來慶祝什麼日子的。女士回答：「這個蛋糕是給我先生的生日用的。」店員接著問：「你先生幾歲了？」女士回答：「他今年一百零一歲了。」店員聽了之後感到驚訝，但是她很有禮貌地問女士：「那麼您先生的生日蛋糕通常是要切幾塊呢？」女士想了想，回答道：「我猜應該切成四塊吧，因為他現在已經沒有牙齒了。」
        </p>
        <hr />
        <TitleContainer>
          <h2>Collected Notes</h2>
          <AddNote onClick={addNote}>+</AddNote>
          <SearchBar
            value={userInput}
            onChange={(e) => {
              handleInput(e);
            }}
          />
        </TitleContainer>
        <CommandNote display={isAdding ? 'flex' : 'none'} />
        <Cards>
          {data
            ? data.map((note, index) => {
                return (
                  <CardContainer key={index}>
                    <PinButton
                      onClick={() => {
                        pinNote(note.id, note.content);
                      }}
                    >
                      Pin
                    </PinButton>
                    <Card
                      id={index}
                      onClick={() => clickCard(index)}
                      dangerouslySetInnerHTML={{ __html: note.content.context }}
                      suppressContentEditableWarning
                    ></Card>
                    <Exit
                      top='0'
                      right='0'
                      handleClick={() => deleteNote(index)}
                      display={isAdding ? 'none' : 'block'}
                    >
                      X
                    </Exit>
                  </CardContainer>
                );
              })
            : null}
        </Cards>
      </Wrapper>
    </>
  );
}
