import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import Health from './pages/Health';
import Login from './components/Login';
import Note from './pages/Note';
import SlashCommand from './components/SlashCommand/SlashCommand';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}>
          <Route path='chart' element={<Chart />}></Route>
          <Route path='health' element={<Health />}></Route>
          <Route path='login' element={<Login />}></Route>
          <Route path='drag' element={<Calendar />}></Route>
          <Route path='calendar' element={<Calendar />}></Route>
          <Route path='note' element={<Note />}></Route>
          <Route path='slash' element={<SlashCommand />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
