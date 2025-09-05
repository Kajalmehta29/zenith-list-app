import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AchievementsList from './AchievementsList';

// Register the components Chart.js needs to render a bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProgressView = ({ user }) => {
  const [chartData, setChartData] = useState(null);
  const [stats, setStats] = useState({ totalCompleted: 0, longestStreak: 0 });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Set up a listener for the user's document to get achievement updates in real-time
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      setUserData(doc.data());
    });

    const fetchAndProcessTasks = async () => {
      const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => doc.data());

      // --- Process data for the chart (last 7 days) ---
      const labels = [];
      const dataPoints = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

        const completedOnDay = tasks.filter(task => {
          if (!task.lastCompleted) return false;
          const completedDate = task.lastCompleted.toDate();
          return completedDate.getDate() === date.getDate() &&
                 completedDate.getMonth() === date.getMonth() &&
                 completedDate.getFullYear() === date.getFullYear();
        }).length;
        dataPoints.push(completedOnDay);
      }

      setChartData({
        labels,
        datasets: [{
          label: 'Tasks Completed',
          data: dataPoints,
          backgroundColor: 'rgba(187, 134, 252, 0.6)',
          borderColor: 'rgba(187, 134, 252, 1)',
          borderWidth: 1,
        }],
      });

      // --- Process data for overall stats ---
      const totalCompleted = tasks.filter(task => task.completed || task.lastCompleted).length;
      const longestStreak = tasks.reduce((max, task) => ((task.streak || 0) > max ? task.streak : max), 0);
      setStats({ totalCompleted, longestStreak });
    };

    fetchAndProcessTasks();

    // Cleanup listener on unmount
    return () => unsubscribeUser();
  }, [user]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <Link to="/dashboard"><button>← Back to Dashboard</button></Link>
      <h1 style={{ textAlign: 'center' }}>Your Progress</h1>

      <div className="stats-container" style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem 0' }}>
        <div>
          <h2>Total Tasks Completed</h2>
          <p style={{ fontSize: '2rem', textAlign: 'center', fontWeight: 'bold' }}>{stats.totalCompleted}</p>
        </div>
        <div>
          <h2>Longest Streak</h2>
          <p style={{ fontSize: '2rem', textAlign: 'center', fontWeight: 'bold' }}>{stats.longestStreak} 🔥</p>
        </div>
      </div>

      <div className="chart-container" style={{ marginBottom: '40px' }}>
        <h2>Completions in the Last 7 Days</h2>
        {chartData ? (
          <Bar 
            options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Weekly Task Report' } } }} 
            data={chartData} 
          />
        ) : (
          <p>Loading chart data...</p>
        )}
      </div>
      
      <hr style={{ margin: '40px 0' }} />

      <AchievementsList unlockedIds={userData?.unlockedAchievements} />
    </div>
  );
};

export default ProgressView;