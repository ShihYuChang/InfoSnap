import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Export from './pages/Export';
import Chart from './pages/Chart';
import Drag from './pages/Drag';
import Login from './components/Login';
import Calendar from './pages/Calendar';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='chart' element={<Chart />}></Route>
        <Route path='export' element={<Export />}></Route>
        <Route path='drag' element={<Drag />}></Route>
        <Route path='login' element={<Login />}></Route>
        <Route path='calendar' element={<Calendar />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
