
import React, { useState } from 'react';
import { User, UserPreferences } from '../types';
import { 
  Settings as SettingsIcon, 
  Type, 
  Moon, 
  Sun, 
  Lock, 
  LogOut, 
  UserPlus, 
  ShieldCheck, 
  ChevronRight, 
  KeyRound,
  Eye,
  EyeOff,
  Bell,
  Monitor
} from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdatePreferences, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'DISPLAY' | 'ACCOUNT' | 'SECURITY'>('DISPLAY');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const fonts: UserPreferences['font'][] = ['Inter', 'Serif', 'Mono'];
  const fontSizes: UserPreferences['fontSize'][] = ['sm', 'base', 'lg', 'xl'];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password updated successfully!");
    setCurrentPass('');
    setNewPass('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Personalize your UniSpace ecosystem.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-1/4 space-y-2">
          <button 
            onClick={() => setActiveTab('DISPLAY')}
            className={`w-full flex items-center space-x-3 p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'DISPLAY' ? 'bg-[#07bc0c] text-white shadow-xl' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Monitor size={18} />
            <span>Display</span>
          </button>
          <button 
            onClick={() => setActiveTab('ACCOUNT')}
            className={`w-full flex items-center space-x-3 p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'ACCOUNT' ? 'bg-[#07bc0c] text-white shadow-xl' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <KeyRound size={18} />
            <span>Account</span>
          </button>
          <button 
            onClick={() => setActiveTab('SECURITY')}
            className={`w-full flex items-center space-x-3 p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'SECURITY' ? 'bg-[#07bc0c] text-white shadow-xl' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <ShieldCheck size={18} />
            <span>Security</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-200 dark:border-slate-700 shadow-xl min-h-[500px]">
            {activeTab === 'DISPLAY' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                <section>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center">
                    <Sun className="mr-2 text-orange-500" size={20} /> Theme Mode
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => onUpdatePreferences({ theme: 'light' })}
                      className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-2 ${user.preferences.theme === 'light' ? 'border-[#07bc0c] bg-green-50 dark:bg-green-900/10' : 'border-slate-100 dark:border-slate-700'}`}
                    >
                      <Sun size={32} className="text-orange-500" />
                      <span className="font-black text-xs uppercase tracking-widest">Light</span>
                    </button>
                    <button 
                      onClick={() => onUpdatePreferences({ theme: 'dark' })}
                      className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-2 ${user.preferences.theme === 'dark' ? 'border-[#07bc0c] bg-green-50 dark:bg-green-900/10' : 'border-slate-100 dark:border-slate-700'}`}
                    >
                      <Moon size={32} className="text-blue-500" />
                      <span className="font-black text-xs uppercase tracking-widest">Dark</span>
                    </button>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center">
                    <Type className="mr-2 text-green-600" size={20} /> Typography Choice
                  </h3>
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Font Family</p>
                      <div className="flex flex-wrap gap-3">
                        {fonts.map(f => (
                          <button 
                            key={f} 
                            onClick={() => onUpdatePreferences({ font: f })}
                            className={`px-6 py-3 rounded-full border-2 font-bold text-sm transition-all ${user.preferences.font === f ? 'border-[#07bc0c] bg-[#07bc0c] text-white' : 'border-slate-100 dark:border-slate-700 text-slate-500'}`}
                            style={{ fontFamily: f === 'Serif' ? 'Georgia' : f === 'Mono' ? 'monospace' : 'inherit' }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Text Scale</p>
                      <div className="flex flex-wrap gap-3">
                        {fontSizes.map(s => (
                          <button 
                            key={s} 
                            onClick={() => onUpdatePreferences({ fontSize: s })}
                            className={`px-6 py-3 rounded-full border-2 font-bold transition-all ${user.preferences.fontSize === s ? 'border-[#07bc0c] bg-[#07bc0c] text-white' : 'border-slate-100 dark:border-slate-700 text-slate-500'}`}
                            style={{ fontSize: s === 'sm' ? '12px' : s === 'base' ? '14px' : s === 'lg' ? '16px' : '18px' }}
                          >
                            {s.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'ACCOUNT' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                <section>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center">
                    <Lock className="mr-2 text-purple-600" size={20} /> Update Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="Current Password" 
                        className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-bold"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                    <input 
                      type="password" 
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="New Password" 
                      className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-bold"
                    />
                    <button className="w-full py-4 bg-[#07bc0c] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-700 shadow-lg active:scale-95">Sync Credentials</button>
                  </form>
                </section>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-10 space-y-4">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Login Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[24px] border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-all group">
                      <div className="flex items-center space-x-3">
                        <UserPlus size={24} className="text-blue-500" />
                        <span className="font-black text-sm uppercase tracking-widest text-slate-700 dark:text-slate-300">Login into another account</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button onClick={onLogout} className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-900/10 rounded-[24px] border-2 border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all group">
                      <div className="flex items-center space-x-3">
                        <LogOut size={24} className="text-red-600" />
                        <span className="font-black text-sm uppercase tracking-widest text-red-700 dark:text-red-400">Log Out Session</span>
                      </div>
                      <ChevronRight size={18} className="text-red-300 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SECURITY' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                <section>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center">
                    <ShieldCheck className="mr-2 text-green-600" size={20} /> Protection Suite
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-[24px]">
                      <div>
                        <p className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-widest">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500 mt-1">Recommended for verified students.</p>
                      </div>
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-[24px]">
                      <div>
                        <p className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-widest">Login Notifications</p>
                        <p className="text-xs text-slate-500 mt-1">Receive alerts for new browser access.</p>
                      </div>
                      <div className="w-12 h-6 bg-[#07bc0c] rounded-full relative p-1 cursor-pointer flex justify-end">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </section>
                
                <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[32px] border-2 border-blue-100 dark:border-blue-800">
                  <h4 className="font-black text-blue-900 dark:text-blue-300 mb-2 flex items-center"><Bell size={18} className="mr-2"/> Safety Notice</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-bold">Never share your password or UniWallet pins. Our staff will never request them via chat.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
