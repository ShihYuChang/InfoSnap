import { useEffect, useState } from 'react';
import styled from 'styled-components';

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
`;

function allowDrop(event) {
  event.preventDefault();
}

export default function Drag() {
  const [cardPos, setCardPos] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  function dragStart(event) {
    event.dataTransfer.setData('Text', event.target.id);
    setIsDragging(true);
  }

  function dragging(event) {
    const x = event.clientX;
    const y = event.clientY;
    const deltaX = x - cardPos.x;
    const deltaY = y - cardPos.y;
    setCardPos({ x: x, y: y, deltaX: deltaX, deltaY: deltaY });
  }

  function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('Text');
    event.target.appendChild(document.getElementById(data));
    setIsDragging(false);
  }

  return (
    <Container>
      <Box
        onDrop={drop}
        onDragOver={(event) => {
          allowDrop(event);
        }}
      >
        <Card onDragStart={dragStart} draggable={true} id='dragtarget'>
          Task A
        </Card>
        <Card onDragStart={dragStart} draggable={true} id='dragtarget2'>
          Task B
        </Card>
      </Box>
      <Box onDrop={drop} onDragOver={allowDrop}></Box>
    </Container>
  );
}
