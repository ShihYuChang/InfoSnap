import { createContext, useContext, useEffect, useState } from 'react';
import { getTasks } from '../utils/firebase/firebase';
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

export const EventContextProvider = ({ children }) => {
  const { userInfo } = useContext(UserContext);
  const userId = userInfo.email;
  const [tasks, setTasks] = useState([]);
  const [cardDb, setCardDb] = useState(tasks);
  const [todayTasks, setTodayTasks] = useState([]);
  const [eventsByStatus, setEventsByStatus] = useState([]);

  useEffect(() => {
    getTasks(userId, setTasks, setTodayTasks);
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
