import React from 'react';
import { EventContextProvider } from './context/eventContext';
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <EventContextProvider>
      <Outlet />
    </EventContextProvider>
  );
}
