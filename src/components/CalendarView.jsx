import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'; 
import interactionPlugin from "@fullcalendar/interaction"; 
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

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
        .map(task => ({
          title: task.text,
          date: task.dueDate, 
        }));

      setEvents(formattedEvents);
    };

    fetchTasks();
  }, [user]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard">
          <button>← Back to Dashboard</button>
        </Link>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        }}
        events={events}
      />
    </div>
  );
};

export default CalendarView;