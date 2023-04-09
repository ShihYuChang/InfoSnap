import { createContext, useState } from 'react';

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

export const EventContextProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [cardDb, setCardDb] = useState(events);

  return (
    <EventContext.Provider value={{ events, setEvents, cardDb, setCardDb }}>
      {children}
    </EventContext.Provider>
  );
};
