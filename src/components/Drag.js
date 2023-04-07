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
    { title: 'Task B', status: 'to-do', visible: true },
    { title: 'Task E', status: 'to-do', visible: true },
    { title: 'Task C', status: 'doing', visible: true },
    { title: 'Task D', status: 'done', visible: true },
  ];
  const invisibleCard = {
    title: '',
    status: 'to-do',
    visible: false,
  };
  const [db, setDb] = useState(cards);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDraggedOver, setHasDraggedOver] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  function dragStart(e) {
    // const cards = [...db];
    // cards.splice(event.target.id, 1);
    // event.dataTransfer.setData('Text', event.target.id);
    // console.log(cards);
    removeDraggedCard(e);
    setSelectedCard({ title: e.target.value, index: Number(e.target.id) });
    setIsDragging(true);
  }

  function drop(event) {
    event.preventDefault();
    addClonedCard(event);
    // const data = event.dataTransfer.getData('Text');
    // const draggedElement = document.getElementById(data);
    // if (event.target.className.includes('box')) {
    //   event.target.appendChild(draggedElement);
    // }
    setIsDragging(false);
    setHasDraggedOver(false);
  }

  function addInvisibleCard(e) {
    const cards = [...db];
    const targetIndex = Number(e.target.id);
    cards.splice(targetIndex, 0, invisibleCard);
    setDb(cards);
  }

  function removeDraggedCard(e) {
    const cards = [...db];
    const targetIndex = Number(e.target.id);
    cards.splice(targetIndex, 1, invisibleCard);
    //setDb(cards);
  }

  function addClonedCard(e) {
    const cards = [...db];
    const targetIndex = Number(e.target.id);
    const clonedCard = {
      title: selectedCard.title,
      status: e.target.parentNode.id,
      visible: true,
    };
    cards.splice(targetIndex, 1, clonedCard);
    setDb(cards);
  }

  function dragOver(e) {
    if (!hasDraggedOver) {
      addInvisibleCard(e);
      setHasDraggedOver(true);
    }
    // const parentId = e.target.parentNode.id;
    // console.log(e.target.parentNode.id);
    // cards[draggingCardId].status = e.target.id;
    // setDb(cards);
  }

  useEffect(() => console.log(db), [db]);

  if (!db) {
    return;
  }
  return (
    <Wrapper
      onDrop={() => {
        setIsDragging(false);
      }}
      onDragOver={(event) => {
        allowDrop(event);
      }}
    >
      <button onClick={addInvisibleCard}>Add Child</button>
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
          {db.map((card, index) =>
            card.status === 'to-do' ? (
              <Card
                onDragStart={dragStart}
                onDragOver={dragOver}
                draggable={card.visible ? true : false}
                id={index}
                // opacity={index === selectedCard && isDragging ? 0.01 : 1}
                key={index}
                backgroundColor={card.visible ? 'white' : 'transparent'}
                border={card.visible ? '1px solid black' : 'none'}
                value={card.title}
              />
            ) : null
          )}
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
                // onDragOver={dragOver}
                draggable={true}
                id={index}
                opacity={index === selectedCard.index && isDragging ? 0.01 : 1}
                key={index}
                value={card.title}
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
                opacity={index === selectedCard.index && isDragging ? 0.01 : 1}
                key={index}
                value={card.title}
              />
            ) : null;
          })}
        </Box>
      </Container>
    </Wrapper>
  );
}
