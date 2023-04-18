import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { db } from '../../firebase';
import {
  onSnapshot,
  query,
  collection,
  where,
  doc,
  setDoc,
} from 'firebase/firestore';
import Exit from '../../components/Buttons/Exit';
import { UserContext } from '../../context/userContext';
import { StateContext } from '../../context/stateContext';
import { EventContext } from '../../context/eventContext';
import { HealthContext } from '../Health/healthContext';
import { getUserEmail } from '../../utils/Firebase';
import ReactLoading from 'react-loading';
import { useNavigate } from 'react-router-dom';

const ContentTitle = styled.h2``;

export default function Dashboard() {
  const navigate = useNavigate();
  const { email, setEmail } = useContext(UserContext);
  const { todayBudget, netIncome, selectedDate, setSelectedDate, nutritions } =
    useContext(StateContext);
  // const { nutritions } = useContext(HealthContext);
  const { todayTasks } = useContext(EventContext);
  const [pinnedNote, setPinnedNote] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    setSelectedDate(today);
    getUserEmail(setEmail);
  }, []);

  useEffect(() => {
    if (email) {
      const unsub = onSnapshot(
        query(
          collection(db, 'Users', email, 'Notes'),
          where('pinned', '==', true)
        ),
        (querySnapshot) => {
          const notes = [];
          querySnapshot.forEach((doc) => {
            notes.push({ content: doc.data(), id: doc.id, isVisible: true });
          });
          setPinnedNote(notes);
        }
      );
      return unsub;
    }
  }, [email]);

  async function removePin(id, note) {
    const newNote = note;
    newNote.pinned = false;
    await setDoc(doc(db, 'Users', email, 'Notes', id), newNote);
    alert('Note Unpinned!');
  }

  if (!pinnedNote) {
    return <Loading type='spinningBubbles' color='#313538' />;
  }
  return (
    <Wrapper>
      <ContentHeader>
        <DateSelect
          type='date'
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </ContentHeader>
      <Title>Pinned Notes</Title>
      <Notes>
        {pinnedNote.map((note, index) => (
          <NoteContainer key={index}>
            <PinnedNote
              dangerouslySetInnerHTML={{ __html: note.content.context }}
            />
            <Exit
              top={0}
              right={0}
              handleClick={() => removePin(note.id, note.content)}
            >
              X
            </Exit>
          </NoteContainer>
        ))}
      </Notes>
      <Title>Finance</Title>
      <Section grid='1fr 1fr' id='finance'>
        <Card onClick={() => navigate('./finance')}>
          <ContentTitle>Today's Budget</ContentTitle>
          <ContentTitle>{`NT$${todayBudget.toLocaleString()}`}</ContentTitle>
        </Card>
        <Card onClick={() => navigate('./finance')}>
          <ContentTitle>Net Income (month)</ContentTitle>
          <ContentTitle>{`NT$${netIncome.toLocaleString()}`}</ContentTitle>
        </Card>
      </Section>
      <Title>Health</Title>
      <Section grid='1fr 1fr 1fr' id='health'>
        {nutritions.map((nutrition, index) => (
          <Card key={index}>
            <ContentTitle>{nutrition.title}</ContentTitle>
            <ContentTitle>
              {nutrition.goal > nutrition.total
                ? (nutrition.goal - nutrition.total).toFixed(2)
                : 0}
            </ContentTitle>
          </Card>
        ))}
      </Section>
      <Title>Tasks</Title>
      <Section grid='1fr 1fr 1fr' id='task'>
        {todayTasks.map((task, index) => (
          <Card key={index}>
            <ContentTitle>{task.summary}</ContentTitle>
            <ContentText>{`${task.start.date} to ${task.end.date}`}</ContentText>
          </Card>
        ))}
      </Section>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  margin: 0 0 50px 0;
`;

const Notes = styled.div`
  width: 50%;
  margin: 50px auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
`;

const NoteContainer = styled.div`
  position: relative;
`;

const PinnedNote = styled.div`
  border: 1px solid black;
  height: 200px;
  cursor: pointer;
  position: relative;
`;

const Title = styled.h1`
  width: 50%;
  margin: 50px auto;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const Split = styled.hr`
  width: 70%;
`;

const Section = styled.div`
  width: 50%;
  display: grid;
  grid-template-columns: ${(props) => props.grid};
  gap: 30px;
  margin: 0 auto;
`;

const Card = styled.div`
  height: 200px;
  border: 1px solid black;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentText = styled.p`
  font-size: 18px;
`;

const ContentHeader = styled.div`
  width: 70%;
  display: flex;
  justify-content: end;
  padding-top: 30px;
`;

const DateSelect = styled.input`
  width: 120px;
  height: 50px;
  cursor: pointer;
`;
