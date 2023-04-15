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
  orderBy,
  startAfter,
  endBefore,
  Timestamp,
} from 'firebase/firestore';
import Exit from '../../components/Buttons/Exit';
import { UserContext } from '../../context/userContext';
import { StateContext } from '../../context/stateContext';
import { HealthContext } from '../Health/healthContext';
import { getUserEmail } from '../../utils/Firebase';
import ReactLoading from 'react-loading';

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

const ContentTitle = styled.h2``;

export default function Dashboard() {
  const { email, setEmail } = useContext(UserContext);
  const { todayBudget, netIncome } = useContext(StateContext);
  const { intakeRecords, setIntakeRecords, nutritions, setNutritions } =
    useContext(HealthContext);
  const [pinnedNote, setPinnedNote] = useState(null);

  function getTimestamp(hr, min, sec, nanosec) {
    const now = new Date();
    now.setHours(hr, min, sec, nanosec);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
  }

  function getNutritionTotal(data) {
    const contents = [];
    data.forEach((obj) => contents.push(obj.content));
    const totals = contents.reduce(
      (acc, cur) => {
        return {
          protein: Number(acc.protein) + Number(cur.protein),
          carbs: Number(acc.carbs) + Number(cur.carbs),
          fat: Number(acc.fat) + Number(cur.fat),
        };
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
    return totals;
  }

  function updateData(rawData) {
    console.log(rawData);
    const newData = [...rawData];
    const intakeToday = getNutritionTotal(intakeRecords);
    newData.forEach((data) => {
      const name = data.title.toLowerCase();
      data.total = intakeToday[name];
    });

    return newData;
  }

  useEffect(() => {
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

  // useEffect(() => {
  //   const startOfToday = getTimestamp(0, 0, 0, 0);
  //   const endOfToday = getTimestamp(23, 59, 59, 59);
  //   const foodSnap = onSnapshot(
  //     query(
  //       collection(db, 'Users', email, 'Health-Food'),
  //       orderBy('created_time', 'asc'),
  //       startAfter(startOfToday),
  //       endBefore(endOfToday)
  //     ),
  //     (querySnapshot) => {
  //       const records = [];
  //       querySnapshot.forEach((doc) => {
  //         records.push({ content: doc.data(), id: doc.id });
  //       });
  //       setIntakeRecords(records);
  //     }
  //   );
  //   return foodSnap;
  // }, []);

  // useEffect(() => {
  //   if (intakeRecords) {
  //     setNutritions(updateData(nutritions));
  //   }
  // }, [intakeRecords]);

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
        <Card>
          <ContentTitle>Today's Budget</ContentTitle>
          <ContentTitle>{`NT$${todayBudget.toLocaleString()}`}</ContentTitle>
        </Card>
        <Card>
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
    </Wrapper>
  );
}
