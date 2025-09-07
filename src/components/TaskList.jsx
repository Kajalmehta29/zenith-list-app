import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import TaskItem from './TaskItem';

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const TaskList = ({ user, filter, sortBy, searchQuery }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tasks'), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ ...doc.data(), id: doc.id });
      });
      setTasks(tasksData);
    });
    return () => unsubscribe();
  }, [user]);

  const processedTasks = useMemo(() => {
    const filtered = tasks
      .filter(task =>
        task.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(task => {
        // Unified "isComplete" logic
        let isComplete = false;
        if (task.type === 'one-time') {
          isComplete = task.completed;
        } else { // daily task
          isComplete = task.lastCompleted && isSameDay(task.lastCompleted.toDate(), new Date());
        }
        
        if (filter === 'completed') return isComplete;
        if (filter === 'active') return !isComplete;
        return true; // for 'all'
      });

    const sortTasks = (taskArray) => {
      return taskArray.sort((a, b) => {
        if (sortBy === 'dueDate_asc') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (sortBy === 'createdAt_asc') {
          return a.createdAt?.toDate() - b.createdAt?.toDate();
        }
        return b.createdAt?.toDate() - a.createdAt?.toDate();
      });
    };

    const daily = sortTasks(filtered.filter(task => task.type === 'daily'));
    const oneTime = sortTasks(filtered.filter(task => task.type === 'one-time'));

    return { daily, oneTime };
  }, [tasks, filter, sortBy, searchQuery]);

  return (
    <div className="task-list-container">
      <div className="daily-tasks-section">
        <h3>
          <i className="bi bi-arrow-repeat" style={{ marginRight: '10px' }}></i>
          Daily Habits ({processedTasks.daily.length})
        </h3>
        <ul className="task-list" style={{ padding: 0 }}>
          {processedTasks.daily.length > 0 ? (
            processedTasks.daily.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <p style={{ paddingLeft: '1rem', color: '#888' }}>No daily habits match your filters.</p>
          )}
        </ul>
      </div>

      <div className="one-time-tasks-section" style={{ marginTop: '2rem' }}>
        <h3>
          <i className="bi bi-check2-square" style={{ marginRight: '10px' }}></i>
          One-Time Tasks ({processedTasks.oneTime.length})
        </h3>
        <ul className="task-list" style={{ padding: 0 }}>
          {processedTasks.oneTime.length > 0 ? (
            processedTasks.oneTime.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <p style={{ paddingLeft: '1rem', color: '#888' }}>No one-time tasks match your filters.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TaskList;