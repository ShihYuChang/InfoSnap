import { createContext, useState, useEffect, useContext } from 'react';
import { onSnapshot, query, collection, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserContext } from './userContext';

const cards = [
  { title: 'Task A', status: 'to-do', visible: true },
  { title: 'Task B', status: 'to-do', visible: true },
  { title: 'Task C', status: 'doing', visible: true },
  { title: 'Task D', status: 'done', visible: true },
  { title: 'Task E', status: 'to-do', visible: true },
  { title: 'Task F', status: 'doing', visible: true },
  { title: 'Task G', status: 'done', visible: true },
];

export const EventContext = createContext({
  events: [],
  cardDb: [],
  setEvents: () => {},
  setCardDb: () => {},
});

function parseTimestamp(timestamp) {
  const date = timestamp.toDate();
  const isoString = date.toISOString();
  const dateOnly = isoString.substring(0, 10);
  return dateOnly;
}

export const EventContextProvider = ({ children }) => {
  const { email } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [cardDb, setCardDb] = useState(events);

  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, 'Users', email, 'Tasks'),
        orderBy('expireDate', 'desc')
      ),
      (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            start: { date: parseTimestamp(data.startDate) },
            end: { date: parseTimestamp(data.expireDate) },
            summary: data.task,
            visible: true,
            status: data.status,
          });
        });
        setEvents(tasks);
      }
    );
    return unsub;
  }, []);

  return (
    <EventContext.Provider value={{ events, setEvents, cardDb, setCardDb }}>
      {children}
    </EventContext.Provider>
  );
};
