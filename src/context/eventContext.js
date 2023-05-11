import {
  Timestamp,
  collection,
  endBefore,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { UserContext } from './UserContext';

export const EventContext = createContext({
  events: [],
  cardDb: [],
  todayTasks: [],
  eventsByStatus: [],
  setEvents: () => {},
  setCardDb: () => {},
  setTodayTasks: () => {},
  setEventsByStatus: () => {},
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
  const [eventsByStatus, setEventsByStatus] = useState([]);

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
      const notDoneTasks = tasks.filter((task) => task.status !== 'done');
      setTodayTasks(notDoneTasks);
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
        eventsByStatus,
        setEventsByStatus,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
