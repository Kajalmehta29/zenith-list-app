// src/achievements.js
export const achievements = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your very first task.',
    emoji: '🌱',
    condition: (stats) => stats.totalCompleted >= 1,
  },
  {
    id: 'task_novice',
    title: 'Task Novice',
    description: 'Complete 5 tasks.',
    emoji: '⭐',
    condition: (stats) => stats.totalCompleted >= 5,
  },
  {
    id: 'on_a_roll',
    title: 'On a Roll!',
    description: 'Reach a 3-day streak on any task.',
    emoji: '🔥',
    condition: (stats) => stats.longestStreak >= 3,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak.',
    emoji: '⚔️',
    condition: (stats) => stats.longestStreak >= 7,
  },
];