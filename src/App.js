import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Export from './components/Export';
import Chart from './components/Chart';
import Drag from './components/Drag';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='chart' element={<Chart />}></Route>
        <Route path='export' element={<Export />}></Route>
        <Route path='drag' element={<Drag />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
