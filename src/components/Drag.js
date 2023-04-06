import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import trash from './trash.png';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
`;

const Container = styled.div`
  width: 800px;
  display: flex;
  gap: 50px;
  margin: 300px auto;
`;
const Box = styled.div`
  width: 300px;
  min-height: 500px;
  padding: 30px;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Card = styled.div`
  width: 150px;
  height: 100px;
  background-color: yellow;
  text-align: center;
  line-height: 100px;
  border: 1px solid black;
  opacity: ${(props) => props.opacity};
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

function allowDrop(event) {
  event.preventDefault();
}

export default function Drag() {
  const cards = [
    { title: 'Task A', status: 'to-do' },
    { title: 'Task B', status: 'to-do' },
  ];
  const [db, setDb] = useState(cards);
  const [isDragging, setIsDragging] = useState(false);
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
    cards[draggingCardId].status = event.target.id;
    setDb(cards);
    setIsDragging(false);
  }

  function addCard() {
    setDb([...db, 'Task C']);
  }

  function deleteCard(index) {
    const data = [...db];
    data.splice(index, 1);
    setDb(data);
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
        allowDrop(event);
      }}
    >
      <Container>
        <Box
          className='box'
          onDrop={drop}
          onDragOver={(event) => {
            allowDrop(event);
          }}
          id='to-do'
        >
          <BoxTitle>To-Do</BoxTitle>
          {db.map((card, index) => {
            return (
              <Card
                onDragStart={dragStart}
                draggable={true}
                id={index}
                opacity={index === selectedCard && isDragging ? 0.01 : 1}
                key={index}
              >
                {card.status}
              </Card>
            );
          })}
          {/* <AddCardBtn onClick={addCard}>Add a card</AddCardBtn> */}
        </Box>
        <Box onDrop={drop} onDragOver={allowDrop} className='box' id='doing'>
          <BoxTitle>Doing</BoxTitle>
        </Box>
        <Box onDrop={drop} onDragOver={allowDrop} className='box' id='done'>
          <BoxTitle>Done</BoxTitle>
        </Box>
      </Container>
    </Wrapper>
  );
}
