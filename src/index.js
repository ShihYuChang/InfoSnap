import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { UserContextProvider } from './context/UserContext';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Analytics from './pages/Finance/Analytics';
import Health from './pages/Health';
import Note from './pages/Note';
import PageNotFound from './pages/PageNotFound';
import Privacy from './pages/Privacy/Privacy';
import Tasks from './pages/Tasks';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path='/finance' element={<Finance />} />
            <Route path='/finance/analytics' element={<Analytics />} />
            <Route path='health' element={<Health />}></Route>
            <Route path='notes' element={<Note />} />
            <Route path='tasks' element={<Tasks />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='privacy' element={<Privacy />} />
            <Route path='*' element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  </React.StrictMode>
);
