import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import AchievementsList from './AchievementsList';
import CompletionsReport from './CompletionsReport';
import HabitTracker from './HabitTracker';

const ProgressView = ({ user }) => {
  const [allTasks, setAllTasks] = useState([]);
  const [stats, setStats] = useState({ totalCompleted: 0, longestStreak: 0 });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => setUserData(doc.data()));

    const fetchAllTasks = async () => {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => doc.data());
      setAllTasks(tasks);

      setStats({
        totalCompleted: tasks.filter(t => t.completed || t.lastCompleted).length,
        longestStreak: tasks.reduce((max, t) => ((t.streak || 0) > max ? t.streak : max), 0),
      });
    };

    fetchAllTasks();
    return () => unsubscribeUser();
  }, [user]);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <Link to="/dashboard"><button>← Back to Dashboard</button></Link>
      <h1 style={{ textAlign: 'center' }}>Your Progress</h1>
      
      <div className="stats-container" style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem 0' }}>
        <div><h2>Total Tasks Completed</h2><p style={{ fontSize: '2rem', textAlign: 'center', fontWeight: 'bold' }}>{stats.totalCompleted}</p></div>
        <div><h2>Longest Streak</h2><p style={{ fontSize: '2rem', textAlign: 'center', fontWeight: 'bold' }}>{stats.longestStreak} 🔥</p></div>
      </div>

      <hr style={{ margin: '40px 0' }} />
      <CompletionsReport tasks={allTasks} />
      
      <hr style={{ margin: '40px 0' }} />
      <HabitTracker user={user} />

      <hr style={{ margin: '40px 0' }} />
      <AchievementsList unlockedIds={userData?.unlockedAchievements} />
    </div>
  );
};

export default ProgressView;