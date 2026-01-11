
import React from 'react';
import { User, Product, Topic, UserTier, UserRole } from '../types';
import { Wallet, TrendingUp, GraduationCap, MessageSquare, Plus, ArrowRight, Zap, Award, Crown, Gem, Star, Lock, Mic, Search, FileText, Share2, Users } from 'lucide-react';

interface DashboardProps {
  user: User;
  activeListings: Product[];
  recentTopics: Topic[];
  unreadMessages: number;
  onNavigate: (tab: string) => void;
}

const TIER_THEMES: Record<UserTier, { color: string, icon: any, bg: string, border: string }> = {
  [UserTier.STARTER]: { color: 'text-slate-400', icon: Zap, bg: 'bg-slate-50', border: 'border-slate-200' },
  [UserTier.BRONZE]: { color: 'text-orange-700', icon: Award, bg: 'bg-orange-50', border: 'border-orange-200' },
  [UserTier.SILVER]: { color: 'text-slate-600', icon: Star, bg: 'bg-slate-50', border: 'border-slate-300' },
  [UserTier.GOLD]: { color: 'text-yellow-700', icon: Crown, bg: 'bg-yellow-50', border: 'border-yellow-300' },
  [UserTier.DIAMOND]: { color: 'text-blue-700', icon: Gem, bg: 'bg-blue-50', border: 'border-blue-300' },
  [UserTier.PLATINUM]: { color: 'text-purple-700', icon: Crown, bg: 'bg-purple-50', border: 'border-purple-300' },
};

export const Dashboard: React.FC<DashboardProps> = ({ user, activeListings, recentTopics, unreadMessages, onNavigate }) => {
  const theme = TIER_THEMES[user.tier];
  const TierIcon = theme.icon;
  const isStudent = user.role === UserRole.STUDENT;

  const nextMilestone = user.referralCount < 5 ? 5 : user.referralCount < 150 ? 150 : user.referralCount < 300 ? 300 : user.referralCount < 700 ? 700 : 1000;
  const progress = Math.round((user.referralCount / nextMilestone) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 shadow-md object-cover" />
            {isStudent && (
              <div className={`absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow z-20 border border-slate-50 dark:border-slate-700 ${theme.color}`}>
                <TierIcon size={16} fill="currentColor" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Hi, {user.name.split(' ')[0]}!</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {isStudent && <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${theme.bg} ${theme.color} border ${theme.border}`}>{user.tier} Standing</span>}
              {!isStudent && <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Guest</span>}
              {isStudent && user.isCampusLeader && <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-600 text-white animate-pulse">Leader</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={() => onNavigate('market')} className="flex items-center space-x-2 bg-slate-900 dark:bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-600 transition-all active:scale-95"><Plus size={16} /><span>Sell Item</span></button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => onNavigate('wallet')} className="group rounded-3xl p-8 text-white shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all bg-[#07bc0c]">
          <p className="text-green-50 text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">UniWallet</p>
          <h3 className="text-3xl font-black tracking-tight mb-8">₦{user.walletBalance.toLocaleString()}</h3>
          <div className="inline-flex items-center text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-colors">Manage Funds <ArrowRight size={12} className="ml-2"/></div>
        </div>

        <div onClick={() => onNavigate('study')} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-green-500 transition-all group">
          <div className="flex justify-between items-center mb-6">
             <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:rotate-12 transition-transform"><GraduationCap size={24} /></div>
             <div className="text-right leading-none">
                <p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{recentTopics.filter(t => t.isCompleted).length}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Knowledge</p>
             </div>
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Study Hub</h3>
        </div>

        {isStudent ? (
          <div onClick={() => onNavigate('profile')} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-all group">
            <div className="flex justify-between items-center mb-6">
               <div className={`p-4 rounded-2xl ${theme.bg} ${theme.color} group-hover:scale-110 transition-transform`}><TierIcon size={24} /></div>
               <div className="text-right leading-none">
                  <p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{user.referralCount}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Points</p>
               </div>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{user.tier} Tier</h3>
          </div>
        ) : (
          <div onClick={() => onNavigate('premium')} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-orange-500 transition-all group">
            <div className="flex justify-between items-center mb-6">
               <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:rotate-12 transition-transform"><Crown size={24} /></div>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Standard</h3>
          </div>
        )}

        <div onClick={() => onNavigate('chat')} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-purple-500 transition-all group">
          <div className="flex justify-between items-center mb-6">
             <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:-rotate-12 transition-transform"><MessageSquare size={24} /></div>
             <div className="text-right leading-none">
                <p className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{unreadMessages}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Active</p>
             </div>
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Messages</h3>
        </div>
      </div>

      {/* Referral Hub - Only for Students */}
      {isStudent && (
        <div className="bg-slate-950 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/5 space-y-6">
              <h3 className="text-3xl font-black tracking-tight leading-none">The Goal is <span className="text-green-500">Platinum.</span></h3>
              <p className="text-sm text-slate-400 font-bold leading-relaxed">Invite campus peers to climb the hierarchy. Platinum users unlock the entire tool suite for life.</p>
              
              <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                   <span className="text-xs font-black text-green-500">{progress}% to {nextMilestone} Peers</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 p-1 shadow-inner border border-white/5">
                   <div className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              
              <button onClick={() => onNavigate('profile')} className="w-full bg-white text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all active:scale-95 flex items-center justify-center space-x-2 group/btn"><Share2 size={16}/><span>Invite Peers</span></button>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { count: 150, icon: Mic, label: 'Podcast AI', desc: 'Audio Synthesis' },
                { count: 300, icon: Search, label: 'Exam Solver', desc: 'Contextual Scanner' },
                { count: 700, icon: FileText, label: 'Doc Logic', desc: 'PDF Intelligence' },
                { count: 1000, icon: Crown, label: 'Leader Seal', desc: 'Official Standing' }
              ].map((m) => (
                <div key={m.label} className={`p-6 rounded-2xl border transition-all duration-500 flex flex-col ${user.referralCount >= m.count ? 'bg-white/10 border-green-500/40' : 'bg-white/5 border-white/10 opacity-40'}`}>
                   <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${user.referralCount >= m.count ? 'bg-green-600 text-white' : 'bg-white/10 text-slate-500'}`}><m.icon size={20} /></div>
                      {user.referralCount < m.count && <Lock size={14} className="text-slate-700" />}
                   </div>
                   <h4 className="text-sm font-black mb-1">{m.label}</h4>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.count} Invites</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
