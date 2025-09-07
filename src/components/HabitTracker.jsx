import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { startOfWeek, startOfMonth } from 'date-fns';

const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const HabitTracker = ({ user }) => {
    const [dailyTasks, setDailyTasks] = useState([]);
    const [view, setView] = useState('weekly');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchDailyTasks = async () => {
            if (!user) return;
            const q = query(collection(db, 'tasks'), where('userId', '==', user.uid), where('type', '==', 'daily'));
            const querySnapshot = await getDocs(q);
            const tasks = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setDailyTasks(tasks);
        };
        fetchDailyTasks();
    }, [user]);

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (view === 'weekly') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'weekly') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    let dateHeaders = [];
    let viewLabel = '';
    if (view === 'weekly') {
        const start = startOfWeek(currentDate);
        viewLabel = `Week of ${start.toLocaleDateString()}`;
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            dateHeaders.push(date);
        }
    } else { // monthly
        const start = startOfMonth(currentDate);
        viewLabel = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            dateHeaders.push(new Date(start.getFullYear(), start.getMonth(), i));
        }
    }

    return (
        <div className="habit-tracker" style={{ fontFamily: 'sans-serif' }}>
            <div className="tracker-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Daily Habit Tracker</h2>
                <div>
                    <button onClick={() => setView('weekly')} disabled={view === 'weekly'}>Week</button>
                    <button onClick={() => setView('monthly')} disabled={view === 'monthly'}>Month</button>
                </div>
            </div>
            <div className="navigation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={handlePrev}>&lt; Prev</button>
                <h3>{viewLabel}</h3>
                <button onClick={handleNext}>Next &gt;</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Habit</th>
                            {dateHeaders.map(date => (
                                <th key={date.toISOString()} style={{ padding: '8px', textAlign: 'center' }}>
                                    <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    <div>{date.getDate()}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dailyTasks.map(task => (
                            <tr key={task.id} style={{ borderTop: '1px solid #ccc' }}>
                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{task.text}</td>
                                {dateHeaders.map(date => {
                                    const dateString = toLocalDateString(date); 
                                    const isCompleted = task.completionHistory?.includes(dateString);
                                    return (
                                        <td key={dateString} style={{ padding: '8px', textAlign: 'center' }}>
                                            <span title={isCompleted ? 'Completed!' : 'Not yet'}>{isCompleted ? '✅' : '❌'}</span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HabitTracker;