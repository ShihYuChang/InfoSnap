import { createContext, useState, useEffect, useContext } from 'react';
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  Timestamp,
  startAfter,
  endBefore,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserContext } from './userContext';

export const EventContext = createContext({
  events: [],
  cardDb: [],
  todayTasks: [],
  setEvents: () => {},
  setCardDb: () => {},
  setTodayTasks: () => {},
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
  const [todayTasks, setTodayTasks] = useState([]);

  function getTimestamp(hr, min, sec, nanosec) {
    const now = new Date();
    now.setDate(now.getDate());
    now.setHours(hr, min, sec, nanosec);
    const timestamp = Timestamp.fromDate(now);
    return timestamp;
  }

  useEffect(() => {
    const startOfToday = getTimestamp(0, 0, 0, 0);
    const endOfToday = getTimestamp(23, 59, 59, 59);
    const allTasksQuery = query(
      collection(db, 'Users', email, 'Tasks'),
      orderBy('index', 'asc')
    );
    const todayTasksQuery = query(
      collection(db, 'Users', email, 'Tasks'),
      orderBy('startDate', 'asc'),
      startAfter(startOfToday),
      endBefore(endOfToday)
    );

    const allTaskSub = onSnapshot(allTasksQuery, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          start: { date: parseTimestamp(data.startDate) },
          end: { date: parseTimestamp(data.expireDate) },
          summary: data.task,
          visible: true,
          status: data.status,
          docId: doc.id,
          index: data.index,
        });
      });
      setEvents(tasks);
    });

    const todayTaskSub = onSnapshot(todayTasksQuery, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          start: { date: parseTimestamp(data.startDate) },
          end: { date: parseTimestamp(data.expireDate) },
          summary: data.task,
          visible: true,
          status: data.status,
          docId: doc.id,
          index: data.index,
        });
      });
      setTodayTasks(tasks);
    });

    return () => {
      allTaskSub();
      todayTaskSub();
    };
  }, []);

  return (
    <EventContext.Provider
      value={{
        events,
        setEvents,
        cardDb,
        setCardDb,
        todayTasks,
        setTodayTasks,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
