import Notes from './Notes';
import { NoteContextProvider } from './noteContext';

export default function Note() {
  return (
    <NoteContextProvider>
      <Notes />
    </NoteContextProvider>
  );
}
