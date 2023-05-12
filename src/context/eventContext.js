import { Timestamp } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { getTasks } from '../utils/firebase';
import { UserContext } from './UserContext';

export const EventContext = createContext({
  tasks: [],
  cardDb: [],
  todayTasks: [],
  eventsByStatus: [],
  setTasks: () => {},
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
  const [tasks, setTasks] = useState([]);
  const [cardDb, setCardDb] = useState(tasks);
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
    getTasks(email, setTasks, setTodayTasks);
  }, []);

  return (
    <EventContext.Provider
      value={{
        tasks,
        setTasks,
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
