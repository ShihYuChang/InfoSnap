import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import trash from './trash.png';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
`;

const Container = styled.div`
  width: 1200px;
  display: flex;
  gap: 50px;
  margin: 100px auto;
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

const Card = styled.textarea`
  width: 300px;
  height: 200px;
  background-color: white;
  text-align: center;
  border: 1px solid black;
  opacity: ${(props) => props.opacity};
  text-align: left;
  font-size: 20px;
  cursor: pointer;
`;

const AddCardBtn = styled.button`
  width: 100px;
  height: 50px;
  cursor: pointer;
`;

const CardContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RemoveIcon = styled.div`
  width: 20px;
  height: 20px;
  background-image: url(${trash});
  background-size: cover;
  cursor: pointer;
`;

const BoxTitle = styled.h1`
  font-size: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
`;

const TransparentCard = styled.div`
  width: 300px;
  height: 200px;
`;

function allowDrop(event) {
  event.preventDefault();
}

export default function Drag() {
  const cards = [
    { title: 'Task A', status: 'to-do', visible: true },
    { title: 'Task B', status: 'to-do', visible: false },
    { title: 'Task E', status: 'to-do', visible: true },
    { title: 'Task C', status: 'doing', visible: true },
    { title: 'Task D', status: 'done', visible: true },
  ];
  const [db, setDb] = useState(cards);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDraggedOver, setHasDraggedOver] = useState(false);
  const [selectedCard, setSelectedCard] = useState();
  const [draggingCardId, setDraggingCardId] = useState(null);
  function dragStart(event) {
    event.dataTransfer.setData('Text', event.target.id);
    setSelectedCard(Number(event.target.id));
    setDraggingCardId(event.target.id);
    setIsDragging(true);
  }

  function drop(event) {
    const cards = [...db];
    event.preventDefault();
    const data = event.dataTransfer.getData('Text');
    const draggedElement = document.getElementById(data);
    if (event.target.className.includes('box')) {
      event.target.appendChild(draggedElement);
    }
    setIsDragging(false);
    setHasDraggedOver(false);
  }

  function addCard() {
    setDb([...db, 'Task C']);
  }

  function deleteCard(index) {
    const data = [...db];
    data.splice(index, 1);
    setDb(data);
  }

  function handleInput(e) {}

  function appendChild() {
    const cards = [...db];
    const newCards = [...cards, { status: 'done', title: 'Task C' }];
    setDb(newCards);
  }

  function dragOver(e) {
    allowDrop(e);
    if (!hasDraggedOver) {
      // const parentId = e.target.parentNode.id;
      // console.log(e.target.parentNode.id);
      // cards[draggingCardId].status = e.target.id;
      // setDb(cards);
    }
    setHasDraggedOver(true);
  }

  if (!db) {
    return;
  }
  return (
    <Wrapper
      onDrop={() => {
        setIsDragging(false);
      }}
      onDragOver={(event) => {
        dragOver(event);
      }}
    >
      <button onClick={appendChild}>Add Child</button>
      <Container>
        <Box
          type='text'
          className='box'
          onDrop={drop}
          onDragOver={(event) => {
            allowDrop(event);
          }}
          id='to-do'
        >
          <BoxTitle>To-Do</BoxTitle>
          {db.map((card, index) => {
            return card.status === 'to-do' && card.visible ? (
              <Card
                onDragStart={dragStart}
                draggable={true}
                id={index}
                opacity={index === selectedCard && isDragging ? 0.01 : 1}
                key={index}
              />
            ) : card.status === 'to-do' && !card.visible ? (
              <TransparentCard></TransparentCard>
            ) : null;
          })}
          {/* <AddCardBtn onClick={addCard}>Add a card</AddCardBtn> */}
        </Box>
        <Box
          type='text'
          onDrop={drop}
          onDragOver={allowDrop}
          className='box'
          id='doing'
        >
          <BoxTitle>Doing</BoxTitle>
          {db.map((card, index) => {
            return card.status === 'doing' ? (
              <Card
                onDragStart={dragStart}
                draggable={true}
                id={index}
                opacity={index === selectedCard && isDragging ? 0.01 : 1}
                key={index}
              />
            ) : null;
          })}
        </Box>
        <Box
          type='text '
          onDrop={drop}
          onDragOver={allowDrop}
          className='box'
          id='done'
        >
          <BoxTitle>Done</BoxTitle>
          {db.map((card, index) => {
            return card.status === 'done' ? (
              <Card
                onDragStart={dragStart}
                draggable={true}
                id={index}
                opacity={index === selectedCard && isDragging ? 0.01 : 1}
                key={index}
              />
            ) : null;
          })}
        </Box>
      </Container>
    </Wrapper>
  );
}
