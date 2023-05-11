import { NoteContextProvider } from '../../context/NoteContext';
import Notes from './Notes';

export default function Note() {
  return (
    <NoteContextProvider>
      <Notes />
    </NoteContextProvider>
  );
}
