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
    return tasks
      .filter(task =>
        task.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(task => {
        const isCompletedToday = task.type === 'daily' && task.lastCompleted && isSameDay(task.lastCompleted.toDate(), new Date());
        const isComplete = task.type === 'one-time' ? task.completed : isCompletedToday;
        if (filter === 'completed') return isComplete;
        if (filter === 'active') return !isComplete;
        return true;
      })
      .sort((a, b) => {
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
  }, [tasks, filter, sortBy, searchQuery]);

  return (
    <div className="task-list-container">
      <h3>Your Tasks ({processedTasks.length})</h3>
      <ul className="task-list" style={{ padding: 0 }}>
        {processedTasks.length > 0 ? (
          processedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))
        ) : (
          <p>No tasks found. Try adjusting your search or filters!</p>
        )}
      </ul>
    </div>
  );
};

export default TaskList;