// src/components/AchievementsList.jsx
import React from 'react';
import { achievements } from '../achievements';

const AchievementsList = ({ unlockedIds = [] }) => {
  const unlockedAchievements = achievements.filter(a => unlockedIds.includes(a.id));

  return (
    <div>
      <h2>🏆 Achievements Unlocked ({unlockedAchievements.length} / {achievements.length})</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {achievements.map(ach => (
          <div 
            key={ach.id} 
            title={ach.description}
            style={{ 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '8px', 
              textAlign: 'center',
              opacity: unlockedIds.includes(ach.id) ? 1 : 0.3,
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>{ach.emoji}</span>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{ach.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsList;