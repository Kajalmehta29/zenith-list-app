import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp} from 'firebase/firestore';

const AddTaskForm = ({ user }) => {
  const [taskText, setTaskText] = useState('');
  const [taskType, setTaskType] = useState('one-time');
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
    } else {
      taskData.streak = 0;
      taskData.lastCompleted = null;
      taskData.completionHistory = []; 
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
    <form onSubmit={handleSubmit} className="add-task-form">
      <div className="task-type-selector">
        <div className="task-type-option" onClick={() => setTaskType('one-time')}>
          <input
            type="radio"
            id="one-time"
            name="taskType"
            value="one-time"
            checked={taskType === 'one-time'}
            onChange={(e) => setTaskType(e.target.value)}
          />
          <label htmlFor="one-time">
            <i className="bi bi-check2-square"></i> One-Time
          </label>
        </div>
        <div className="task-type-option" onClick={() => setTaskType('daily')}>
          <input
            type="radio"
            id="daily"
            name="taskType"
            value="daily"
            checked={taskType === 'daily'}
            onChange={(e) => setTaskType(e.target.value)}
          />
          <label htmlFor="daily">
            <i className="bi bi-arrow-repeat"></i> Daily
          </label>
        </div>
      </div>

      <div className="task-details">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Add a new task..."
          required
        />
        
        {taskType === 'one-time' && (
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        )}

        <button type="submit" style={{ alignSelf: 'flex-start' }}>Add Task</button>
      </div>
    </form>
  );
};

export default AddTaskForm;