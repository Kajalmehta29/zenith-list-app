import React, { useState } from 'react';
import { db, auth } from '../firebase';
import {
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  getDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { achievements } from '../achievements';

// Helper function to check if two dates are on the same day
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const TaskItem = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');

  // Function to check for and unlock new achievements
  const checkAchievements = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) return;
    const userData = userDoc.data();

    const tasksQuery = query(collection(db, 'tasks'), where("userId", "==", user.uid));
    const tasksSnapshot = await getDocs(tasksQuery);
    const allTasks = tasksSnapshot.docs.map(doc => doc.data());

    // Calculate current stats
    const stats = {
      totalCompleted: allTasks.filter(t => t.completed || t.lastCompleted).length,
      longestStreak: allTasks.reduce((max, t) => ((t.streak || 0) > max ? t.streak : max), 0),
    };

    // Check each achievement
    for (const achievement of achievements) {
      if (!userData.unlockedAchievements?.includes(achievement.id) && achievement.condition(stats)) {
        await updateDoc(userDocRef, {
          unlockedAchievements: arrayUnion(achievement.id)
        });
        toast.success(`Achievement Unlocked: ${achievement.emoji} ${achievement.title}`);
      }
    }
  };

  const handleToggleComplete = async () => {
    const taskDocRef = doc(db, 'tasks', task.id);
    const user = auth.currentUser;
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    let shouldCheckAchievements = false;

    if (task.type === 'daily') {
      const today = new Date();
      const lastCompletedDate = task.lastCompleted?.toDate();
      if (lastCompletedDate && isSameDay(lastCompletedDate, today)) return;

      shouldCheckAchievements = true;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      let newStreak = task.streak || 0;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const streakBonus = (newStreak > 0) ? 5 : 0;

      await updateDoc(userDocRef, { zenithScore: increment(10 + streakBonus) });
      
      if (lastCompletedDate && isSameDay(lastCompletedDate, yesterday)) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      await updateDoc(taskDocRef, { completed: true, lastCompleted: serverTimestamp(), streak: newStreak });

    } else { // One-time task
      if (!task.completed) {
        shouldCheckAchievements = true;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        await updateDoc(userDocRef, { zenithScore: increment(10) });
      }
      await updateDoc(taskDocRef, { completed: !task.completed });
    }

    if (shouldCheckAchievements) {
      setTimeout(checkAchievements, 2000); // Delay to allow DB to settle
    }
  };

  const handleDeleteTask = async () => {
    const taskDocRef = doc(db, 'tasks', task.id);
    await deleteDoc(taskDocRef);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const taskDocRef = doc(db, 'tasks', task.id);
    const updatedData = { text: editText };
    if (task.type === 'one-time') {
      updatedData.dueDate = editDueDate;
    }
    await updateDoc(taskDocRef, updatedData);
    setIsEditing(false);
  };

  const enterEditMode = () => {
    setEditText(task.text);
    setEditDueDate(task.dueDate || '');
    setIsEditing(true);
  };

  const isCompletedToday = task.type === 'daily' && task.lastCompleted && isSameDay(task.lastCompleted.toDate(), new Date());
  const isChecked = task.type === 'daily' ? isCompletedToday : task.completed;

  return (
    <li className="task-item">
      <input type="checkbox" checked={isChecked} onChange={handleToggleComplete} />
      {isEditing ? (
        <form onSubmit={handleUpdateTask} style={{ display: 'inline-flex', flexGrow: 1, alignItems: 'center' }}>
          <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} style={{ flexGrow: 1, marginRight: '10px' }} />
          {task.type === 'one-time' && (
            <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} style={{ marginRight: '10px' }} />
          )}
          <button type="submit">Save</button>
        </form>
      ) : (
        <>
          <span className={isChecked ? 'completed' : ''} style={{ flexGrow: 1 }}>{task.text}</span>
          {task.type === 'one-time' && task.dueDate && (<span className="due-date"> (Due: {task.dueDate})</span>)}
          {task.type === 'daily' && (<span className="streak">🔥 {task.streak || 0}</span>)}
          <button onClick={enterEditMode} className="edit-btn" style={{ marginLeft: '10px' }}>✏️</button>
          <button onClick={handleDeleteTask} className="delete-btn">🗑️</button>
        </>
      )}
    </li>
  );
};

export default TaskItem;