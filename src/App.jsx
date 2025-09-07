import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';
import ProgressView from './components/ProgressView'; 
import 'react-datepicker/dist/react-datepicker.css';
import { Toaster } from 'react-hot-toast';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <BrowserRouter> {}
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={currentUser ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              <Dashboard user={currentUser} toggleTheme={toggleTheme} currentTheme={theme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/calendar"
          element={currentUser ? <CalendarView user={currentUser} /> : <Navigate to="/login" />}
        />
         <Route
          path="/progress"
          element={currentUser ? <ProgressView user={currentUser} /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
    <Toaster/>
    </>
  );
}

export default App;