import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import { getMonth, getYear, startOfWeek } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CompletionsReport = ({ tasks }) => {
  const [chartData, setChartData] = useState(null);
  const [view, setView] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const labels = [];
    let dataPoints = [];

    if (view === 'weekly') {
      const start = startOfWeek(selectedDate);
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        
        labels.push(`${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getDate()}`);
      }
      dataPoints = labels.map((_, i) => {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        return tasks.filter(t => t.lastCompleted && t.lastCompleted.toDate().toDateString() === date.toDateString()).length;
      });
    } else if (view === 'monthly') {
      const year = getYear(selectedDate);
      const month = getMonth(selectedDate);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(i.toString());
      }
      dataPoints = labels.map(day => {
        return tasks.filter(t => {
          if (!t.lastCompleted) return false;
          const d = t.lastCompleted.toDate();
          return d.getFullYear() === year && d.getMonth() === month && d.getDate() === parseInt(day);
        }).length;
      });
    } else if (view === 'yearly') {
      const year = getYear(selectedDate);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      labels.push(...monthNames);
      dataPoints = monthNames.map((_, monthIndex) => {
        return tasks.filter(t => {
          if (!t.lastCompleted) return false;
          const d = t.lastCompleted.toDate();
          return d.getFullYear() === year && d.getMonth() === monthIndex;
        }).length;
      });
    }
    setChartData({ labels, datasets: [{ label: 'Tasks Completed', data: dataPoints, backgroundColor: 'rgba(187, 134, 252, 0.6)' }] });
  }, [tasks, view, selectedDate]);

  return (
    <div className="completions-report">
      <h2>Completions Report</h2>
      <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <button onClick={() => setView('weekly')} disabled={view === 'weekly'}>Week</button>
          <button onClick={() => setView('monthly')} disabled={view === 'monthly'}>Month</button>
          <button onClick={() => setView('yearly')} disabled={view === 'yearly'}>Year</button>
        </div>
        <div>
          {view === 'weekly' && <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />}
          {view === 'monthly' && <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="MM/yyyy" showMonthYearPicker />}
          {view === 'yearly' && <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} dateFormat="yyyy" showYearPicker />}
        </div>
      </div>
      {chartData ? <Bar options={{ responsive: true }} data={chartData} /> : <p>Loading chart data...</p>}
    </div>
  );
};

export default CompletionsReport;