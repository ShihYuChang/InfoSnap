import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Drag from './pages/Drag';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import Export from './pages/Export';
import Login from './components/Login';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}>
          <Route path='chart' element={<Chart />}></Route>
          <Route path='export' element={<Export />}></Route>
          <Route path='login' element={<Login />}></Route>
          <Route path='drag' element={<Drag />}></Route>
          <Route path='calendar' element={<Calendar />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
