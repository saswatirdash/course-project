/**
 * BTech Buddies - Core Types
 */

export enum Rank {
  BEGINNER = 'BEGINNER',
  GRINDER = 'GRINDER',
  ELITE = 'ELITE',
  LEGEND = 'LEGEND',
  UNSTOPPABLE = 'UNSTOPPABLE',
}

export enum BtechYear {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
  FOURTH = 'FOURTH',
}

export enum CertStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

export enum InternshipStatus {
  APPLIED = 'APPLIED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum TransactionType {
  STUDY = 'STUDY',
  REWARD = 'REWARD',
  SHOP = 'SHOP',
  PUNISHMENT = 'PUNISHMENT',
  MASTERY = 'MASTERY',
  REVOCATION = 'REVOCATION',
  CERTIFICATION = 'CERTIFICATION',
  INTERNSHIP = 'INTERNSHIP',
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  btechYear: BtechYear;
  branch?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  lifetimeXp: number;
  balance: number;
  rank: Rank;
  streak: number;
  lastStudyDate?: string; // ISO String
  createdAt: string;
  updatedAt?: any;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  studyHours: number;
  targetHours: number;
  isTargetMet: boolean;
  winBonusClaimed: boolean;
  isCompleted: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  isLectureDone: boolean;
  isDppDone: boolean;
  isRefBookDone: boolean;
  isPyqDone: boolean;
  isCompleted: boolean;
  updatedAt: string;
}

export interface Semester {
  id: string;
  userId: string;
  number: number;
  gpa?: number;
  isActive: boolean;
  createdAt: string;
}

export interface SubjectGrade {
  id: string;
  semesterId: string;
  userId: string;
  subjectName: string;
  credits: number;
  grade?: string;
  gradePoint?: number;
  hasBacklog: boolean;
}

export interface Certification {
  id: string;
  userId: string;
  title: string;
  provider: string;
  url?: string;
  status: CertStatus;
  xpAwarded: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Internship {
  id: string;
  userId: string;
  company: string;
  role: string;
  type: string;
  startDate?: string;
  endDate?: string;
  status: InternshipStatus;
  stipend?: number;
  xpAwarded: boolean;
  createdAt: string;
}

export enum RoadmapStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface RoadmapSession {
  id: string;
  title: string;
  topics: string[];
  startTime: string;
  endTime: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  tips: string;
  status: RoadmapStatus;
  elapsedSeconds: number;
  lastStartedAt?: string | null;
}

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  syllabus: string;
  timeframe: string;
  totalStudyHours: number;
  sessions: RoadmapSession[];
  createdAt: string;
  isArchived: boolean;
}
