import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { db } from '../../firebase';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import Exit from '../../components/Buttons/Exit';

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

export default function Dashboard() {
  const [pinnedNote, setPinnedNote] = useState(null);
  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, 'Users', 'sam21323@gmail.com', 'Notes'),
        where('pinned', '==', true)
      ),
      (querySnapshot) => {
        const notes = [];
        querySnapshot.forEach((doc) => {
          notes.push({ content: doc.data(), id: doc.id, isVisible: true });
        });
        console.log(notes);
        setPinnedNote(notes);
        //   dataRef.current = notes;
        //   setData(notes);
      }
    );
    return unsub;
  }, []);

  if (!pinnedNote) return;
  return (
    <Notes>
      {pinnedNote.map((note) => (
        <NoteContainer>
          <PinnedNote
            dangerouslySetInnerHTML={{ __html: note.content.context }}
          />
          <Exit top={0} right={0}>
            X
          </Exit>
        </NoteContainer>
      ))}
    </Notes>
  );
}
