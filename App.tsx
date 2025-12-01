
import React, { useState, useContext, createContext, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { AIChatbot } from './components/AIChatbot';
import { CodeEditor } from './components/CodeEditor';
import { User, UserRole, Course, CodeSubmission, CourseLevel, Notification, Lesson, Transaction, Review, Report, ForumPost, PrivateMessage, CourseStatus, SystemConfig, Backup, ReportStatus, Assignment, PortfolioProject, StudyGroup, LiveSession } from './types';
import { MOCK_USERS, MOCK_COURSES, MOCK_SUBMISSIONS, TRANSLATIONS, DEFAULT_SYSTEM_CONFIG, MOCK_ASSIGNMENTS, MOCK_PROJECTS, MOCK_GROUPS } from './constants';
import { gradeCodeWithAI, analyzeNavigationIntent } from './services/geminiService';
import { 
  PlayCircle, Book, Clock, Award, Star, 
  CheckCircle2, Lock, Users, DollarSign,
  TrendingUp, ShieldAlert, Plus, Trash2, FileText, CreditCard, Send, Camera, Mail, User as UserIcon, Settings, Save, GitBranch, Github, ArrowRight, MessageCircle, Flag, ThumbsUp, CornerDownRight, Shield, BadgeCheck, Search, EyeOff, Eye, Unlock, RefreshCw, Layers, Download, Server, Cpu, Database, RefreshCcw, Archive, AlertTriangle, BookOpen, MoreVertical, LogOut, Upload, Code, X, MessageSquare, Video, Calendar, FolderOpen, Briefcase, Link, QrCode, ArrowLeft, Copy, Edit, Sun, Moon, Megaphone, BarChart, Activity, List, UserCheck, Trophy, UserPlus, DownloadCloud, HelpCircle, ChevronDown, ChevronUp, Bot, Sparkles, UploadCloud, Key
} from 'lucide-react';
import { BarChart as ReChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// --- Global Context ---
interface AppContextType {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  submissions: CodeSubmission[];
  notifications: Notification[];
  transactions: Transaction[];
  reports: Report[];
  backups: Backup[];
  forumPosts: ForumPost[];
  privateMessages: PrivateMessage[];
  systemConfig: SystemConfig;
  assignments: Assignment[];
  projects: PortfolioProject[];
  studyGroups: StudyGroup[];
  language: 'en' | 'vn';
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (email: string, password: string) => { success: boolean, message?: string };
  register: (name: string, email: string, password: string, role: UserRole) => boolean;
  adminCreateUser: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
  enrollCourse: (courseId: string, transaction?: Transaction) => void;
  submitAssignment: (submission: CodeSubmission) => void;
  gradeAssignment: (id: string, score: number, feedback: string) => void;
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, data: Partial<Course>) => void;
  addLessonToCourse: (courseId: string, lesson: Lesson) => void;
  addLiveSessionToCourse: (courseId: string, session: LiveSession) => void;
  updateUserStatus: (id: string, status: 'active' | 'locked') => void;
  changeOwnPassword: (currentPass: string, newPass: string) => { success: boolean, message?: string };
  updateUserProfile: (data: Partial<User>) => void;
  updateCourseStatus: (id: string, status: CourseStatus) => void;
  updateCourseLevel: (id: string, level: CourseLevel) => void;
  updateSystemConfig: (config: SystemConfig) => void;
  createBackup: () => void;
  restoreBackup: (id: string) => void;
  updateReportStatus: (id: string, status: ReportStatus) => void;
  replyToReport: (id: string, reply: string) => void;
  addNotification: (msg: string, type: 'info'|'success'|'error'|'warning', targetUserId?: string) => void;
  markNotificationsRead: () => void;
  addReport: (report: Report) => void;
  addReview: (review: Review) => void;
  addForumPost: (post: ForumPost) => void;
  addForumReply: (postId: string, reply: ForumPost) => void;
  sendPrivateMessage: (msg: PrivateMessage) => void;
  addProject: (project: PortfolioProject) => void;
  joinGroup: (groupId: string) => void;
  createGroup: (group: StudyGroup) => void;
  setLanguage: (lang: 'en' | 'vn') => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider ---
const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<'en' | 'vn'>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [submissions, setSubmissions] = useState<CodeSubmission[]>(MOCK_SUBMISSIONS.map(s => ({...s, status: s.score ? 'graded' : 'pending'})));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', userId: 'u1', courseId: 'c1', courseTitle: 'Python for Data Science', amount: 49.99, date: '2023-10-20', gateway: 'VNPay', status: 'success'}
  ]);
  const [reports, setReports] = useState<Report[]>([
    { id: 'rpt1', userId: 'u1', type: 'ui', description: 'Button overlaps on mobile', status: 'new', createdAt: '2023-10-28 14:00' }
  ]);
  const [backups, setBackups] = useState<Backup[]>([
     { id: 'b1', name: 'Auto Backup', size: '256 MB', type: 'full', createdAt: '2023-10-25 00:00:00' }
  ]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([
    { 
      id: 'm1', 
      senderId: 'u2', 
      receiverId: 'u1', 
      courseId: 'c1',
      content: 'Welcome to Python for Data Science! I am your instructor.', 
      timestamp: Date.now() - 1000000, 
      read: false 
    }
  ]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [projects, setProjects] = useState<PortfolioProject[]>(MOCK_PROJECTS);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(MOCK_GROUPS);

  useEffect(() => {
    if (currentUser && currentUser.preferences) {
      setLanguage(currentUser.preferences.language);
    }
  }, [currentUser]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const t = (key: string) => {
    // @ts-ignore
    return TRANSLATIONS[language][key] || key;
  };

  const login = (email: string, password: string) => {
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return { success: false, message: t('errorLogin') };

    const user = users[userIndex];
    if (user.status === 'locked') return { success: false, message: t('errorLocked') };

    if (user.password === password) {
      const updatedUsers = [...users];
      updatedUsers[userIndex] = { ...user, failedLoginAttempts: 0 };
      setUsers(updatedUsers);
      setCurrentUser(updatedUsers[userIndex]);
      return { success: true };
    } else {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updatedUsers = [...users];
      if (attempts >= 5) {
        updatedUsers[userIndex] = { ...user, failedLoginAttempts: attempts, status: 'locked' };
        setUsers(updatedUsers);
        return { success: false, message: t('errorLocked') };
      } else {
        updatedUsers[userIndex] = { ...user, failedLoginAttempts: attempts };
        setUsers(updatedUsers);
        return { success: false, message: t('errorLogin') };
      }
    }
  };

  const register = (name: string, email: string, password: string, role: UserRole) => {
    if (users.find(u => u.email === email)) return false;
    const newUser: User = {
      id: `u${Date.now()}`, name, email, password, role, status: 'active',
      coursesEnrolled: [], avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random`,
      preferences: { language: 'en', notifications: true }, failedLoginAttempts: 0
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    addNotification(t('success'), 'success');
    return true;
  };

  const adminCreateUser = (name: string, email: string, password: string, role: UserRole) => {
     if (users.find(u => u.email === email)) { addNotification("Email already exists", 'error'); return; }
     const newUser: User = {
      id: `u${Date.now()}`, name, email, password, role, status: 'active',
      coursesEnrolled: [], avatarUrl: `https://ui-avatars.com/api/?name=${name}&background=random`,
      preferences: { language: 'en', notifications: true }, failedLoginAttempts: 0
    };
    setUsers(prev => [...prev, newUser]);
    addNotification(`User ${name} (${role}) created successfully.`, 'success');
  }

  const logout = () => setCurrentUser(null);

  const enrollCourse = (courseId: string, transaction?: Transaction) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, coursesEnrolled: [...(currentUser.coursesEnrolled || []), courseId] };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, studentsCount: c.studentsCount + 1 } : c));
    if (transaction) setTransactions(prev => [transaction, ...prev]);

    const course = courses.find(c => c.id === courseId);
    if (course && course.instructorId) {
      const welcomeMsg: PrivateMessage = {
        id: `msg_${Date.now()}`, senderId: course.instructorId, receiverId: currentUser.id,
        courseId: courseId, content: `Welcome to ${course.title}!`, timestamp: Date.now(), read: false
      };
      setPrivateMessages(prev => [...prev, welcomeMsg]);
    }
    addNotification(t('success'), 'success');
  };

  const addNotification = (msg: string, type: 'info'|'success'|'error'|'warning', targetUserId?: string) => {
    const userId = targetUserId || currentUser?.id;
    if (!userId) return;
    setNotifications(prev => [{
      id: Date.now().toString(), userId, title: 'System', message: msg, type, read: false, createdAt: Date.now()
    }, ...prev]);
  };

  const submitAssignment = (sub: CodeSubmission) => {
    setSubmissions(prev => [sub, ...prev]);
    addNotification(t('submissionSuccess'), 'success', sub.studentId);
    const course = courses.find(c => c.id === sub.courseId);
    if (course && course.instructorId) {
       addNotification(`New submission from ${sub.studentName} in ${course.title}`, 'info', course.instructorId);
    }
  };

  const gradeAssignment = (id: string, score: number, feedback: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, score, feedback, status: 'graded' } : s));
    addNotification(`${t('score')}: ${score}`, 'info');
  };

  const addCourse = (course: Course) => { setCourses(prev => [...prev, course]); addNotification(t('courseCreated'), 'success'); };
  const updateCourse = (courseId: string, data: Partial<Course>) => { setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...data } : c)); addNotification(t('courseUpdated'), 'success'); };
  const addLessonToCourse = (courseId: string, lesson: Lesson) => { setCourses(prev => prev.map(c => c.id === courseId ? { ...c, lessons: [...c.lessons, lesson] } : c)); addNotification("Lesson added successfully", 'success'); };
  const addLiveSessionToCourse = (courseId: string, session: LiveSession) => { setCourses(prev => prev.map(c => c.id === courseId ? { ...c, liveSessions: [...(c.liveSessions || []), session] } : c)); addNotification("Live session scheduled", 'success'); };
  const updateUserStatus = (id: string, status: 'active' | 'locked') => { setUsers(prev => prev.map(u => u.id === id ? { ...u, status, failedLoginAttempts: status === 'active' ? 0 : u.failedLoginAttempts } : u)); addNotification(`${t('status')}: ${status}`, 'info'); };
  
  const changeOwnPassword = (currentPass: string, newPass: string) => {
    if (!currentUser) return { success: false };
    if (currentUser.password !== currentPass) return { success: false, message: 'Incorrect current password' };
    
    const updatedUser = { ...currentUser, password: newPass };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    addNotification(t('success'), 'success');
    return { success: true };
  };
  
  const updateUserProfile = (data: Partial<User>) => { if (!currentUser) return; const updatedUser = { ...currentUser, ...data }; setCurrentUser(updatedUser); setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u)); if (data.preferences?.language) setLanguage(data.preferences.language); addNotification(t('success'), 'success'); };
  const updateCourseStatus = (id: string, status: CourseStatus) => { setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c)); addNotification(t('courseUpdated'), 'success'); };
  const updateCourseLevel = (id: string, level: CourseLevel) => { setCourses(prev => prev.map(c => c.id === id ? { ...c, level } : c)); addNotification(t('pathUpdated'), 'success'); }
  const updateSystemConfig = (config: SystemConfig) => { setSystemConfig(config); addNotification(t('configSaved'), 'success'); }
  const createBackup = () => { setBackups(prev => [{ id: `b${Date.now()}`, name: `Backup-${new Date().toISOString().split('T')[0]}`, size: '300 MB', type: 'full', createdAt: new Date().toLocaleString() }, ...prev]); addNotification(t('backupCreated'), 'success'); }
  const restoreBackup = (id: string) => { addNotification(t('restoring'), 'info'); setTimeout(() => addNotification(t('restoreSuccess'), 'success'), 2000); }
  const updateReportStatus = (id: string, status: ReportStatus) => { setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r)); addNotification(`Report marked as ${status}`, 'success'); }
  const replyToReport = (id: string, reply: string) => { setReports(prev => prev.map(r => r.id === id ? { ...r, reply, status: 'resolved' } : r)); addNotification(t('replySent'), 'success'); }
  const markNotificationsRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };
  const addReport = (report: Report) => { setReports(prev => [report, ...prev]); addNotification(t('reportSubmitted'), 'success'); }
  const addReview = (review: Review) => { setCourses(prev => prev.map(c => c.id === review.courseId ? { ...c, reviews: [...(c.reviews || []), review], rating: parseFloat(((c.reviews || []).reduce((acc, r) => acc + r.rating, review.rating) / ((c.reviews?.length || 0) + 1)).toFixed(1)) } : c)); }
  
  const addForumPost = (post: ForumPost) => { 
    // Update global list
    setForumPosts(prev => [post, ...prev]); 
    // Update specific group list to ensure local consistency
    if (post.groupId) {
      setStudyGroups(prev => prev.map(g => g.id === post.groupId ? { ...g, posts: [post, ...g.posts] } : g));
    }
  }
  
  const addForumReply = (postId: string, reply: ForumPost) => { setForumPosts(prev => prev.map(post => post.id === postId ? { ...post, replies: [...post.replies, reply] } : post)); }
  const sendPrivateMessage = (msg: PrivateMessage) => { setPrivateMessages(prev => [...prev, msg]); }
  const addProject = (project: PortfolioProject) => { setProjects(prev => [project, ...prev]); addNotification("Project created successfully", 'success'); }
  const joinGroup = (groupId: string) => { if (!currentUser) return; setStudyGroups(prev => prev.map(g => g.id === groupId && !g.members.includes(currentUser.id) ? { ...g, members: [...g.members, currentUser.id], memberCount: g.memberCount + 1 } : g)); setCurrentUser({ ...currentUser, studyGroups: [...(currentUser.studyGroups || []), groupId] }); addNotification("Joined group successfully", 'success'); }
  const createGroup = (group: StudyGroup) => { setStudyGroups(prev => [...prev, group]); addNotification("Group created successfully", 'success'); }

  return (
    <AppContext.Provider value={{ 
      currentUser, users, courses, submissions, notifications, language, darkMode, transactions, reports, backups, forumPosts, privateMessages, systemConfig, assignments, projects, studyGroups,
      login, register, adminCreateUser, logout, enrollCourse, submitAssignment, gradeAssignment, 
      addCourse, updateCourse, addLessonToCourse, addLiveSessionToCourse, updateUserStatus, changeOwnPassword, updateUserProfile, updateCourseStatus, updateCourseLevel, updateSystemConfig,
      createBackup, restoreBackup, updateReportStatus, replyToReport,
      addNotification, markNotificationsRead, addReport, addReview, addForumPost, addForumReply, sendPrivateMessage,
      addProject, joinGroup, createGroup,
      setLanguage, toggleDarkMode, t
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- Components ---

const CourseLeaderboard = ({ courseId }: { courseId: string }) => {
  const { users, submissions, t } = useAppContext();
  const courseSubmissions = submissions.filter(s => s.courseId === courseId && s.status === 'graded');
  const scores = new Map<string, number>();
  courseSubmissions.forEach(s => scores.set(s.studentId, (scores.get(s.studentId) || 0) + (s.score || 0)));
  const leaderboard = Array.from(scores.entries()).map(([sid, sc]) => ({ student: users.find(u => u.id === sid), score: sc })).filter(i => i.student).sort((a,b) => b.score - a.score).slice(0, 5);
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
      <h3 className="font-bold dark:text-white mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/>{t('leaderboard')}</h3>
      <div className="space-y-3">{leaderboard.map((e,i) => (
        <div key={e.student!.id} className="flex justify-between"><div className="flex gap-2 items-center"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${i===0?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-600'}`}>{i+1}</span><span className="text-sm dark:text-gray-300">{e.student!.name}</span></div><span className="font-bold text-primary">{e.score}</span></div>
      ))}</div>
    </div>
  );
};

const ReportModal = ({ onClose, initialContext }: { onClose: () => void, initialContext?: string }) => {
  const { addReport, currentUser, t } = useAppContext();
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<Report['type']>('ui');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-xl">
        <h2 className="text-lg font-bold mb-4 dark:text-white">{t('reportIssue')}</h2>
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full mb-3 p-2 border rounded dark:bg-gray-700 dark:text-white">
          <option value="ui">{t('uiIssue')}</option>
          <option value="content">{t('contentIssue')}</option>
          <option value="payment">{t('paymentIssue')}</option>
          <option value="other">{t('otherIssue')}</option>
        </select>
        <textarea className="w-full p-2 border rounded mb-4 h-32 dark:bg-gray-700 dark:text-white" placeholder={t('describeIssue')} value={desc} onChange={e => setDesc(e.target.value)}/>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300">{t('cancel')}</button>
          <button onClick={() => { addReport({ id: `r_${Date.now()}`, userId: currentUser?.id || 'guest', type, description: initialContext ? `[${initialContext}] ${desc}` : desc, status: 'new', createdAt: new Date().toLocaleString() }); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded">{t('submit')}</button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ course, onClose, onConfirm }: { course: Course, onClose: () => void, onConfirm: (gw: Transaction['gateway']) => void }) => {
  const { t } = useAppContext();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6">
        <div className="flex justify-between mb-6"><h2 className="text-xl font-bold dark:text-white">{t('securePayment')}</h2><button onClick={onClose}><X className="dark:text-white"/></button></div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl mb-6 flex justify-between"><span className="dark:text-gray-300">{t('totalToPay')}</span><span className="text-2xl font-bold text-primary">${course.price}</span></div>
        
        <div className="flex flex-col items-center mb-6 space-y-2">
           <div className="bg-white p-2 rounded-xl border shadow-sm">
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PaymentFor_${course.id}`} alt="Payment QR" className="w-40 h-40" />
           </div>
           <p className="text-sm text-gray-500 text-center dark:text-gray-400">{t('scanPay')}</p>
        </div>

        <div className="space-y-3">
          <button onClick={() => onConfirm('VNPay')} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-md">
             {t('iHavePaid')}
          </button>
          <button onClick={onClose} className="w-full py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">
             {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

const GuestSupportWidget = () => {
  const { sendPrivateMessage, users, currentUser, t } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hasSent, setHasSent] = useState(false);

  // Hide if user is logged in
  if (currentUser) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    const adminUser = users.find(u => u.role === UserRole.ADMIN);
    if (adminUser) {
      const guestId = `guest_${Date.now()}`;
      sendPrivateMessage({
        id: `msg_${Date.now()}`,
        senderId: guestId,
        receiverId: adminUser.id,
        courseId: 'c_support', 
        content: `[GUEST] ${message}`,
        timestamp: Date.now(),
        read: false
      });
      setHasSent(true);
      setTimeout(() => {
        setHasSent(false);
        setIsOpen(false);
        setMessage('');
      }, 2000);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-medium hidden md:inline">{t('contactAdmin')}</span>
        </button>
      )}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 p-4 flex flex-col w-80">
           <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold dark:text-white flex items-center gap-2"><Shield className="w-4 h-4 text-primary"/> {t('adminSupport')}</h3>
              <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-gray-500 dark:text-gray-400"/></button>
           </div>
           {hasSent ? (
             <div className="flex flex-col items-center justify-center h-32 text-green-600">
                <CheckCircle2 className="w-8 h-8 mb-2"/>
                <p className="text-sm">{t('messageSent')}</p>
             </div>
           ) : (
             <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('guestHelpText')}</p>
                <textarea 
                  className="w-full p-3 border rounded-lg text-sm dark:bg-gray-700 dark:text-white resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                  rows={4}
                  placeholder={t('howHelp')}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                ></textarea>
                <button onClick={handleSend} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">{t('sendMessage')}</button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

const AuthView = ({ onLoginSuccess }: { onLoginSuccess: (role: UserRole) => void }) => {
  const { login, register, t } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const res = login(email, password);
      if (res.success) onLoginSuccess(UserRole.STUDENT); // Role check handled inside App logic really
      else setError(res.message || 'Login failed');
    } else {
      if (register(name, email, password, UserRole.STUDENT)) onLoginSuccess(UserRole.STUDENT);
      else setError('Email already exists');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">{isLogin ? t('welcomeBack') : t('createAccount')}</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && <input type="text" placeholder={t('fullName')} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" value={name} onChange={e => setName(e.target.value)} required />}
          <input type="email" placeholder={t('email')} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder={t('password')} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-primary text-white p-3 rounded-lg hover:bg-indigo-700 transition">{isLogin ? t('login') : t('register')}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center mt-4 text-sm text-gray-600 dark:text-gray-400 hover:underline">{isLogin ? t('newUser') : t('alreadyAccount')}</button>
      </div>
    </div>
  );
};

const LandingView = ({ onEnroll, onNavigate }: { onEnroll: (id: string) => void, onNavigate: (v: string) => void }) => {
  const { courses, currentUser, enrollCourse, t } = useAppContext();
  const [showPay, setShowPay] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = courses.filter(c => c.status === 'published' && c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-indigo-600 rounded-2xl p-8 text-white flex justify-between items-center">
        <div><h1 className="text-3xl font-bold mb-2">{t('welcome')}</h1><p className="opacity-90">{t('welcomeDesc')}</p></div>
        {!currentUser && <button onClick={() => onNavigate('auth')} className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100">{t('startLearning')}</button>}
      </div>
      <div className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
        <Search className="w-5 h-5 text-gray-400 mr-3"/><input placeholder={t('searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none dark:text-white"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(course => {
          const isEnrolled = currentUser?.coursesEnrolled?.includes(course.id);
          return (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition dark:border-gray-700 flex flex-col">
              <img src={course.thumbnail} className="h-40 w-full object-cover" alt=""/>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-primary bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">{t(course.level) || course.level}</span><span className="text-xs text-gray-500 flex items-center"><Star className="w-3 h-3 text-yellow-400 mr-1"/>{course.rating}</span></div>
                <h3 className="font-bold text-lg mb-2 dark:text-white">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{course.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-lg dark:text-white">{course.price === 0 ? t('free') : `$${course.price}`}</span>
                  {isEnrolled ? 
                    <button onClick={() => onEnroll(course.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">{t('continue')}</button> :
                    <button 
                      onClick={() => {
                        if (!currentUser) { onNavigate('auth'); return; }
                        if (course.price === 0) enrollCourse(course.id);
                        else setShowPay(course.id);
                      }} 
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm"
                    >
                       {course.price > 0 ? t('payNow') : t('enroll')}
                    </button>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showPay && currentUser && (
        <PaymentModal 
          course={courses.find(c => c.id === showPay)!} 
          onClose={() => setShowPay(null)} 
          onConfirm={(gw) => { 
            enrollCourse(showPay, { 
              id: `tx_${Date.now()}`, 
              userId: currentUser.id, 
              courseId: showPay, 
              courseTitle: courses.find(c => c.id === showPay)!.title, 
              amount: courses.find(c => c.id === showPay)!.price, 
              date: new Date().toISOString(), 
              gateway: gw, 
              status: 'success' 
            }); 
            setShowPay(null); 
          }} 
        />
      )}
    </div>
  );
};

const DashboardView = ({ onContinue }: { onContinue: (id: string) => void }) => {
  const { currentUser, courses, t } = useAppContext();
  const [intentSearch, setIntentSearch] = useState('');
  
  const myCourses = courses.filter(c => currentUser?.coursesEnrolled?.includes(c.id));

  const handleSmartNav = async () => {
    if (!intentSearch) return;
    const result = await analyzeNavigationIntent(intentSearch);
    console.log("Intent:", result);
    setIntentSearch('');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold dark:text-white">{t('dashboardTitle')}</h1>
         <div className="relative w-64">
             <input 
               value={intentSearch} onChange={e => setIntentSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSmartNav()}
               placeholder={t('smartNavPlaceholder')} className="w-full pl-3 pr-10 py-2 border rounded-full text-sm dark:bg-gray-700 dark:text-white" 
             />
             <ArrowRight className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 cursor-pointer" onClick={handleSmartNav}/>
         </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <Book className="w-8 h-8 mb-2 opacity-80"/><p className="text-sm opacity-80">{t('activeCourses')}</p><h3 className="text-3xl font-bold">{myCourses.length}</h3>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <CheckCircle2 className="w-8 h-8 mb-2 opacity-80"/><p className="text-sm opacity-80">{t('lessonsCompleted')}</p><h3 className="text-3xl font-bold">12</h3>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <Clock className="w-8 h-8 mb-2 opacity-80"/><p className="text-sm opacity-80">{t('studyTime')}</p><h3 className="text-3xl font-bold">24h</h3>
        </div>
      </div>
      <h2 className="text-xl font-bold dark:text-white">{t('myCourses')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.map(c => (
          <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm dark:border-gray-700">
            <div className="flex gap-4">
              <img src={c.thumbnail} className="w-20 h-20 rounded-lg object-cover" alt=""/>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1 dark:text-white">{c.title}</h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2"><div className="bg-primary h-2 rounded-full" style={{width: `${c.progress}%`}}></div></div>
                <button onClick={() => onContinue(c.id)} className="text-xs bg-primary text-white px-3 py-1 rounded-md">{t('continue')}</button>
              </div>
            </div>
          </div>
        ))}
        {myCourses.length === 0 && <p className="text-gray-500">{t('noCoursesEnrolled')}</p>}
      </div>
    </div>
  );
};

const StudentGradesView = () => {
  const { submissions, t } = useAppContext();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">{t('grades')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"><tr><th className="px-6 py-3">{t('course')}</th><th className="px-6 py-3">{t('task')}</th><th className="px-6 py-3">{t('score')}</th><th className="px-6 py-3">{t('feedback')}</th><th className="px-6 py-3">{t('status')}</th></tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {submissions.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium dark:text-white">{s.courseTitle}</td><td className="px-6 py-4 dark:text-gray-300">{s.lessonTitle}</td>
                <td className="px-6 py-4 font-bold text-primary">{s.score !== null ? s.score : '-'}</td><td className="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">{s.feedback || '-'}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${s.status==='graded'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TeacherPortalView = () => {
  const { courses, submissions, gradeAssignment, t, currentUser, addCourse, updateCourse, addLessonToCourse, addLiveSessionToCourse } = useAppContext();
  const [activeTab, setActiveTab] = useState<'grading' | 'courses'>('courses');
  
  // Grading
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  // Course Management
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [manageTab, setManageTab] = useState<'details' | 'curriculum' | 'live'>('details');
  
  // Form States
  const [newCourse, setNewCourse] = useState<Partial<Course>>({ title: '', description: '', price: 0, level: CourseLevel.BEGINNER, thumbnail: 'https://picsum.photos/200' });
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({ title: '', type: 'video', content: '', durationMinutes: 10 });
  const [newSession, setNewSession] = useState<Partial<LiveSession>>({ title: '', startTime: '', durationMinutes: 60, meetLink: '' });

  const myCourses = courses.filter(c => c.instructorId === currentUser?.id);
  const pendingSubmissions = submissions.filter(s => myCourses.map(c => c.id).includes(s.courseId) && s.status === 'pending');
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const handleAutoGrade = async (code: string, task: string) => {
    const result = await gradeCodeWithAI(code, task);
    setScore(result.score);
    setFeedback(result.feedback);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Tabs */}
      {!selectedCourseId && (
        <div className="flex gap-6 border-b dark:border-gray-700">
           <button onClick={() => setActiveTab('courses')} className={`pb-3 text-sm font-medium ${activeTab==='courses' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('myCoursesTab')}</button>
           <button onClick={() => setActiveTab('grading')} className={`pb-3 text-sm font-medium ${activeTab==='grading' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('gradingTab')} ({pendingSubmissions.length})</button>
        </div>
      )}

      {selectedCourseId && selectedCourse ? (
        // Manage Course View
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
           <div className="p-4 border-b dark:border-gray-700 flex items-center gap-4 bg-gray-50 dark:bg-gray-900">
              <button onClick={() => setSelectedCourseId(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><ArrowLeft className="w-5 h-5 dark:text-white"/></button>
              <h2 className="text-lg font-bold dark:text-white">{selectedCourse.title}</h2>
           </div>
           <div className="flex border-b dark:border-gray-700">
              <button onClick={() => setManageTab('details')} className={`flex-1 py-3 text-sm font-medium ${manageTab==='details' ? 'bg-indigo-50 text-primary border-b-2 border-primary dark:bg-indigo-900/20' : 'text-gray-500 dark:text-gray-400'}`}>{t('detailsTab')}</button>
              <button onClick={() => setManageTab('curriculum')} className={`flex-1 py-3 text-sm font-medium ${manageTab==='curriculum' ? 'bg-indigo-50 text-primary border-b-2 border-primary dark:bg-indigo-900/20' : 'text-gray-500 dark:text-gray-400'}`}>{t('curriculumTab')}</button>
              <button onClick={() => setManageTab('live')} className={`flex-1 py-3 text-sm font-medium ${manageTab==='live' ? 'bg-indigo-50 text-primary border-b-2 border-primary dark:bg-indigo-900/20' : 'text-gray-500 dark:text-gray-400'}`}>{t('liveClassesTab')}</button>
           </div>
           
           <div className="p-6 flex-1 overflow-y-auto">
              {manageTab === 'details' && (
                 <div className="space-y-4 max-w-2xl mx-auto">
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('courseTitle')}</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={selectedCourse.title} onChange={e => updateCourse(selectedCourse.id, { title: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('description')}</label><textarea className="w-full p-2 border rounded h-24 dark:bg-gray-700 dark:text-white" value={selectedCourse.description} onChange={e => updateCourse(selectedCourse.id, { description: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                       <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('price')} ($)</label><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={selectedCourse.price} onChange={e => updateCourse(selectedCourse.id, { price: parseFloat(e.target.value) })} /></div>
                       <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('role')}</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={selectedCourse.level} onChange={e => updateCourse(selectedCourse.id, { level: e.target.value as any })}>{Object.values(CourseLevel).map(l => <option key={l} value={l}>{t(l)}</option>)}</select></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('thumbnailUrl')}</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={selectedCourse.thumbnail} onChange={e => updateCourse(selectedCourse.id, { thumbnail: e.target.value })} /></div>
                    <div className="pt-4"><button onClick={() => setSelectedCourseId(null)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">{t('saveClose')}</button></div>
                 </div>
              )}
              
              {manageTab === 'curriculum' && (
                 <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700">
                       <h3 className="font-bold mb-3 dark:text-white text-sm uppercase">{t('addNewLesson')}</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <input placeholder={t('lessonTitlePlaceholder')} className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} />
                          <select className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newLesson.type} onChange={e => setNewLesson({...newLesson, type: e.target.value as any})}><option value="video">{t('video')}</option><option value="reading">{t('reading')}</option><option value="coding">{t('coding')}</option><option value="project">{t('project')}</option></select>
                       </div>
                       <textarea placeholder={t('contentPlaceholder')} className="w-full p-2 border rounded mb-3 dark:bg-gray-700 dark:text-white h-20" value={newLesson.content} onChange={e => setNewLesson({...newLesson, content: e.target.value})} />
                       <div className="flex justify-between items-center">
                          <input type="number" placeholder={t('durationMin')} className="p-2 border rounded w-32 dark:bg-gray-700 dark:text-white" value={newLesson.durationMinutes} onChange={e => setNewLesson({...newLesson, durationMinutes: parseInt(e.target.value)})} />
                          <button onClick={() => { 
                             if(!newLesson.title) return; 
                             addLessonToCourse(selectedCourse.id, { ...newLesson, id: `l${Date.now()}`, completed: false } as Lesson); 
                             setNewLesson({ title: '', type: 'video', content: '', durationMinutes: 10 }); 
                          }} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4"/> {t('addLessonBtn')}</button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       {selectedCourse.lessons.map((l, i) => (
                          <div key={l.id} className="p-3 border rounded-lg flex justify-between items-center bg-white dark:bg-gray-800 dark:border-gray-700">
                             <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-500">{i+1}</span>
                                <div><p className="font-medium text-sm dark:text-white">{l.title}</p><p className="text-xs text-gray-500 capitalize">{l.type} • {l.durationMinutes} min</p></div>
                             </div>
                             <button className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4"/></button>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {manageTab === 'live' && (
                 <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700">
                       <h3 className="font-bold mb-3 dark:text-white text-sm uppercase">{t('scheduleSessionHeader')}</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <input placeholder={t('sessionTitlePlaceholder')} className="p-2 border rounded dark:bg-gray-700 dark:text-white" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} />
                          <input type="datetime-local" className="p-2 border rounded dark:bg-gray-700 dark:text-white" onChange={e => setNewSession({...newSession, startTime: new Date(e.target.value).toISOString()})} />
                       </div>
                       <div className="flex gap-3 mb-3">
                          <input placeholder={t('meetLinkPlaceholder')} className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white" value={newSession.meetLink} onChange={e => setNewSession({...newSession, meetLink: e.target.value})} />
                          <input type="number" placeholder={t('durationMin')} className="w-24 p-2 border rounded dark:bg-gray-700 dark:text-white" value={newSession.durationMinutes} onChange={e => setNewSession({...newSession, durationMinutes: parseInt(e.target.value)})} />
                       </div>
                       <div className="flex justify-end">
                          <button onClick={() => {
                             if(!newSession.title) return;
                             addLiveSessionToCourse(selectedCourse.id, { ...newSession, id: `ls${Date.now()}`, courseId: selectedCourse.id, instructorName: currentUser?.name || 'Teacher' } as LiveSession);
                             setNewSession({ title: '', startTime: '', durationMinutes: 60, meetLink: '' });
                          }} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"><Video className="w-4 h-4"/> {t('scheduleBtn')}</button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       {(selectedCourse.liveSessions || []).map(s => (
                          <div key={s.id} className="p-3 border rounded-lg flex justify-between items-center bg-white dark:bg-gray-800 dark:border-gray-700">
                             <div><p className="font-medium text-sm dark:text-white">{s.title}</p><p className="text-xs text-gray-500">{new Date(s.startTime).toLocaleString()} • {s.durationMinutes} min</p></div>
                             <a href={s.meetLink} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1"><Link className="w-3 h-3"/> Link</a>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
           </div>
        </div>
      ) : (
        <>
          {activeTab === 'courses' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold dark:text-white">{t('managedCourses')}</h2>
                  <button onClick={() => setShowCreate(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition"><Plus className="w-4 h-4"/> {t('createCourseBtn')}</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.map(c => (
                     <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition">
                        <img src={c.thumbnail} className="h-32 w-full object-cover" alt=""/>
                        <div className="p-4">
                           <h3 className="font-bold dark:text-white truncate mb-1">{c.title}</h3>
                           <p className="text-xs text-gray-500 mb-4">{c.studentsCount} Students • {c.lessons.length} Lessons</p>
                           <button onClick={() => setSelectedCourseId(c.id)} className="w-full py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300">{t('manageContent')}</button>
                        </div>
                     </div>
                  ))}
                  {myCourses.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed dark:border-gray-700 text-gray-400">
                       <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                       <p>{t('noCreatedCourses')}</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'grading' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-1 space-y-3 h-[600px] overflow-y-auto pr-2">
                  {pendingSubmissions.map(s => (
                    <div key={s.id} onClick={() => { setGradingId(s.id); setScore(0); setFeedback(''); }} className={`p-4 rounded-xl border cursor-pointer transition ${gradingId === s.id ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <div className="flex justify-between mb-1"><h3 className="font-bold text-sm dark:text-white">{s.studentName}</h3><span className="text-xs text-gray-400">{new Date(s.submittedAt).toLocaleDateString()}</span></div>
                      <p className="text-xs text-gray-500 truncate">{s.courseTitle}</p>
                      <p className="text-xs text-primary mt-1">{s.lessonTitle}</p>
                    </div>
                  ))}
                  {pendingSubmissions.length === 0 && <div className="text-center text-gray-400 py-10">{t('allCaughtUp')}</div>}
               </div>
               <div className="lg:col-span-2">
                  {gradingId ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white">{t('studentSubmission')}</h3><span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{t('pendingReview')}</span></div>
                      <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-auto mb-4 relative group">
                        <pre className="text-gray-300 font-mono text-sm">{submissions.find(s => s.id === gradingId)?.code || "No code submitted (File Upload)"}</pre>
                        <button onClick={() => handleAutoGrade(submissions.find(s => s.id === gradingId)?.code || '', "Grade this code based on standard practices.")} className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition flex items-center gap-1 shadow-lg"><Sparkles className="w-3 h-3"/> {t('aiAutoGrade')}</button>
                      </div>
                      <div className="space-y-4 border-t dark:border-gray-700 pt-4">
                         <div className="flex gap-4">
                            <div className="w-24">
                               <label className="block text-xs font-medium text-gray-500 mb-1">{t('scoreLabel')}</label>
                               <input type="number" value={score} onChange={e => setScore(Number(e.target.value))} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div className="flex-1">
                               <label className="block text-xs font-medium text-gray-500 mb-1">{t('feedbackLabel')}</label>
                               <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full p-2 border rounded h-20 dark:bg-gray-700 dark:text-white" placeholder="Write constructive feedback..." />
                            </div>
                         </div>
                         <div className="flex justify-end gap-2">
                            <button onClick={() => setGradingId(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">{t('skipBtn')}</button>
                            <button onClick={() => { gradeAssignment(gradingId, score, feedback); setGradingId(null); }} className="bg-primary text-white px-6 py-2 rounded hover:bg-indigo-700">{t('submitGradeBtn')}</button>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                       <CheckCircle2 className="w-16 h-16 mb-4 opacity-20"/>
                       <p>{t('selectSubmissionPrompt')}</p>
                    </div>
                  )}
               </div>
             </div>
          )}
        </>
      )}

      {/* Create Course Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
             <h3 className="font-bold mb-4 dark:text-white text-xl">{t('createCourseBtn')}</h3>
             <div className="space-y-3">
                <div><label className="text-xs font-bold text-gray-500 uppercase">{t('courseTitle')}</label><input className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. Advanced Python" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">{t('description')}</label><textarea className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none h-20" placeholder="Course summary..." value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                   <div><label className="text-xs font-bold text-gray-500 uppercase">{t('price')}</label><input type="number" className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white" value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: parseFloat(e.target.value)})} /></div>
                   <div><label className="text-xs font-bold text-gray-500 uppercase">{t('role')}</label><select className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white" value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value as any})}>{Object.values(CourseLevel).map(l => <option key={l} value={l}>{t(l)}</option>)}</select></div>
                </div>
             </div>
             <div className="flex justify-end gap-3 mt-6">
               <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">{t('cancel')}</button>
               <button onClick={() => { 
                  addCourse({...newCourse, id: `c${Date.now()}`, instructorId: currentUser!.id, status: 'draft', studentsCount: 0, lessons: [], thumbnail: 'https://picsum.photos/200', rating: 0 } as Course); 
                  setShowCreate(false); 
                  setNewCourse({ title: '', description: '', price: 0, level: CourseLevel.BEGINNER }); 
               }} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700">{t('createCourseBtn')}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AssignmentsView = () => {
  const { courses, currentUser, submitAssignment, submissions, t } = useAppContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submissionType, setSubmissionType] = useState<'file' | 'code'>('file');
  const [codeContent, setCodeContent] = useState('');
  const [fileName, setFileName] = useState('');
  
  // Custom Submission State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCourseId, setCustomCourseId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customFileName, setCustomFileName] = useState('');

  // Logic: Filter assignments from ENROLLED courses where lesson type is project or coding
  const myAssignments: { lesson: Lesson, course: Course }[] = [];
  const enrolledCoursesList: Course[] = [];
  
  if (currentUser && currentUser.coursesEnrolled) {
    currentUser.coursesEnrolled.forEach(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        enrolledCoursesList.push(course);
        course.lessons.forEach(lesson => {
          if (lesson.type === 'project' || lesson.type === 'coding') {
            myAssignments.push({ lesson, course });
          }
        });
      }
    });
  }

  const getSubmissionStatus = (lessonId: string) => {
    const sub = submissions.find(s => s.lessonId === lessonId && s.studentId === currentUser?.id);
    if (!sub) return 'open';
    return sub.status;
  };

  const handleSubmit = (lesson: Lesson, course: Course) => {
    const submission: CodeSubmission = {
      id: `sub_${Date.now()}`,
      studentId: currentUser!.id,
      studentName: currentUser!.name,
      courseId: course.id,
      courseTitle: course.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      type: lesson.type as 'coding' | 'project',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      score: null,
      feedback: null,
      code: submissionType === 'code' ? codeContent : undefined,
      fileUrl: submissionType === 'file' ? fileName : undefined // Simulation
    };
    submitAssignment(submission);
    setExpandedId(null);
    setCodeContent('');
    setFileName('');
  };
  
  const handleCustomSubmit = () => {
     if (!customCourseId || !customTitle || !customFileName) return;
     const course = courses.find(c => c.id === customCourseId);
     if (!course) return;

     const submission: CodeSubmission = {
      id: `sub_custom_${Date.now()}`,
      studentId: currentUser!.id,
      studentName: currentUser!.name,
      courseId: course.id,
      courseTitle: course.title,
      lessonId: `custom_${Date.now()}`,
      lessonTitle: customTitle,
      type: 'project',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      score: null,
      feedback: null,
      fileUrl: customFileName
    };
    submitAssignment(submission);
    setShowCustomModal(false);
    setCustomTitle('');
    setCustomFileName('');
    setCustomCourseId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold dark:text-white">{t('assignments')}</h1>
         <button 
           onClick={() => setShowCustomModal(true)}
           className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm"
         >
            <Plus className="w-4 h-4"/> {t('addCustomSubmission')}
         </button>
      </div>
      
      <div className="grid gap-4">
        {myAssignments.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p>{t('noAssignments')}</p>
          </div>
        )}
        {myAssignments.map(({ lesson, course }) => {
           const status = getSubmissionStatus(lesson.id);
           const isSubmitted = status !== 'open';
           
           return (
            <div 
              key={lesson.id} 
              className={`bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 transition-all ${expandedId === lesson.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            >
              <div 
                className="p-6 flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${isSubmitted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {lesson.type === 'coding' ? <Code className="w-5 h-5"/> : <FolderOpen className="w-5 h-5"/>}
                  </div>
                  <div>
                    <h3 className="font-bold dark:text-white text-lg">{lesson.title}</h3>
                    <p className="text-sm text-gray-500">{course.title} • {lesson.durationMinutes} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${!isSubmitted ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {isSubmitted ? t('submitted') : t('pending')}
                  </span>
                  {expandedId === lesson.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>
              
              {expandedId === lesson.id && (
                <div className="px-6 pb-6 pt-0 border-t dark:border-gray-700 animate-fadeIn">
                  <div className="mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-2">{t('instructions')}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{lesson.content}</p>
                    
                    {!isSubmitted && (
                      <div className="mt-4 border-t dark:border-gray-700 pt-4">
                         <div className="flex gap-4 mb-4">
                            <button 
                              onClick={() => setSubmissionType('file')}
                              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${submissionType === 'file' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                               <Upload className="w-4 h-4"/> {t('uploadFile')}
                            </button>
                            <button 
                              onClick={() => setSubmissionType('code')}
                              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${submissionType === 'code' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                               <Code className="w-4 h-4"/> {t('writeCode')}
                            </button>
                         </div>

                         {submissionType === 'file' ? (
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition relative">
                               <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                               />
                               {fileName ? (
                                 <div className="text-green-600 flex flex-col items-center">
                                    <FileText className="w-8 h-8 mb-2"/>
                                    <p className="font-medium">{fileName}</p>
                                 </div>
                               ) : (
                                 <div className="text-gray-400 flex flex-col items-center">
                                    <UploadCloud className="w-8 h-8 mb-2"/>
                                    <p>{t('dragDropFile')}</p>
                                 </div>
                               )}
                            </div>
                         ) : (
                            <div className="h-64">
                               <CodeEditor initialCode="# Write your solution here..." language="python" onChange={setCodeContent} />
                            </div>
                         )}

                         <div className="mt-4 flex justify-end">
                            <button 
                              onClick={() => handleSubmit(lesson, course)}
                              disabled={submissionType === 'file' && !fileName}
                              className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                               {t('submitWork')}
                            </button>
                         </div>
                      </div>
                    )}
                    {isSubmitted && (
                       <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-green-600"/>
                          <div>
                             <p className="font-bold text-green-800 dark:text-green-400">{t('submissionSuccess')}</p>
                             <p className="text-xs text-green-600 dark:text-green-500">Your teacher will grade this soon.</p>
                          </div>
                       </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Custom Submission Modal */}
      {showCustomModal && (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold dark:text-white">{t('addCustomSubmission')}</h3>
                  <button onClick={() => setShowCustomModal(false)}><X className="w-5 h-5 text-gray-500 dark:text-gray-400"/></button>
               </div>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('selectEnrolledCourse')}</label>
                     <select 
                       className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                       value={customCourseId}
                       onChange={(e) => setCustomCourseId(e.target.value)}
                     >
                        <option value="">-- {t('selectCourseDefault')} --</option>
                        {enrolledCoursesList.map(c => (
                           <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                     </select>
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('submissionTitle')}</label>
                     <input 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        placeholder="e.g. Extra Credit Assignment"
                        value={customTitle}
                        onChange={e => setCustomTitle(e.target.value)}
                     />
                  </div>
                  
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('uploadFile')}</label>
                     <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center relative hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        <input 
                           type="file" 
                           className="absolute inset-0 opacity-0 cursor-pointer"
                           onChange={(e) => setCustomFileName(e.target.files?.[0]?.name || '')}
                        />
                        {customFileName ? (
                           <div className="text-green-600 flex flex-col items-center">
                              <FileText className="w-6 h-6 mb-1"/>
                              <span className="text-sm font-medium">{customFileName}</span>
                           </div>
                        ) : (
                           <div className="text-gray-400 flex flex-col items-center">
                              <UploadCloud className="w-6 h-6 mb-1"/>
                              <span className="text-xs">{t('dragDropFile')}</span>
                           </div>
                        )}
                     </div>
                  </div>
                  
                  <button 
                     onClick={handleCustomSubmit}
                     disabled={!customCourseId || !customTitle || !customFileName}
                     className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition mt-2"
                  >
                     {t('uploadAndSubmit') || t('submit')}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const PortfolioView = () => {
  const { projects, addProject, currentUser, t } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [newProj, setNewProj] = useState({ title: '', description: '', tags: '' });
  const myProjects = projects.filter(p => p.studentId === currentUser?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h1 className="text-2xl font-bold dark:text-white">{t('portfolio')}</h1><button onClick={() => setShowAdd(true)} className="bg-primary text-white px-4 py-2 rounded-lg">{t('addProject')}</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {myProjects.map(p => (
          <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border dark:border-gray-700 shadow-sm">
            <img src={p.imageUrl} className="h-40 w-full object-cover" alt=""/>
            <div className="p-4">
              <h3 className="font-bold dark:text-white">{p.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{p.description}</p>
              <div className="flex flex-wrap gap-1">{p.tags.map(tag => <span key={tag} className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs text-gray-600 dark:text-gray-300">{tag}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <h3 className="font-bold mb-4 dark:text-white">{t('addProject')}</h3>
            <input className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder={t('projectTitle')} value={newProj.title} onChange={e => setNewProj({...newProj, title: e.target.value})} />
            <textarea className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder={t('description')} value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} />
            <input className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder={t('tags')} value={newProj.tags} onChange={e => setNewProj({...newProj, tags: e.target.value})} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)}>{t('cancel')}</button>
              <button onClick={() => { addProject({ id: `p${Date.now()}`, studentId: currentUser!.id, title: newProj.title, description: newProj.description, imageUrl: 'https://picsum.photos/400/300', tags: newProj.tags.split(','), createdAt: Date.now() }); setShowAdd(false); }} className="bg-primary text-white px-4 py-2 rounded">{t('create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StudyGroupsView = () => {
  const { studyGroups, joinGroup, currentUser, t, addForumPost } = useAppContext();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeGroup = studyGroups.find(g => g.id === activeGroupId);
  
  // FIX: Use ONLY activeGroup.posts to prevent duplication. Do NOT merge with global forumPosts.
  const currentGroupPosts = activeGroup 
    ? (activeGroup.posts || []).sort((a, b) => a.createdAt - b.createdAt)
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeGroupId) {
      scrollToBottom();
    }
  }, [currentGroupPosts, activeGroupId]);

  const handleSend = () => {
    if (!newMessage.trim() || !currentUser || !activeGroupId) return;
    addForumPost({
      id: `gp_${Date.now()}`,
      groupId: activeGroupId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl || '',
      content: newMessage,
      createdAt: Date.now(),
      replies: []
    });
    setNewMessage('');
  };

  if (activeGroupId && activeGroup) {
    return (
       <div className="h-[calc(100vh-100px)] flex flex-col bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3 bg-gray-50 dark:bg-gray-900">
             <button onClick={() => setActiveGroupId(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><ArrowLeft className="w-5 h-5 dark:text-white"/></button>
             <div>
                <h2 className="font-bold text-lg dark:text-white">{activeGroup.name}</h2>
                <p className="text-xs text-gray-500">{activeGroup.memberCount} {t('members')}</p>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
             {currentGroupPosts.length === 0 ? (
               <div className="text-center text-gray-400 mt-10">{t('noMessagesYet')}</div>
             ) : (
               currentGroupPosts.map(post => (
                 <div key={post.id} className={`flex gap-4 ${post.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                    <img src={post.userAvatar} className="w-10 h-10 rounded-full border dark:border-gray-600" alt=""/>
                    <div className={`max-w-[70%] ${post.userId === currentUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{post.userName}</span>
                          <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                       <div className={`p-3 rounded-xl text-sm shadow-sm ${
                         post.userId === currentUser?.id 
                           ? 'bg-primary text-white rounded-tr-none' 
                           : 'bg-white dark:bg-gray-700 dark:text-gray-200 border dark:border-gray-600 rounded-tl-none'
                       }`}>
                          {post.content}
                       </div>
                    </div>
                 </div>
               ))
             )}
             <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
             <div className="flex gap-2">
                <input 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  // FIX: Prevent double submission with IME (e.g. Vietnamese input)
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t('typeGroupMessage')}
                  className="flex-1 border dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                />
                <button 
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="bg-primary text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Send className="w-5 h-5"/>
                </button>
             </div>
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">{t('studyGroups')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studyGroups.map(g => {
          const isMember = g.members.includes(currentUser?.id || '');
          return (
            <div key={g.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-lg dark:text-white mb-1">{g.name}</h3>
                   <p className="text-sm text-gray-500">{g.memberCount} {t('members')}</p>
                 </div>
                 <Users className="w-10 h-10 text-indigo-100 dark:text-indigo-900/50 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"/>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm line-clamp-2">{g.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                   {[...Array(Math.min(3, g.memberCount))].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-500">
                         <UserIcon className="w-4 h-4"/>
                      </div>
                   ))}
                   {g.memberCount > 3 && <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-500">+{g.memberCount-3}</div>}
                </div>
                {isMember ? (
                   <button onClick={() => setActiveGroupId(g.id)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                      {t('enterGroup')}
                   </button>
                ) : (
                   <button onClick={() => joinGroup(g.id)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      {t('joinGroup')}
                   </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CoursePlayerView = ({ courseId, onReportLesson, onNavigate }: { courseId: string, onReportLesson: (t: string) => void, onNavigate: (v: string) => void }) => {
  const { courses, submitAssignment, t, currentUser, enrollCourse } = useAppContext();
  const course = courses.find(c => c.id === courseId);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'lessons' | 'live'>('lessons');
  const [showPay, setShowPay] = useState(false);

  useEffect(() => {
     if (course && course.price > 0 && !currentUser?.coursesEnrolled?.includes(courseId)) {
        setShowPay(true);
     }
  }, [courseId, currentUser, course]);
  
  if (!course) return <div>{t('courseNotFound')}</div>;

  // Strict Gatekeeping: If not logged in, do not render course content at all to prevent null ref errors
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-4 text-center">
         <Lock className="w-16 h-16 text-gray-300 mb-4"/>
         <h2 className="text-2xl font-bold dark:text-white mb-2">{t('accessRestricted')}</h2>
         <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{t('pleaseLogin')}</p>
         <button 
           onClick={() => onNavigate('auth')} 
           className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
         >
           {t('login')}
         </button>
      </div>
    );
  }

  // Strict Gatekeeping: Payment
  const isEnrolled = currentUser.coursesEnrolled?.includes(course.id);
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isInstructor = currentUser.id === course.instructorId;

  // Allow Admins and the Instructor to bypass payment
  if (course.price > 0 && !isEnrolled && !isAdmin && !isInstructor) {
     return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900 p-4">
           <Lock className="w-16 h-16 text-gray-400 mb-4" />
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('courseLocked')}</h2>
           <p className="text-gray-600 dark:text-gray-300 mb-6">{t('mustEnroll')}</p>
           <button 
             onClick={() => setShowPay(true)} 
             className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
           >
             {t('payNow')} (${course.price})
           </button>
           {showPay && (
             <PaymentModal 
                course={course} 
                onClose={() => setShowPay(false)} // Changed from true to false to allow closing
                onConfirm={(gw) => { 
                   enrollCourse(course.id, { 
                      id: `tx_${Date.now()}`, 
                      userId: currentUser.id, 
                      courseId: course.id, 
                      courseTitle: course.title, 
                      amount: course.price, 
                      date: new Date().toISOString(), 
                      gateway: gw, 
                      status: 'success' 
                   }); 
                   setShowPay(false); 
                }} 
             />
           )}
        </div>
     );
  }

  const lesson = course.lessons[currentLessonIdx];
  if (!lesson) return <div>{t('lessonNotFound')}</div>;

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
           <h2 className="font-bold dark:text-white flex items-center gap-2">
             {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-500"/>}
             {lesson.type === 'coding' && <Code className="w-4 h-4 text-green-500"/>}
             {lesson.type === 'reading' && <BookOpen className="w-4 h-4 text-orange-500"/>}
             {lesson.title}
           </h2>
           <button onClick={() => onReportLesson(lesson.title)} className="text-gray-400 hover:text-amber-500 transition"><Flag className="w-4 h-4"/></button>
        </div>
        <div className="flex-1 bg-black relative overflow-hidden">
          {lesson.type === 'video' && <iframe src={lesson.content} className="w-full h-full border-0" allowFullScreen />}
          {lesson.type === 'coding' && <CodeEditor initialCode={lesson.content} language="python" onSubmit={(code) => submitAssignment({ id: `s${Date.now()}`, studentId: currentUser.id, studentName: currentUser.name, courseId: course.id, courseTitle: course.title, lessonId: lesson.id, lessonTitle: lesson.title, type: 'coding', code, score: null, feedback: null, submittedAt: new Date().toLocaleString(), status: 'pending' })} />}
          {lesson.type === 'reading' && <div className="p-8 text-white prose dark:prose-invert max-w-none h-full overflow-y-auto">{lesson.content}</div>}
          {lesson.type === 'project' && (
             <div className="p-8 text-white h-full flex flex-col items-center justify-center">
                <Briefcase className="w-16 h-16 mb-4 text-indigo-400"/>
                <h3 className="text-2xl font-bold mb-2">{lesson.title}</h3>
                <p className="text-gray-300 text-center max-w-lg mb-6">{lesson.content}</p>
                <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700">
                   <label className="block text-sm text-gray-400 mb-2">{t('submissionUrl')}</label>
                   <div className="flex gap-2">
                     <input type="text" className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm" placeholder="https://..." />
                     <button className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-600 transition">{t('submitBtn')}</button>
                   </div>
                </div>
             </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-between border-t dark:border-gray-700">
          <button disabled={currentLessonIdx === 0} onClick={() => setCurrentLessonIdx(i => i - 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-sm disabled:opacity-50 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition">{t('previousLesson')}</button>
          <button disabled={currentLessonIdx === course.lessons.length - 1} onClick={() => setCurrentLessonIdx(i => i + 1)} className="px-4 py-2 bg-primary text-white rounded-lg shadow-sm disabled:opacity-50 text-sm font-medium hover:bg-indigo-700 transition">{t('nextStep')}</button>
        </div>
      </div>
      
      {/* Course Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 flex flex-col overflow-hidden">
         <div className="flex border-b dark:border-gray-700">
            <button 
              onClick={() => setViewMode('lessons')} 
              className={`flex-1 py-3 text-sm font-medium ${viewMode === 'lessons' ? 'text-primary border-b-2 border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
               {t('lessons')}
            </button>
            <button 
              onClick={() => setViewMode('live')} 
              className={`flex-1 py-3 text-sm font-medium ${viewMode === 'live' ? 'text-primary border-b-2 border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
               {t('liveClass')}
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto">
           {viewMode === 'lessons' ? (
             <div className="py-2">
               {course.lessons.map((l, i) => (
                 <button key={l.id} onClick={() => setCurrentLessonIdx(i)} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-l-4 ${i === currentLessonIdx ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20 text-primary' : 'border-transparent dark:text-gray-300'}`}>
                   {l.type === 'video' ? <PlayCircle className="w-4 h-4 shrink-0"/> : l.type === 'coding' ? <Code className="w-4 h-4 shrink-0"/> : <Book className="w-4 h-4 shrink-0"/>}
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{l.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{l.durationMinutes} min</p>
                   </div>
                   {l.completed && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/>}
                 </button>
               ))}
             </div>
           ) : (
             <div className="p-4 space-y-4">
                {course.liveSessions && course.liveSessions.length > 0 ? (
                   course.liveSessions.map(session => (
                      <div key={session.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700">
                         <div className="flex items-start justify-between mb-2">
                            <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded uppercase">{t('liveTag')}</div>
                            <span className="text-xs text-gray-500">{new Date(session.startTime).toLocaleDateString()}</span>
                         </div>
                         <h4 className="font-bold text-sm dark:text-white mb-1">{session.title}</h4>
                         <p className="text-xs text-gray-500 mb-3">{new Date(session.startTime).toLocaleTimeString()} • {session.durationMinutes} min</p>
                         <div className="flex items-center gap-2 mb-4">
                            <img src={`https://ui-avatars.com/api/?name=${session.instructorName}&background=random`} className="w-6 h-6 rounded-full" alt=""/>
                            <span className="text-xs dark:text-gray-300">{session.instructorName}</span>
                         </div>
                         <a 
                           href={session.meetLink} 
                           target="_blank" 
                           rel="noreferrer"
                           className="block w-full bg-primary text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                         >
                            <Video className="w-4 h-4"/> {t('joinMeet')}
                         </a>
                      </div>
                   ))
                ) : (
                   <div className="text-center py-10 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                      <p className="text-sm">{t('noLiveSessions')}</p>
                   </div>
                )}
             </div>
           )}
         </div>
         <div className="p-4 border-t dark:border-gray-700"><CourseLeaderboard courseId={courseId} /></div>
      </div>
    </div>
  );
};

const ProfileView = () => {
  const { currentUser, updateUserProfile, changeOwnPassword, t } = useAppContext();
  const [formData, setFormData] = useState(currentUser || {} as User);
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const imageUrl = URL.createObjectURL(file);
        setFormData({...formData, avatarUrl: imageUrl});
        // Auto save avatar update immediately
        updateUserProfile({...formData, avatarUrl: imageUrl});
     }
  };

  const handlePasswordChange = () => {
    if (passData.new !== passData.confirm) {
      alert("Passwords do not match");
      return;
    }
    const res = changeOwnPassword(passData.current, passData.new);
    if (res.success) {
      setPassData({ current: '', new: '', confirm: '' });
      alert("Password changed successfully");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">{t('profile')}</h1>
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img 
                src={formData.avatarUrl || "https://via.placeholder.com/150"} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 group-hover:opacity-80 transition"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30 rounded-full">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
          </div>
          <p className="text-sm text-primary mt-2 cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
              {t('changeAvatar')}
          </p>
        </div>

        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('fullName')}</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('email')}</label><input value={formData.email} disabled className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-gray-400" /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">{t('bio')}</label><textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" /></div>
          <button onClick={() => updateUserProfile(formData)} className="bg-primary text-white px-6 py-2 rounded-lg">{t('saveChanges')}</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2"><Key className="w-5 h-5"/> Security</h2>
        <div className="space-y-4">
           <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Current Password</label><input type="password" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" /></div>
           <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">New Password</label><input type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" /></div>
           <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Confirm New Password</label><input type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" /></div>
           <button onClick={handlePasswordChange} className="bg-gray-800 dark:bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-500">Change Password</button>
        </div>
      </div>
    </div>
  );
};

const InboxView = () => {
   const { privateMessages, currentUser, courses, users, sendPrivateMessage, t } = useAppContext();
   const [activeConversation, setActiveConversation] = useState<string | null>(null);
   const [newMessage, setNewMessage] = useState('');
   
   if (!currentUser) return null;

   const conversations = new Map<string, any>();

   privateMessages.forEach(msg => {
      // Allow Guest messages (c_support context)
      if (msg.courseId === 'c_support') {
         if (currentUser.role === UserRole.ADMIN) {
           // The Guest ID is in the senderId (if they sent it) or receiverId (if we replied)
           const guestId = msg.senderId.startsWith('guest_') ? msg.senderId : msg.receiverId;
           const key = `support-${guestId}`;
           const existing = conversations.get(key);
           if (!existing || msg.timestamp > existing.timestamp) {
              conversations.set(key, { 
                 id: key, 
                 courseId: 'c_support', 
                 courseName: t('supportInquiries'), 
                 studentId: guestId, // CRITICAL: This needs to be the guest ID for the reply logic
                 studentName: t('guestUser'), 
                 teacherId: currentUser.id, 
                 lastMessage: msg.content, 
                 timestamp: msg.timestamp,
                 isGuest: true
              });
           }
         }
         return; 
      }

      if (!msg.courseId) return;
      const course = courses.find(c => c.id === msg.courseId);
      if (!course) return;
      let studentId = '';
      if (users.find(u => u.id === msg.receiverId)?.role === UserRole.STUDENT) studentId = msg.receiverId;
      if (users.find(u => u.id === msg.senderId)?.role === UserRole.STUDENT) studentId = msg.senderId;
      if (!studentId) return;
      const key = `${course.id}-${studentId}`;
      
      let isVisible = false;
      if (currentUser.role === UserRole.ADMIN) isVisible = true;
      if (currentUser.role === UserRole.TEACHER && course.instructorId === currentUser.id) isVisible = true;
      if (currentUser.role === UserRole.STUDENT && studentId === currentUser.id) isVisible = true;

      if (isVisible) {
         const existing = conversations.get(key);
         if (!existing || msg.timestamp > existing.timestamp) {
            const student = users.find(u => u.id === studentId);
            conversations.set(key, { id: key, courseId: course.id, courseName: course.title, studentId, studentName: student?.name || 'Student', teacherId: course.instructorId, lastMessage: msg.content, timestamp: msg.timestamp });
         }
      }
   });
   const sortedConversations = Array.from(conversations.values()).sort((a, b) => b.timestamp - a.timestamp);
   const activeMsgs = activeConversation ? privateMessages.filter(m => {
      if (activeConversation.startsWith('support-')) {
         const guestId = activeConversation.split('-')[1];
         return m.courseId === 'c_support' && (m.senderId === guestId || m.receiverId === guestId);
      }
      if (!m.courseId) return false;
      const [cId, sId] = activeConversation.split('-');
      return m.courseId === cId && (m.senderId === sId || m.receiverId === sId);
   }).sort((a, b) => a.timestamp - b.timestamp) : [];

   const handleSendMessage = () => {
      if (!newMessage.trim() || !activeConversation) return;
      
      if (activeConversation.startsWith('support-')) {
         const guestId = activeConversation.split('-')[1];
         sendPrivateMessage({ id: `msg_${Date.now()}`, senderId: currentUser.id, receiverId: guestId, courseId: 'c_support', content: newMessage, timestamp: Date.now(), read: false });
      } else {
         const [cId, sId] = activeConversation.split('-');
         const conversation = conversations.get(activeConversation);
         let receiverId = conversation.teacherId;
         if (currentUser.role === UserRole.TEACHER || currentUser.role === UserRole.ADMIN) receiverId = conversation.studentId;
         sendPrivateMessage({ id: `msg_${Date.now()}`, senderId: currentUser.id, receiverId, courseId: cId, content: newMessage, timestamp: Date.now(), read: false });
      }
      setNewMessage('');
   };

   return (
      <div className="h-[calc(100vh-100px)] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden flex">
         <div className="w-1/3 border-r dark:border-gray-700 flex flex-col">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700"><h2 className="font-bold dark:text-white">{t('inbox')}</h2></div>
            <div className="flex-1 overflow-y-auto">{sortedConversations.map(c => (
               <button key={c.id} onClick={() => setActiveConversation(c.id)} className={`w-full text-left p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${activeConversation === c.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                  <div className="font-bold dark:text-white">{c.courseName}</div><div className="text-xs text-primary">{c.studentName}</div><div className="text-sm text-gray-500 truncate">{c.lastMessage}</div>
               </button>
            ))}</div>
         </div>
         <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            {activeConversation ? (
               <>
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {activeMsgs.map(m => (
                     <div key={m.id} className={`flex ${m.senderId===currentUser.id?'justify-end':'justify-start'}`}>
                       <div className={`max-w-[70%] p-3 rounded-2xl ${m.senderId===currentUser.id?'bg-primary text-white':'bg-white dark:bg-gray-700 dark:text-white border'}`}>{m.content}</div>
                     </div>
                   ))}
                 </div>
                 <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
                   <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSendMessage()} className="flex-1 border rounded-lg px-4 py-2 dark:bg-gray-700 dark:text-white" placeholder={t('typeMessage')}/>
                   <button onClick={handleSendMessage} className="bg-primary text-white p-2 rounded-lg"><Send className="w-5 h-5"/></button>
                 </div>
               </>
            ) : <div className="flex-1 flex items-center justify-center text-gray-400">{t('startConversation')}</div>}
         </div>
      </div>
   );
};

const AdminPortalView = () => {
  const { users, courses, transactions, backups, reports, systemConfig, t, updateUserStatus, adminCreateUser, currentUser, updateCourseStatus, updateCourseLevel, createBackup, restoreBackup, updateSystemConfig, updateReportStatus, replyToReport, updateCourse } = useAppContext();
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'finance' | 'system' | 'backup' | 'support'>('users');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', role: UserRole.TEACHER });
  const [replyModal, setReplyModal] = useState<string | null>(null);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all'); const [searchUser, setSearchUser] = useState('');
  const SUPER_ADMIN_EMAIL = 'hoangnguyennn2206@gmail.com';

  const filteredUsers = users.filter(u => (userRoleFilter === 'all' || u.role === userRoleFilter) && (u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase())));

  return (
     <div className="space-y-6 h-full">
        <div className="flex justify-between items-center"><h1 className="text-2xl font-bold dark:text-white">{t('adminConsole')}</h1></div>
        <div className="flex flex-col md:flex-row gap-6 h-full">
           <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm space-y-1">
              {[
                {id:'users',l:t('userManagement'),i:Users}, {id:'courses',l:t('courseManagement'),i:BookOpen}, {id:'finance',l:t('transactionManagement'),i:DollarSign},
                {id:'system',l:t('systemSettings'),i:Settings}, {id:'backup',l:t('backupRestore'),i:Database}, {id:'support',l:t('reports'),i:HelpCircle}
              ].map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-3 w-full text-left text-sm font-medium rounded-lg ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><tab.i className="w-4 h-4" /> {tab.l}</button>
              ))}
           </div>
           <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 overflow-y-auto min-h-[600px]">
              {activeTab === 'users' && (
                 <div className="space-y-6">
                    <div className="flex justify-between"><div className="flex gap-2"><input placeholder={t('searchUsers')} value={searchUser} onChange={e => setSearchUser(e.target.value)} className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"/><select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"><option value="all">{t('allRoles')}</option><option value={UserRole.STUDENT}>Student</option><option value={UserRole.TEACHER}>Teacher</option></select></div><button onClick={() => setShowCreateUserModal(true)} className="bg-primary text-white px-4 py-2 rounded flex gap-2 items-center"><UserPlus className="w-4 h-4"/> {t('createUser')}</button></div>
                    <table className="w-full text-sm text-left"><thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300"><tr><th className="p-3">{t('fullName')}</th><th className="p-3">{t('role')}</th><th className="p-3">{t('status')}</th><th className="p-3">{t('actions')}</th></tr></thead><tbody>{filteredUsers.map(u => (
                       <tr key={u.id} className="border-b dark:border-gray-700"><td className="p-3 flex items-center gap-2"><img src={u.avatarUrl} className="w-8 h-8 rounded-full" alt=""/><div className="dark:text-white">{u.name}<div className="text-xs text-gray-500">{u.email}</div></div></td>
                       <td className="p-3 dark:text-gray-300">{u.role}</td><td className="p-3"><span className={`px-2 py-1 rounded text-xs ${u.status==='active'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{u.status}</span></td>
                       <td className="p-3 flex gap-2">
                          <button onClick={() => updateUserStatus(u.id, u.status==='active'?'locked':'active')} className="text-red-600 text-xs hover:underline">{u.status==='active'?t('lockAccount'):t('unlockAccount')}</button>
                       </td></tr>
                    ))}</tbody></table>
                 </div>
              )}
              {activeTab === 'courses' && (
                 <div className="space-y-6">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                        <tr>
                          <th className="p-3">{t('courseTitle')}</th>
                          <th className="p-3">{t('price')} ($)</th>
                          <th className="p-3">{t('status')}</th>
                          <th className="p-3">{t('learningPaths')}</th>
                          <th className="p-3">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map(c => (
                           <tr key={c.id} className="border-b dark:border-gray-700">
                              <td className="p-3 dark:text-white">{c.title}</td>
                              <td className="p-3">
                                <input 
                                  type="number" 
                                  min="0"
                                  step="0.01"
                                  className="w-20 p-1 border rounded text-xs dark:bg-gray-700 dark:text-white"
                                  value={c.price}
                                  onChange={(e) => updateCourse(c.id, { price: parseFloat(e.target.value) || 0 })}
                                />
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs ${c.status==='published'?'bg-green-100 text-green-800':'bg-gray-200'}`}>{c.status}</span>
                              </td>
                              <td className="p-3">
                                <select value={c.level} onChange={(e) => updateCourseLevel(c.id, e.target.value as any)} className="border rounded p-1 text-xs dark:bg-gray-700 dark:text-white"><option value={CourseLevel.BEGINNER}>{t('Beginner')}</option><option value={CourseLevel.INTERMEDIATE}>{t('Intermediate')}</option><option value={CourseLevel.ADVANCED}>{t('Advanced')}</option></select>
                              </td>
                              <td className="p-3">
                                <button onClick={() => updateCourseStatus(c.id, c.status==='published'?'draft':'published')} className="text-blue-600 text-xs">{c.status==='published'?t('archive'):t('publish')}</button>
                              </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              )}
              {activeTab === 'finance' && (
                 <div className="space-y-6">
                    <table className="w-full text-sm text-left"><thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300"><tr><th className="p-3">ID</th><th className="p-3">{t('amount')}</th><th className="p-3">{t('status')}</th></tr></thead><tbody>{transactions.map(t => (<tr key={t.id} className="border-b dark:border-gray-700"><td className="p-3 dark:text-gray-300">{t.id}</td><td className="p-3 dark:text-white font-bold">${t.amount}</td><td className="p-3 text-green-600">{t.status}</td></tr>))}</tbody></table>
                 </div>
              )}
              {activeTab === 'support' && (
                 <div className="space-y-4">
                    {reports.map(r => (
                       <div key={r.id} className="p-4 border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-900"><div className="flex justify-between"><div><span className="text-xs font-bold uppercase text-blue-600">{r.type}</span><p className="dark:text-white">{r.description}</p></div><div><select value={r.status} onChange={e => updateReportStatus(r.id, e.target.value as any)} className="border rounded text-xs dark:bg-gray-700 dark:text-white"><option value="new">{t('statusNew')}</option><option value="resolved">{t('statusResolved')}</option></select><button onClick={() => setReplyModal(r.id)} className="ml-2 text-xs text-primary">{t('reply')}</button></div></div>{r.reply && <p className="mt-2 text-xs text-green-600 border-l-2 pl-2 border-green-500">{r.reply}</p>}</div>
                    ))}
                 </div>
              )}
              {/* System & Backup Tabs can be simple placeholders or fully implemented as in original */}
              {activeTab === 'system' && <div className="dark:text-white">{t('systemConfigLoaded')}</div>}
              {activeTab === 'backup' && <button onClick={createBackup} className="bg-green-600 text-white px-4 py-2 rounded">{t('createBackup')}</button>}
           </div>
        </div>
        {showCreateUserModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md"><h3 className="font-bold mb-4 dark:text-white">{t('createUser')}</h3>
            <input className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder={t('fullName')} value={newUserData.name} onChange={e=>setNewUserData({...newUserData,name:e.target.value})}/>
            <input className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder={t('email')} value={newUserData.email} onChange={e=>setNewUserData({...newUserData,email:e.target.value})}/>
            <input className="w-full mb-2 p-2 border rounded dark:bg-gray-700 dark:text-white" type="password" placeholder={t('password')} value={newUserData.password} onChange={e=>setNewUserData({...newUserData,password:e.target.value})}/>
            <select className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white" value={newUserData.role} onChange={e=>setNewUserData({...newUserData,role:e.target.value as any})}>
              <option value={UserRole.TEACHER}>Teacher</option>
              <option value={UserRole.STUDENT}>Student</option>
              {currentUser?.email === SUPER_ADMIN_EMAIL && <option value={UserRole.ADMIN}>Admin</option>}
            </select>
            <div className="flex justify-end gap-3">
                <button onClick={() => setShowCreateUserModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">{t('cancel')}</button>
                <button onClick={() => { adminCreateUser(newUserData.name, newUserData.email, newUserData.password, newUserData.role); setShowCreateUserModal(false); }} className="bg-primary text-white px-4 py-2 rounded hover:bg-indigo-700">{t('create')}</button>
            </div>
            </div></div>
        )}
     </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

const MainContent = () => {
  const { currentUser, login, logout, notifications, transactions, language, setLanguage, markNotificationsRead, toggleDarkMode, darkMode, addReport, t } = useAppContext();
  const [currentView, setCurrentView] = useState('landing');
  const [reportContext, setReportContext] = useState<string|undefined>(undefined);

  useEffect(() => {
    // Simple routing based on auth status
    if (!currentUser && currentView !== 'landing' && currentView !== 'auth') {
       setCurrentView('landing');
    } else if (currentUser && currentView === 'auth') {
       setCurrentView(currentUser.role === UserRole.TEACHER ? 'teacher-portal' : currentUser.role === UserRole.ADMIN ? 'admin-portal' : 'dashboard');
    }
  }, [currentUser, currentView]);

  const handleNavigate = (view: string) => {
     setCurrentView(view);
  };

  return (
    <Layout 
      user={currentUser} 
      notifications={notifications} 
      onNavigate={handleNavigate} 
      onLogout={logout} 
      currentView={currentView}
      language={language}
      setLanguage={setLanguage}
      t={t}
      onReportIssue={(ctx) => setReportContext(ctx || currentView)}
      onMarkNotificationsRead={markNotificationsRead}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {currentView === 'landing' && <LandingView onEnroll={(id) => setCurrentView('course-' + id)} onNavigate={handleNavigate} />}
      {currentView === 'auth' && <AuthView onLoginSuccess={(role) => setCurrentView(role === UserRole.TEACHER ? 'teacher-portal' : role === UserRole.ADMIN ? 'admin-portal' : 'dashboard')} />}
      {currentView === 'dashboard' && <DashboardView onContinue={(id) => setCurrentView('course-' + id)} />}
      {currentView === 'assignments' && <AssignmentsView />}
      {currentView === 'grades' && <StudentGradesView />}
      {currentView === 'study-groups' && <StudyGroupsView />}
      {currentView === 'portfolio' && <PortfolioView />}
      {currentView === 'profile' && <ProfileView />}
      {currentView === 'teacher-portal' && <TeacherPortalView />}
      {currentView === 'admin-portal' && <AdminPortalView />}
      {currentView === 'inbox' && <InboxView />}
      {currentView.startsWith('course-') && (
         <CoursePlayerView 
           courseId={currentView.split('course-')[1]} 
           onReportLesson={(lTitle) => setReportContext(`Lesson Issue: ${lTitle}`)}
           onNavigate={handleNavigate}
         />
      )}
      
      <AIChatbot />
      <GuestSupportWidget />
      {reportContext && <ReportModal onClose={() => setReportContext(undefined)} initialContext={reportContext} />}
    </Layout>
  );
};

export default App;
