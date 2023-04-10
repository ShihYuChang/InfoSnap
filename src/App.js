import React from 'react';
import { EventContextProvider } from './context/eventContext';
import { StateContextProvider } from './context/stateContext';
import { createGlobalStyle } from 'styled-components';
import Header from './components/Header/Header';
import { Outlet } from 'react-router-dom';

const GlobalStyle = createGlobalStyle`
  #root{
    position: relative;
  }
`;

export default function App() {
  return (
    <>
      <GlobalStyle />
      <EventContextProvider>
        <StateContextProvider>
          <Header />
          <Outlet />
        </StateContextProvider>
      </EventContextProvider>
    </>
  );
}
