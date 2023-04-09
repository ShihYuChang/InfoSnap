import React from 'react';
import { EventContextProvider } from './context/eventContext';
import Header from './components/Header/Header';
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <EventContextProvider>
      <Header />
      <Outlet />
    </EventContextProvider>
  );
}
