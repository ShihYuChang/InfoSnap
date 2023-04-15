import { useEffect, useState, useContext } from 'react';
import { EventContext } from '../../context/eventContext';
import {
  setDoc,
  doc,
  Timestamp,
  deleteDoc,
  addDoc,
  collection,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { UserContext } from '../../context/userContext';
import PopUp from '../../components/PopUp/PopUp';
import Mask from '../../components/Mask';
import styled from 'styled-components/macro';
import trash from './trash.png';

function allowDrop(event) {
  event.preventDefault();
}

const questions = [
  { label: 'Start', value: 'startDate', type: 'date' },
  { label: 'Expire', value: 'expireDate', type: 'date' },
  { label: 'Task', value: 'task', type: 'text' },
];

export default function Board() {
  const { email } = useContext(UserContext);
  const { cardDb, setCardDb, events } = useContext(EventContext);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasDraggedOver, setHasDraggedOver] = useState(false);
  const [hasAddedClonedCard, setHasAddedClonedCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [hoveringBox, setHoveringBox] = useState(null);
  const [hoveringCard, setHoveringCard] = useState(null);
  const invisibleCard = {
    summary: '',
    status: hoveringBox,
    start: '',
    end: '',
    visible: false,
    canHover: false,
  };
  function dragStart(e) {
    setIsDragging(true);
    setSelectedCard({
      ...cardDb[Number(e.target.id)],
      // summary: e.target.value,
      id: Number(e.target.id),
      parentId: e.target.parentNode.id,
    });
  }

  function getTimestamp(date) {
    const now = new Date(date);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
  }

  function getDbFormatData(obj) {
    const data = JSON.parse(JSON.stringify(obj));
    const startDate_timestamp = getTimestamp(data.start.date);
    const expireDate_timestamp = getTimestamp(data.end.date);
    data.start.date = startDate_timestamp;
    data.end.date = expireDate_timestamp;
    const dbFormatCard = {
      task: data.summary,
      status: data.status,
      startDate: data.start.date,
      expireDate: data.end.date,
    };

    return dbFormatCard;
  }

  function editCard(e) {
    const card = JSON.parse(JSON.stringify(selectedCard));
    card.status = e.target.id;
    setDoc(doc(db, 'Users', email, 'Tasks', card.docId), getDbFormatData(card));
  }

  function drop(e) {
    e.preventDefault();
    editCard(e);
    addClonedCard(e);
    setHasAddedClonedCard(true);
    setHasDraggedOver(false);
    setIsDragging(false);
  }

  function addInvisibleCard(e) {
    if (Number(e.target.id) !== selectedCard.id && !hasDraggedOver) {
      const cards = [...cardDb];
      const targetIndex = Number(e.target.id);
      cards.splice(targetIndex, 0, invisibleCard);
      setCardDb(cards);
    }
  }

  function addClonedCard(e) {
    const cards = [...cardDb];
    const targetIndex = Number(e.target.id);
    const clonedCard = {
      summary: selectedCard.summary,
      start: selectedCard.start,
      end: selectedCard.end,
      status: e.target.parentNode.id,
      visible: true,
    };
    isNaN(targetIndex)
      ? cards.push({
          summary: selectedCard.summary,
          start: selectedCard.start,
          end: selectedCard.end,
          status: hoveringBox,
          visible: 'true',
        })
      : cards.splice(targetIndex, 1, clonedCard);
    setCardDb(cards);
  }

  function dragOver(e) {
    const hoveringCardVisiblity = cardDb[Number(hoveringCard)].visible;
    if (
      !hasDraggedOver &&
      Number(e.target.id) !== selectedCard.id &&
      hoveringCardVisiblity
    ) {
      addInvisibleCard(e);
      setHasDraggedOver(true);
      setHoveringCard(e.target.id);
    }
  }

  function hoverOnBox(e) {
    allowDrop(e);
    const parentId = e.target.parentNode.id;
    parentId === selectedCard.parentId || parentId === ''
      ? setHasDraggedOver(false)
      : setHasDraggedOver(true);
    !hasDraggedOver && setHoveringBox(e.target.id);
  }

  function removeDraggedCard() {
    const cards = [...cardDb];
    cards.splice(selectedCard.id, 1);
    setCardDb(cards);
  }

  function deleteCard(index) {
    const targetId = cardDb[index].docId;
    deleteDoc(doc(db, 'Users', email, 'Tasks', targetId));
    alert('Card Deleted');
  }

  function addCard(e) {
    const now = new Date();
    const startDate = Timestamp.fromDate(now);
    const tomorrowTimestamp = now.getTime() + 24 * 60 * 60 * 1000;
    const tomorrow = new Date();
    tomorrow.setTime(tomorrowTimestamp);
    const expireDate = Timestamp.fromDate(tomorrow);
    const board = e.target.parentNode.parentNode.id;
    const newCard = {
      task: 'New Task',
      status: board,
      startDate: startDate,
      expireDate: expireDate,
    };
    addDoc(collection(db, 'Users', email, 'Tasks'), newCard);
  }

  function editCard() {
    setIsEditing(true);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (e && e.key === 'Escape') {
        setIsEditing(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    hasAddedClonedCard && removeDraggedCard();
    setHasAddedClonedCard(false);
  }, [hasAddedClonedCard]);

  useEffect(() => {
    setCardDb(events);
  }, [events]);

  if (!cardDb) {
    return;
  }
  return (
    <>
      <Mask display={isEditing ? 'block' : 'none'} />
      <PopUp display={isEditing ? 'flex' : 'none'}>
        {questions.map((question, index) => (
          <Question key={index}>
            <QuestionLabel>{question.label}</QuestionLabel>
            <QuestionInput type={question.type} />
          </Question>
        ))}
      </PopUp>
      <Wrapper
        onDragOver={(event) => {
          allowDrop(event);
        }}
      >
        {/* <button onClick={removeDraggedCard}>Remove Old Card</button> */}

        <Container>
          <Box
            type='text'
            className='box'
            onDrop={drop}
            onDragOver={(event) => {
              hoverOnBox(event);
            }}
            id='to-do'
          >
            <BoxHeader>
              <BoxTitle>To-Do</BoxTitle>
              <AddCardBtn onClick={addCard}>+</AddCardBtn>
            </BoxHeader>
            {cardDb.map((card, index) =>
              card.status === 'to-do' ? (
                <CardWrapper>
                  <Card
                    onClick={() => {
                      editCard();
                    }}
                    onDragStart={dragStart}
                    onDragOver={dragOver}
                    draggable={card.visible ? true : false}
                    id={index}
                    key={index}
                    backgroundColor={card.visible ? 'white' : '#E0E0E0'}
                    border={card.visible ? '1px solid black' : 'none'}
                    // opacity={isDragging && index === selectedCard.id ? 0.5 : 1}
                    dangerouslySetInnerHTML={{
                      __html: !card.visible
                        ? ''
                        : `${card.summary}<br />${
                            card.start.date ??
                            card.start.dateTime.replace('T', ' ').slice(0, -9)
                          } to ${
                            card.end.date ??
                            card.end.dateTime.replace('T', ' ').slice(0, -9)
                          }`,
                    }}
                  />
                  <RemoveIcon onClick={() => deleteCard(index)} />
                </CardWrapper>
              ) : null
            )}
          </Box>
          <Box
            type='text'
            className='box'
            onDrop={drop}
            onDragOver={(e) => {
              hoverOnBox(e);
            }}
            id='doing'
          >
            <BoxHeader>
              <BoxTitle>Doing</BoxTitle>
              <AddCardBtn onClick={addCard}>+</AddCardBtn>
            </BoxHeader>
            {cardDb.map((card, index) => {
              return card.status === 'doing' ? (
                <CardWrapper>
                  <Card
                    onDragStart={dragStart}
                    onDragOver={dragOver}
                    draggable={true}
                    id={index}
                    key={index}
                    value={
                      !card.visible
                        ? ''
                        : `${card.summary}\n\n${
                            card.start.date ??
                            card.start.dateTime.replace('T', ' ').slice(0, -9)
                          } to ${
                            card.end.date ??
                            card.end.dateTime.replace('T', ' ').slice(0, -9)
                          }`
                    }
                    backgroundColor={card.visible ? 'white' : '#E0E0E0'}
                    border={card.visible ? '1px solid black' : 'none'}
                    // opacity={isDragging && index === selectedCard.id ? 0.01 : 1}
                    readOnly
                  />
                  <RemoveIcon onClick={() => deleteCard(index)} />
                </CardWrapper>
              ) : null;
            })}
          </Box>
          <Box
            type='text'
            className='box'
            onDrop={drop}
            onDragOver={(e) => {
              hoverOnBox(e);
            }}
            id='done'
          >
            <BoxHeader>
              <BoxTitle>Done</BoxTitle>
              <AddCardBtn onClick={addCard}>+</AddCardBtn>
            </BoxHeader>
            {cardDb.map((card, index) => {
              return card.status === 'done' ? (
                <CardWrapper>
                  <Card
                    onDragStart={dragStart}
                    onDragOver={dragOver}
                    draggable={true}
                    id={index}
                    key={index}
                    backgroundColor={card.visible ? 'white' : '#E0E0E0'}
                    border={card.visible ? '1px solid black' : 'none'}
                    value={
                      !card.visible
                        ? ''
                        : `${card.summary}\n\n${
                            card.start.date ??
                            card.start.dateTime.replace('T', ' ').slice(0, -9)
                          } to ${
                            card.end.date ??
                            card.end.dateTime.replace('T', ' ').slice(0, -9)
                          }`
                    }
                    // opacity={isDragging && index === selectedCard.id ? 0.01 : 1}
                    readOnly
                  />
                  <RemoveIcon onClick={() => deleteCard(index)} />
                </CardWrapper>
              ) : null;
            })}
          </Box>
        </Container>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
`;

const Container = styled.div`
  width: 1200px;
  display: flex;
  gap: 50px;
  margin: 20px auto;
`;
const Box = styled.div`
  width: 300px;
  min-height: 900px;
  padding: 30px;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: #d0d0d0;
`;

const BoxHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

const CardWrapper = styled.div`
  position: relative;
`;

const Card = styled.div`
  width: 300px;
  height: 200px;
  background-color: ${(props) => props.backgroundColor};
  text-align: center;
  border: ${(props) => props.border};
  opacity: ${(props) => props.opacity};
  text-align: left;
  font-size: 20px;
  cursor: pointer;
`;

const AddCardBtn = styled.button`
  width: 100px;
  height: 20px;
  cursor: pointer;
  font-size: 30px;
  background: none;
  border: 0;
`;

const RemoveIcon = styled.div`
  width: 20px;
  height: 20px;
  background-image: url(${trash});
  background-size: cover;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

const BoxTitle = styled.h1`
  font-size: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  width: 200px;
`;

const TransparentCard = styled.div`
  width: 300px;
  height: 200px;
`;

const Question = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
`;

const QuestionLabel = styled.label`
  width: 150px;
  font-size: 20px;
`;

const QuestionInput = styled.input`
  width: 150px;
  height: 20px;
`;
