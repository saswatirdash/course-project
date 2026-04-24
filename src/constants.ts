/**
 * BTech Buddies - Game Economy Constants
 */

export const REWARDS = [
  { label: "Mock Test Given",           xp: 15,  icon: "📝" },
  { label: "Chapter Revised",           xp: 10,  icon: "📖" },
  { label: "Assignment Submitted",      xp: 8,   icon: "📤" },
  { label: "Lab Record Completed",      xp: 10,  icon: "🔬" },
  { label: "Doubt Cleared",             xp: 5,   icon: "💡" },
  { label: "10-Hour Study Day",         xp: 25,  icon: "🏆" },
  { label: "Formula Sheet Made",        xp: 7,   icon: "📋" },
  { label: "Group Study Session",       xp: 6,   icon: "👥" },
  { label: "Certification Completed",   xp: 30,  icon: "🎓" },
  { label: "Internship Secured",        xp: 50,  icon: "💼" },
  { label: "Semester Result Uploaded",  xp: 20,  icon: "📊" },
];

export const SHOP = [
  { label: "30 Min Netflix",            xp: -20, icon: "📺" },
  { label: "1 Hour Gaming",             xp: -35, icon: "🎮" },
  { label: "Social Media Pass (1h)",    xp: -25, icon: "📱" },
  { label: "Guilt-Free Nap",            xp: -10, icon: "😴" },
  { label: "Cheat Meal",                xp: -15, icon: "🍕" },
  { label: "YouTube Binge (2h)",        xp: -40, icon: "▶️" },
];

export const PUNISHMENTS = [
  { label: "Caught Doomscrolling",      xp: -20, icon: "📵" },
  { label: "Skipped Study Session",     xp: -30, icon: "⚠️" },
  { label: "Missed Daily Target",       xp: -25, icon: "❌" },
  { label: "Slept Past Alarm",          xp: -10, icon: "⏰" },
  { label: "Distracted in Pomodoro",    xp: -15, icon: "😤" },
  { label: "Bunked a Lecture",          xp: -20, icon: "🚪" },
  { label: "No Study Today",            xp: -50, icon: "💀" },
];

export const RANK_THRESHOLDS = {
  BEGINNER: 0,
  GRINDER: 200,
  ELITE: 500,
  LEGEND: 1000,
  UNSTOPPABLE: 2000,
};
