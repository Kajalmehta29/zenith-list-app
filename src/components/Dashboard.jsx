import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import AddTaskForm from './AddTaskForm';
import TaskList from './TaskList';

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const Dashboard = ({ user, toggleTheme, currentTheme }) => {
  const [userData, setUserData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const lastUpdated = data.scoreLastUpdated?.toDate();
        const today = new Date();
        if (!isSameDay(lastUpdated, today)) {
          await updateDoc(userDocRef, {
            zenithScore: 0,
            scoreLastUpdated: serverTimestamp()
          });
        } else {
          setUserData(data);
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h1>Zenith List</h1>
        <div>
          <Link to="/progress"><button>View Progress </button></Link>
          <Link to="/calendar" style={{ marginLeft: '10px' }}><button>View Calendar </button></Link>
        </div>
        <div className="score-display">
          <strong> Score: {userData ? userData.zenithScore : 0} ⚡</strong>
        </div>
        <button onClick={toggleTheme} style={{ marginTop: '10px' }}>
          Switch to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
              <button onClick={handleLogout}>Log Out</button>

      </div>
      
      <h2>Create a New Task</h2>
      <AddTaskForm user={user} />
     
      <div className="task-controls" style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="search"
          placeholder="Search tasks by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <span>Show: </span>
            <button onClick={() => setFilter('all')} disabled={filter === 'all'}>All</button>
            <button onClick={() => setFilter('active')} disabled={filter === 'active'}>Active</button>
            <button onClick={() => setFilter('completed')} disabled={filter === 'completed'}>Completed</button>
          </div>
          <div>
            <label htmlFor="sort">Sort by: </label>
            <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="dueDate_asc">Due Date</option>
            </select>
          </div>
        </div>
      </div>
      <TaskList user={user} filter={filter} sortBy={sortBy} searchQuery={searchQuery} />
    </div>
  );
};

export default Dashboard;