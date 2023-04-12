import React, { useEffect, useState } from 'react';
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

const Wrapper = styled.div`
  width: 100%;
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
        setPinnedNote(notes);
      }
    );
    return unsub;
  }, []);

  async function removePin(id, note) {
    const newNote = note;
    newNote.pinned = false;
    await setDoc(doc(db, 'Users', 'sam21323@gmail.com', 'Notes', id), newNote);
    alert('Note Unpinned!');
  }

  if (!pinnedNote) return;
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
    </Wrapper>
  );
}
