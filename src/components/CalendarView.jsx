// src/components/CalendarView.jsx
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar'; // This is the correct import
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// The localizer setup is now correct because it uses the imported function
const localizer = momentLocalizer(moment);

const CalendarView = ({ user }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        where('type', '==', 'one-time')
      );

      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      const formattedEvents = tasksData
        .filter(task => task.dueDate)
        .map(task => {
          const date = moment(task.dueDate, 'YYYY-MM-DD').toDate();
          return {
            title: task.text,
            start: date,
            end: date,
            allDay: true,
          };
        })
        .filter(event => !isNaN(event.start.getTime()));

      setEvents(formattedEvents);
    };

    fetchTasks();
  }, [user]);

  return (
    <div style={{ height: '90vh', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard">
          <button>← Back to Dashboard</button>
        </Link>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default CalendarView;