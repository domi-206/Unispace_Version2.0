
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  GraduationCap, 
  Wallet, 
  UserCircle, 
  Menu, 
  X, 
  MessageSquare,
  Bell,
  Building2,
  HelpCircle,
  Moon,
  Sun,
  LogOut,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  notifications: Notification[];
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, userRole, isDarkMode, toggleTheme, notifications, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'market', label: 'UniMarket', icon: ShoppingBag },
    { id: 'study', label: 'StudyHub', icon: GraduationCap },
    { id: 'feed', label: 'CampusFeed', icon: MessageSquare },
    { id: 'groups', label: 'Campus', icon: Building2 },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const personalItems = [
    { id: 'wallet', label: 'UniWallet', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={16} className="text-green-500" />;
      case 'WARNING': return <AlertTriangle size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Mobile Header */}
      <div className="md:hidden bg-green-700 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="bg-white text-green-700 p-1.5 rounded-lg font-bold text-xl">U</div>
          <span className="font-bold text-lg tracking-tight">Unispace</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
      `}>
        <div className="h-full flex flex-col">
          <div className={`hidden md:flex items-center space-x-2 p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="bg-green-600 text-white p-2 rounded-lg font-bold text-2xl">U</div>
            <span className={`font-bold text-2xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Unispace</span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <div className={`mb-2 text-xs font-semibold uppercase tracking-wider px-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Menu</div>
            <nav className="space-y-1 mb-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

             <div className={`mb-2 text-xs font-semibold uppercase tracking-wider px-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Personal</div>
             <nav className="space-y-1">
              {personalItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4">
             <button 
               onClick={onLogout}
               className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
             >
                <LogOut size={20} />
                <span>Log Out</span>
             </button>
          </div>

          <div className={`p-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                {userRole === 'STUDENT' ? 'S' : 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {userRole === 'STUDENT' ? 'Student User' : 'Guest User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {userRole === 'STUDENT' ? 'Verified' : 'Unverified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <header className={`hidden md:flex justify-between items-center p-6 border-b sticky top-0 z-30 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h1 className={`text-xl font-bold capitalize ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            {navItems.find(i => i.id === activeTab)?.label || personalItems.find(i => i.id === activeTab)?.label}
          </h1>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-green-600 transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-green-600 transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                   <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                      <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                   </div>
                   <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                         <div className="p-6 text-center text-slate-400 text-sm">No new notifications</div>
                      ) : (
                         notifications.map(note => (
                            <div key={note.id} className={`p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!note.read ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                               <div className="flex items-start space-x-3">
                                  <div className="mt-1">{getNotificationIcon(note.type)}</div>
                                  <div>
                                     <p className="text-sm font-semibold text-slate-800 dark:text-white">{note.title}</p>
                                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{note.message}</p>
                                     <p className="text-[10px] text-slate-400 mt-2">{note.time}</p>
                                  </div>
                               </div>
                            </div>
                         ))
                      )}
                   </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-20 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
};
