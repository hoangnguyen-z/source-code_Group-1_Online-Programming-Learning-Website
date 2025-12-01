
import React, { useState } from 'react';
import { User, UserRole, Notification } from '../types';
import { 
  Menu, X, BookOpen, LayoutDashboard, LogOut, 
  User as UserIcon, Settings, Search, Bell, Shield, GraduationCap, Globe, Award,
  MessageSquare, Flag, Info, CheckCircle, AlertTriangle, AlertCircle, FolderOpen, Users, Briefcase, Sun, Moon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  notifications: Notification[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  currentView: string;
  language: 'en' | 'vn';
  setLanguage: (lang: 'en' | 'vn') => void;
  t: (key: string) => string;
  onReportIssue: (context?: string) => void;
  siteName?: string;
  onMarkNotificationsRead: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, notifications, onNavigate, onLogout, currentView, language, setLanguage, t, onReportIssue, siteName = "EduCode.AI", onMarkNotificationsRead, darkMode, toggleDarkMode
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const NavItem = ({ view, icon: Icon, label }: { view: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 ${
        currentView === view 
          ? 'text-primary bg-indigo-50 dark:bg-indigo-900/30 border-r-4 border-primary dark:text-white' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  const getIconForType = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-20">
        <div className="p-6 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
          <GraduationCap className="w-8 h-8 text-primary mr-2" />
          <span className="text-xl font-bold text-gray-800 dark:text-white">{siteName}</span>
        </div>

        <nav className="flex-1 pt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <NavItem view="landing" icon={Search} label={t('explore')} />
          
          {user && user.role === UserRole.STUDENT && (
            <>
              <NavItem view="dashboard" icon={LayoutDashboard} label={t('myLearning')} />
              <NavItem view="assignments" icon={FolderOpen} label={t('assignments')} />
              <NavItem view="grades" icon={Award} label={t('grades')} />
              <NavItem view="study-groups" icon={Users} label={t('studyGroups')} />
              <NavItem view="portfolio" icon={Briefcase} label={t('portfolio')} />
              <NavItem view="inbox" icon={MessageSquare} label={t('messages')} />
              <NavItem view="profile" icon={UserIcon} label={t('profile')} />
            </>
          )}

          {user && user.role === UserRole.TEACHER && (
             <>
               <NavItem view="teacher-portal" icon={BookOpen} label={t('instructorPortal')} />
               <NavItem view="inbox" icon={MessageSquare} label={t('messages')} />
               <NavItem view="profile" icon={UserIcon} label={t('profile')} />
             </>
          )}

          {user && user.role === UserRole.ADMIN && (
            <>
              <NavItem view="admin-portal" icon={Shield} label={t('adminConsole')} />
              <NavItem view="inbox" icon={MessageSquare} label={t('messages')} />
              <NavItem view="profile" icon={UserIcon} label={t('profile')} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
           <button 
            onClick={() => onReportIssue()}
            className="flex items-center w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md mb-4 transition"
           >
             <Flag className="w-4 h-4 mr-3" />
             {t('reportIssue')}
           </button>

          {user ? (
            <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
              <img src={user.avatarUrl || "https://via.placeholder.com/40"} alt="Avatar" className="w-8 h-8 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
              </div>
            </div>
          ) : (
             <button
                onClick={() => onNavigate('auth')}
                className="w-full mb-4 bg-primary text-white py-2 rounded-md hover:bg-indigo-700 transition"
              >
                {t('login')}
              </button>
          )}
          
          {user && (
            <button 
              onClick={onLogout}
              className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
         <div className="flex items-center" onClick={() => onNavigate('landing')}>
          <GraduationCap className="w-6 h-6 text-primary mr-2" />
          <span className="text-lg font-bold text-gray-800 dark:text-white">{siteName}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="text-gray-600 dark:text-gray-300">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600 dark:text-white" /> : <Menu className="w-6 h-6 text-gray-600 dark:text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800/50 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl p-4" onClick={e => e.stopPropagation()}>
            <nav className="flex flex-col space-y-2 mt-10">
              <NavItem view="landing" icon={Search} label={t('explore')} />
              
              {user && user.role === UserRole.STUDENT && (
                <>
                  <NavItem view="dashboard" icon={LayoutDashboard} label={t('myLearning')} />
                  <NavItem view="assignments" icon={FolderOpen} label={t('assignments')} />
                  <NavItem view="grades" icon={Award} label={t('grades')} />
                  <NavItem view="study-groups" icon={Users} label={t('studyGroups')} />
                  <NavItem view="portfolio" icon={Briefcase} label={t('portfolio')} />
                  <NavItem view="inbox" icon={MessageSquare} label={t('messages')} />
                  <NavItem view="profile" icon={UserIcon} label={t('profile')} />
                </>
              )}

              {user && user.role === UserRole.TEACHER && (
                <>
                  <NavItem view="teacher-portal" icon={BookOpen} label={t('instructorPortal')} />
                  <NavItem view="inbox" icon={MessageSquare} label={t('messages')} />
                  <NavItem view="profile" icon={UserIcon} label={t('profile')} />
                </>
              )}

              {user && user.role === UserRole.ADMIN && (
                <>
                  <NavItem view="admin-portal" icon={Shield} label={t('adminConsole')} />
                  <NavItem view="inbox" icon={MessageSquare} label={t('messages')} />
                  <NavItem view="profile" icon={UserIcon} label={t('profile')} />
                </>
              )}

               <button 
                onClick={() => { onReportIssue(); setIsMobileMenuOpen(false); }}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-700 rounded-md"
               >
                 <Flag className="w-5 h-5 mr-3" />
                 {t('reportIssue')}
               </button>

              {!user && (
                <button onClick={() => { onNavigate('auth'); setIsMobileMenuOpen(false); }} className="mt-4 w-full bg-primary text-white py-2 rounded">{t('login')}</button>
              )}
              {user && (
                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="mt-4 w-full border border-red-200 text-red-600 py-2 rounded">{t('logout')}</button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Top Bar (Desktop) */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

             {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'vn' : 'en')}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary px-3 py-1 rounded-full border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'EN' : 'VN'}
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                      <span className="font-bold text-sm text-gray-700 dark:text-white">{t('notifications')}</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={onMarkNotificationsRead}
                          className="text-xs text-primary hover:underline"
                        >
                          {t('markRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
                            <div className="flex gap-3">
                              <div className="mt-1 flex-shrink-0">
                                {getIconForType(n.type)}
                              </div>
                              <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
};
