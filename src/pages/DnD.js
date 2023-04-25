import Column from 'antd/es/table/Column';
import React from 'react';
import { useState } from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';

const Board = styled.div`
  width: 800px;
  height: 500px;
  background-color: grey;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  width: 500px;
  height: 100px;
  background-color: black;
  color: white;
  font-size: 50px;
`;

function DnD() {
  const [data, setData] = useState();
  return (
    <>
      <Board>
        <Card></Card>
      </Board>
    </>
  );
}

export default DnD;
