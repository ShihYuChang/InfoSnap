import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
`;

const Container = styled.div`
  width: 500px;
  height: 500px;
  display: flex;
  gap: 50px;
  margin: 300px auto;
`;
const Box = styled.div`
  width: 300px;
  height: 500px;
  padding: 10px;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Card = styled.div`
  width: 100px;
  height: 100px;
  background-color: yellow;
  text-align: center;
  line-height: 100px;
  border: 1px solid black;
  opacity: ${(props) => props.opacity};
`;

function allowDrop(event) {
  event.preventDefault();
}

export default function Drag() {
  const cards = ['Task A', 'Task B'];
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCard, setSelectedCard] = useState();
  function dragStart(event) {
    event.dataTransfer.setData('Text', event.target.id);
    setSelectedCard(Number(event.target.id));
    setIsDragging(true);
  }

  function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('Text');
    const draggedElement = document.getElementById(data);
    if (event.target.className.includes('box')) {
      event.target.appendChild(draggedElement);
    }
    setIsDragging(false);
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
        >
          {cards.map((card, index) => {
            return (
              <Card
                onDragStart={dragStart}
                draggable={true}
                id={index}
                opacity={index === selectedCard && isDragging ? 0.01 : 1}
                key={index}
              >
                {card}
              </Card>
            );
          })}
        </Box>
        <Box onDrop={drop} onDragOver={allowDrop} className='box'></Box>
      </Container>
    </Wrapper>
  );
}
