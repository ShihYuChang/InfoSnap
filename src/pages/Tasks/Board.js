import { useEffect, useState, useContext } from 'react';
import { EventContext } from '../../context/eventContext';
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

export default function Board() {
  const { cardDb, setCardDb, events } = useContext(EventContext);
  const [isDragging, setIsDragging] = useState(false);
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

  function drop(e) {
    e.preventDefault();
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
            <BoxTitle>To-Do</BoxTitle>
            {cardDb.map((card, index) =>
              card.status === 'to-do' ? (
                <Card
                  onDragStart={dragStart}
                  onDragOver={dragOver}
                  draggable={card.visible ? true : false}
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
                  // opacity={isDragging && index === selectedCard.id ? 0.5 : 1}
                  readOnly
                />
              ) : null
            )}
            {/* <AddCardBtn onClick={addCard}>Add a card</AddCardBtn> */}
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
            <BoxTitle>Doing</BoxTitle>
            {cardDb.map((card, index) => {
              return card.status === 'doing' ? (
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
            <BoxTitle>Done</BoxTitle>
            {cardDb.map((card, index) => {
              return card.status === 'done' ? (
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
              ) : null;
            })}
          </Box>
        </Container>
      </Wrapper>
    </>
  );
}
