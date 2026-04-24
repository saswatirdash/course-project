import { Rank, BtechYear, SubjectGrade } from "../types";
import { RANK_THRESHOLDS } from "../constants";

export function calculateLevel(xp: number): number {
  return Math.max(0, Math.floor(xp / 100));
}

export function getXpToNextLevel(xp: number): number {
  return 100 - (xp % 100);
}

export function getXpProgressPercent(xp: number): number {
  return xp % 100;
}

export function calculateRank(xp: number): Rank {
  if (xp >= RANK_THRESHOLDS.UNSTOPPABLE) return Rank.UNSTOPPABLE;
  if (xp >= RANK_THRESHOLDS.LEGEND) return Rank.LEGEND;
  if (xp >= RANK_THRESHOLDS.ELITE) return Rank.ELITE;
  if (xp >= RANK_THRESHOLDS.GRINDER) return Rank.GRINDER;
  return Rank.BEGINNER;
}

export function getYearLabel(year: BtechYear): string {
  switch (year) {
    case BtechYear.FIRST: return "1st Year";
    case BtechYear.SECOND: return "2nd Year";
    case BtechYear.THIRD: return "3rd Year";
    case BtechYear.FOURTH: return "4th Year";
    default: return "BTech Student";
  }
}

export function calculateGPA(grades: SubjectGrade[]): number {
  if (grades.length === 0) return 0;
  let totalPoints = 0;
  let totalCredits = 0;
  
  grades.forEach(grade => {
    if (grade.gradePoint !== undefined) {
      totalPoints += (grade.gradePoint * grade.credits);
      totalCredits += grade.credits;
    }
  });
  
  return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
}

export function calculateCGPA(semesterGPAs: number[]): number {
  const validGPAs = semesterGPAs.filter(gpa => gpa > 0);
  if (validGPAs.length === 0) return 0;
  const sum = validGPAs.reduce((a, b) => a + b, 0);
  return Number((sum / validGPAs.length).toFixed(2));
}
