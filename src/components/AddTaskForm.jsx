// src/components/AddTaskForm.jsx
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddTaskForm = ({ user }) => {
  const [taskText, setTaskText] = useState('');
  const [taskType, setTaskType] = useState('one-time'); // 'one-time' or 'daily'
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (taskText.trim() === '') return;

    const taskData = {
      text: taskText,
      completed: false,
      createdAt: serverTimestamp(),
      userId: user.uid,
      type: taskType,
    };

    if (taskType === 'one-time') {
      taskData.dueDate = dueDate;
    } else { // It's a daily task
      taskData.streak = 0;
      taskData.lastCompleted = null;
    }

    try {
      await addDoc(collection(db, 'tasks'), taskData);
      setTaskText('');
      setDueDate('');
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="radio" id="one-time" name="taskType" value="one-time"
          checked={taskType === 'one-time'} onChange={(e) => setTaskType(e.target.value)}
        />
        <label htmlFor="one-time">One-Time Task</label>
        <input
          type="radio" id="daily" name="taskType" value="daily"
          checked={taskType === 'daily'} onChange={(e) => setTaskType(e.target.value)}
        />
        <label htmlFor="daily">Daily Habit</label>
      </div>

      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="What needs to be done?"
        required
      />
      
      {taskType === 'one-time' && (
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      )}

      <button type="submit">Add Task</button>
    </form>
  );
};

export default AddTaskForm;