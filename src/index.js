import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Calendar from './pages/Calendar';
import Finance from './pages/Finance';
import Health from './pages/Health';
import GoogleLogin from './components/GoogleLogin';
import Note from './pages/Note';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/Authentication/SignIn';
import { UserContextProvider } from './context/userContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />}>
            <Route index element={<Dashboard />}></Route>
            <Route path='finance' element={<Finance />}></Route>
            <Route path='health' element={<Health />}></Route>
            <Route path='login' element={<GoogleLogin />}></Route>
            <Route path='drag' element={<Calendar />} />
            <Route path='calendar' element={<Calendar />} />
            <Route path='note' element={<Note />} />
            <Route path='signin' element={<SignIn />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  </React.StrictMode>
);
