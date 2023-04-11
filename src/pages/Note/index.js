import Dashboard from './Dashboard';
import { NoteContextProvider } from './noteContext';

export default function Note() {
  return (
    <NoteContextProvider>
      <Dashboard />
    </NoteContextProvider>
  );
}
