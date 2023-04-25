import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Calendar from './pages/Tasks/Calendar';
import Finance from './pages/Finance';
import Health from './pages/Health';
import GoogleLogin from './components/GoogleLogin';
import Note from './pages/Note';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Finance/Analytics';
import Component from './pages/Component';
import DnD from './pages/DnD';
import { UserContextProvider } from './context/userContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />}>
            {/* <Route index element={<Dashboard />}></Route> */}
            <Route path='/dashboard' element={<Dashboard />}></Route>
            <Route path='/finance' element={<Finance />} />
            <Route path='/finance/analytics' element={<Analytics />} />
            <Route path='health' element={<Health />}></Route>
            <Route path='login' element={<GoogleLogin />}></Route>
            <Route path='calendar' element={<Calendar />} />
            <Route path='notes' element={<Note />} />
            <Route path='component' element={<Component />} />
            <Route path='tasks' element={<Calendar />} />
            <Route path='dnd' element={<DnD />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  </React.StrictMode>
);
