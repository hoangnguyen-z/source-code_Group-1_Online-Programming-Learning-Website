
export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export type UserStatus = 'active' | 'locked';

export interface UserPreferences {
  language: 'en' | 'vn';
  notifications: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for auth simulation
  failedLoginAttempts?: number; // Added for security
  role: UserRole;
  avatarUrl?: string;
  coursesEnrolled?: string[]; // Course IDs
  status: UserStatus;
  bio?: string;
  title?: string;
  learningGoals?: string;
  preferences?: UserPreferences;
  studyGroups?: string[]; // Group IDs
}

export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'coding' | 'project';
  content: string; // Markdown, Video URL, Code Template, or Project instructions
  durationMinutes: number;
  completed?: boolean;
  quizData?: QuizQuestion[]; // Optional for quiz type
}

export interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  meetLink: string;
  startTime: string; // ISO Date string
  durationMinutes: number;
  instructorName: string;
}

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId?: string;
  thumbnail: string;
  price: number;
  level: CourseLevel;
  language: string;
  rating: number;
  studentsCount: number;
  lessons: Lesson[];
  status: CourseStatus;
  progress?: number; // 0-100 for enrolled students (computed client side)
  tags: string[];
  reviews?: Review[];
  liveSessions?: LiveSession[]; // New feature
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'open' | 'closed';
}

export interface CodeSubmission {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  lessonId: string; // Can be an assignment ID
  lessonTitle: string;
  type: 'coding' | 'project' | 'quiz' | 'file';
  code?: string; // For coding
  repoUrl?: string; // For projects
  fileUrl?: string; // For file uploads
  description?: string; // For projects
  score: number | null; // null if not graded
  testCasesPassed?: number;
  totalTestCases?: number;
  feedback: string | null;
  submittedAt: string;
  status: 'pending' | 'graded';
}

export interface PortfolioProject {
  id: string;
  studentId: string;
  title: string;
  description: string;
  imageUrl: string;
  demoUrl?: string;
  tags: string[];
  createdAt: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseContext?: string; // Optional
  members: string[]; // User IDs
  memberCount: number;
  posts: ForumPost[];
}

export interface Notification {
  id: string;
  userId: string; // Target user for the notification
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  date: string;
  gateway: 'VNPay' | 'MoMo' | 'Stripe';
  status: 'success' | 'failed';
}

export type ReportStatus = 'new' | 'in_progress' | 'resolved';

export interface Report {
  id: string;
  userId: string;
  type: 'ui' | 'content' | 'payment' | 'other';
  description: string;
  status: ReportStatus;
  reply?: string;
  createdAt: string;
}

export interface Backup {
  id: string;
  name: string;
  size: string;
  type: 'full' | 'database' | 'files';
  createdAt: string;
}

export interface ForumPost {
  id: string;
  courseId?: string;
  groupId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: number;
  replies: ForumPost[];
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string; // Teacher or Student ID
  courseId?: string; // Optional context
  content: string;
  timestamp: number;
  read: boolean;
}

export interface SystemConfig {
  siteName: string;
  supportEmail: string;
  aiEnabled: boolean;
  aiRequestLimit: number;
  smtpHost: string;
  smsProvider: string;
  paymentGateways: {
    vnpay: boolean;
    momo: boolean;
    stripe: boolean;
  };
}