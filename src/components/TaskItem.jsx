import { useState } from 'react';
import { db, auth } from '../firebase';
import {
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  getDoc,
  setDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { achievements } from '../achievements';

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
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

  const getOrCreateUserDocument = async (userRef) => {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: auth.currentUser.email,
        zenithScore: 0,
        scoreLastUpdated: serverTimestamp(),
        unlockedAchievements: [],
      });
    }
  };

  const checkAchievements = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await getOrCreateUserDocument(userDocRef);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const tasksQuery = query(collection(db, 'tasks'), where("userId", "==", user.uid));
    const tasksSnapshot = await getDocs(tasksQuery);
    const allTasks = tasksSnapshot.docs.map(doc => doc.data());
    const stats = {
      totalCompleted: allTasks.filter(t => t.completed || t.lastCompleted).length,
      longestStreak: allTasks.reduce((max, t) => ((t.streak || 0) > max ? t.streak : max), 0),
    };

    for (const achievement of achievements) {
      if (!userData.unlockedAchievements?.includes(achievement.id) && achievement.condition(stats)) {
        await updateDoc(userDocRef, { unlockedAchievements: arrayUnion(achievement.id) });
        toast.success(`Achievement Unlocked: ${achievement.emoji} ${achievement.title}`);
      }
    }
  };

  const handleToggleComplete = async () => {
    const taskDocRef = doc(db, 'tasks', task.id);
    const user = auth.currentUser;
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);

    await getOrCreateUserDocument(userDocRef);

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
      
 const todayString = toLocalDateString(today);       
      if (lastCompletedDate && isSameDay(lastCompletedDate, yesterday)) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      
      await updateDoc(taskDocRef, {
        lastCompleted: serverTimestamp(),
        streak: newStreak,
        completionHistory: arrayUnion(todayString)
      });
    } else { // One-Time Task
      if (!task.completed) {
        shouldCheckAchievements = true;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        await updateDoc(userDocRef, { zenithScore: increment(10) });
      }
      await updateDoc(taskDocRef, { completed: !task.completed });
    }

    if (shouldCheckAchievements) {
      setTimeout(checkAchievements, 2000);
    }
  };

  const handleDeleteTask = async () => {
    await deleteDoc(doc(db, 'tasks', task.id));
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const updatedData = { text: editText };
    if (task.type === 'one-time') {
      updatedData.dueDate = editDueDate;
    }
    await updateDoc(doc(db, 'tasks', task.id), updatedData);
    setIsEditing(false);
  };

  const enterEditMode = () => {
    setEditText(task.text);
    setEditDueDate(task.dueDate || '');
    setIsEditing(true);
  };

  let isComplete = false;
  if (task.type === 'one-time') {
    isComplete = task.completed;
  } else {
    isComplete = task.lastCompleted && isSameDay(task.lastCompleted.toDate(), new Date());
  }

  return (
    <li className="task-item">
      <input type="checkbox" checked={isComplete} onChange={handleToggleComplete} />
      {isEditing ? (
        <form onSubmit={handleUpdateTask} style={{ display: 'inline-flex', flexGrow: 1, alignItems: 'center' }}>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{ flexGrow: 1, marginRight: '10px' }}
          />
          {task.type === 'one-time' && (
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              style={{ marginRight: '10px' }}
            />
          )}
          <button type="submit">Save</button>
        </form>
      ) : (
        <>
          <span className={isComplete ? 'completed' : ''} style={{ flexGrow: 1 }}>
            {task.text}
          </span>
          {task.type === 'one-time' && task.dueDate && (
            <span className="due-date"> (Due: {task.dueDate})</span>
          )}
          {task.type === 'daily' && (
            <span className="streak">🔥 {task.streak || 0}</span>
          )}
          <button onClick={enterEditMode} className="edit-btn" style={{ marginLeft: '10px' }}>
            <i className="bi bi-pencil-square"></i>
          </button>
          <button onClick={handleDeleteTask} className="delete-btn">
            <i className="bi bi-trash"></i>
          </button>
        </>
      )}
    </li>
  );
};

export default TaskItem;