import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import Exit from '../../components/Buttons/Exit';
import Icon from '../../components/Icon';
import Mask from '../../components/Mask';
import PopUp from '../../components/layouts/PopUp/PopUp';
import { EventContext } from '../../context/EventContext';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import {
  addTask,
  deleteTask,
  editTask,
  updateTask,
} from '../../utils/firebase';
import trash from './img/trash.png';

const questions = [
  { label: 'Start', value: 'startDate', type: 'date' },
  { label: 'Expire', value: 'expireDate', type: 'date' },
  { label: 'Task', value: 'task', type: 'text' },
];

export default function Board({ sharedStates }) {
  const { email } = useContext(UserContext);
  const { cardDb, setCardDb, events, eventsByStatus, setEventsByStatus } =
    useContext(EventContext);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasDraggedOver, setHasDraggedOver] = useState(false);
  const [hasAddedClonedCard, setHasAddedClonedCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [hoveringCard, setHoveringCard] = useState(null);
  const {
    userInput,
    setUserInput,
    selectedTask,
    setSelectedTask,
    setIsAdding,
  } = useContext(StateContext);

  function dragStart(e, card) {
    setSelectedTask(null);
    setIsDragging(true);
    setSelectedCard({
      ...card,
      id: Number(e.target.id),
      parentId: e.target.parentNode.id,
    });
  }

  function getDbFormatData(obj) {
    const data = JSON.parse(JSON.stringify(obj));
    const startDate_timestamp = new Date(data.start.date);
    const expireDate_timestamp = new Date(data.end.date);
    data.start.date = startDate_timestamp;
    data.end.date = expireDate_timestamp;
    const dbFormatCard = {
      task: data.summary,
      status: data.status,
      startDate: data.start.date,
      expireDate: data.end.date,
      index: data.index,
      visible: true,
    };
    return dbFormatCard;
  }

  async function changeCardStatus(e) {
    const card = JSON.parse(JSON.stringify(selectedCard));
    card.status =
      e.target.id.length > 3 ? e.target.id : e.target.parentNode.parentNode.id;
    if (!isNaN(Number(e.target.id))) {
      card.index = Number(e.target.getAttribute('data-card-id')) - 1;
      updateTask(email, card.docId, getDbFormatData(card));
      return;
    }
    card.index = Number(cardDb[cardDb.length - 1].index) + 1;
    updateTask(email, card.docId, getDbFormatData(card));
  }

  function drop(e) {
    e.preventDefault();
    hoveringCard !== '' && changeCardStatus(e);
    setHasAddedClonedCard(true);
    setHasDraggedOver(false);
    setIsDragging(false);
  }

  function dragOver(e) {
    if (!hasDraggedOver && Number(e.target.id) !== selectedCard.id) {
      setHasDraggedOver(true);
      setHoveringCard(e.target.id);
    }
  }

  function hoverOnBox(e) {
    e.preventDefault();
    const parentId = e.target.parentNode.id;
    parentId === selectedCard.parentId || parentId === ''
      ? setHasDraggedOver(false)
      : setHasDraggedOver(true);
  }

  function removeDraggedCard() {
    const cards = [...cardDb];
    cards.splice(selectedCard.id, 1);
    setCardDb(cards);
  }

  function clickCard(card) {
    setIsAdding(true);
    setIsEditing(true);
    setSelectedCard({ ...card });
  }

  function getNextDaysOfWeek(date, numToDisplay) {
    if (date && date.length > 0) {
      const targetDays = [];
      const inputDate = new Date(date);

      // Find the next date with the same day of the week
      const nextDayOfWeek = new Date(inputDate);
      nextDayOfWeek.setDate(nextDayOfWeek.getDate() + 7);

      // Add the next two dates with the same day of the week
      for (let i = 0; i < numToDisplay; i++) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = new Date(nextDayOfWeek)
          .toLocaleDateString('zh-TW', options)
          .replace(/\//g, '-');
        targetDays.push(formattedDate);
        nextDayOfWeek.setDate(nextDayOfWeek.getDate() + 7);
      }
      return targetDays;
    }
  }

  function getNextDaysOfMonth(date, numToDisplay) {
    if (date && date.length > 0) {
      const targetDays = [];
      const inputDate = new Date(date);

      // Find the next date with the same day of the week and month
      const nextDayOfMonth = new Date(inputDate);
      nextDayOfMonth.setMonth(nextDayOfMonth.getMonth() + 1);

      // Add the next `numToDisplay - 1` dates with the same day of the week and month
      for (let i = 0; i < numToDisplay - 1; i++) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = new Date(nextDayOfMonth)
          .toLocaleDateString('zh-TW', options)
          .replace(/\//g, '-');
        targetDays.push(formattedDate);
        nextDayOfMonth.setMonth(nextDayOfMonth.getMonth() + 1);
      }

      return targetDays;
    }
  }

  async function handleSubmit(callback) {
    await callback;
    handleExit();
  }

  function getEventsByStatus(events) {
    const output = { 'to-do': [], doing: [], done: [] };
    events.forEach((event) => {
      output[event.status].push(event);
    });
    setEventsByStatus(output);
  }

  function handleExit() {
    setIsEditing(false);
    setUserInput({
      task: '',
      startDate: '',
      expireDate: '',
    });
    setIsAdding(false);
    sharedStates(false);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case 'Escape':
          handleExit();
          break;
        case 'n':
          if (e.ctrlKey) {
            addTask('to-do', cardDb, email);
          }
          break;
        default:
          break;
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
    getEventsByStatus(events);
  }, [events]);

  useEffect(() => {
    if (isEditing) {
      setUserInput({
        task: selectedCard.summary,
        startDate: selectedCard.start.date,
        expireDate: selectedCard.end.date,
      });
    }
  }, [selectedCard]);

  if (!cardDb) {
    return;
  }
  return (
    <>
      <Mask display={isEditing ? 'block' : 'none'} />
      <PopUp
        display={isEditing ? 'block' : 'none'}
        exitClick={handleExit}
        onSubmit={(e) =>
          handleSubmit(editTask(e, selectedCard, userInput, email))
        }
        gridFr={'1fr'}
        questions={questions}
        labelWidth='200px'
        btnWidth='95%'
      >
        <Exit right='20px' top='20px' handleClick={handleExit}>
          ×
        </Exit>
      </PopUp>
      <Wrapper>
        <Container>
          {Object.keys(eventsByStatus).map((status) => (
            <Box
              type='text'
              className='box'
              onDrop={drop}
              onDragOver={(event) => {
                hoverOnBox(event);
              }}
              id={status}
              key={status}
            >
              <BoxHeader>
                <BoxTitle>{status.toUpperCase()}</BoxTitle>
                <Icon
                  type='add'
                  width='40px'
                  onClick={() => addTask(status, cardDb, email)}
                />
              </BoxHeader>
              {eventsByStatus[status].map((card, index) => (
                <CardWrapper key={index}>
                  <Card
                    onClick={() => {
                      clickCard(card);
                    }}
                    onDragStart={(e) => dragStart(e, card)}
                    onDragOver={dragOver}
                    draggable={card.visible ? true : false}
                    id={Number(index)}
                    key={index}
                    data-card-id={card.index}
                    backgroundColor={
                      card.visible
                        ? selectedTask?.content.task === card.summary &&
                          selectedTask?.content.status === card.status
                          ? '#a4a4a3'
                          : '#1b2028'
                        : 'white'
                    }
                    border={card.visible ? '1px solid black' : 'none'}
                    opacity={
                      isDragging && card.docId === selectedCard.docId ? 0.01 : 1
                    }
                  >
                    <CardText fontSize='22px'>{card.summary}</CardText>
                    <CardText fontSize='16px'>
                      {card.start.date ??
                        card.start.dateTime.replace('T', ' ').slice(0, -9)}{' '}
                      to {''}
                      {card.end.date ??
                        card.end.dateTime.replace('T', ' ').slice(0, -9)}
                    </CardText>
                  </Card>
                  <RemoveIcon
                    onClick={() =>
                      deleteTask(email, card.docId, () =>
                        setHoveringCard(hoveringCard - 1)
                      )
                    }
                    display={
                      isDragging && card.docId === selectedCard.docId
                        ? 'none'
                        : 'block'
                    }
                  />
                </CardWrapper>
              ))}
            </Box>
          ))}
        </Container>
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  background-color: black;
  border-radius: 20px;
  padding: 30px;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
`;

const Container = styled.div`
  box-sizing: border-box;
  width: 100%;
  /* display: flex; */
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin: 0 auto;
  border-radius: 20px;
`;

const Box = styled.div`
  min-height: 820px;
  padding: 47px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: #31353f;
  border-radius: 20px;
`;

const BoxHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const CardWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const Card = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 200px;
  background-color: ${(props) => props.backgroundColor};
  opacity: ${(props) => props.opacity};
  padding: 20px;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  cursor: pointer;
`;

const CardText = styled.div`
  font-size: ${({ fontSize }) => fontSize};
`;

const RemoveIcon = styled.div`
  display: ${({ display }) => display};
  width: 20px;
  height: 20px;
  color: white;
  background-image: url(${trash});
  background-size: cover;
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  right: 10px;
`;

const BoxTitle = styled.h1`
  font-size: 32px;
  font-weight: 500;
  width: 200px;
  margin-bottom: 40px;
  letter-spacing: 4px;
`;
