
import React from 'react';
import { User, Product, Topic, ChatSession } from '../types';
import { Wallet, TrendingUp, GraduationCap, MessageSquare, Plus, ArrowRight, Bell } from 'lucide-react';

interface DashboardProps {
  user: User;
  activeListings: Product[];
  recentTopics: Topic[];
  unreadMessages: number;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, activeListings, recentTopics, unreadMessages, onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening in your Unispace today.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('market')}
            className="flex items-center space-x-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 dark:shadow-none"
          >
            <Plus size={18} />
            <span>Sell Item</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card - Green Background */}
        <div 
          onClick={() => onNavigate('wallet')}
          className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
          style={{ backgroundColor: '#07bc0c' }}
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">UniWallet</span>
          </div>
          <p className="text-green-100 text-sm mb-1">Available Balance</p>
          <h3 className="text-3xl font-bold">₦{user.walletBalance.toLocaleString()}</h3>
        </div>

        {/* Market Stats */}
        <div 
          onClick={() => onNavigate('market')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-green-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            {unreadMessages > 0 && (
              <span className="flex items-center space-x-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                <MessageSquare size={12} />
                <span>{unreadMessages} new</span>
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Active Listings</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{activeListings.length} Items</h3>
            <p className="text-xs text-slate-400">View your products</p>
          </div>
        </div>

        {/* Study Stats */}
        <div 
          onClick={() => onNavigate('study')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-green-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
              <GraduationCap size={24} />
            </div>
            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-1 rounded-full">StudyHub</span>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Topics Mastered</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
              {recentTopics.filter(t => t.isCompleted).length} / {recentTopics.length || 0}
            </h3>
            <p className="text-xs text-slate-400">Keep up the streak!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity / Feed Preview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Updates</h3>
            <button onClick={() => onNavigate('feed')} className="text-green-600 text-sm font-semibold hover:underline">View Feed</button>
          </div>
          <div className="space-y-4">
             {/* Mock Notifications */}
             <div className="flex items-start space-x-3 pb-4 border-b border-slate-50 dark:border-slate-700">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600">
                   <Bell size={16} />
                </div>
                <div>
                   <p className="text-sm font-medium text-slate-800 dark:text-white">Welcome to Unispace v1.0!</p>
                   <p className="text-xs text-slate-500 mt-0.5">Start by verifying your student status to unlock full access.</p>
                </div>
             </div>
             <div className="flex items-start space-x-3 pb-4 border-b border-slate-50 dark:border-slate-700">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600">
                   <TrendingUp size={16} />
                </div>
                <div>
                   <p className="text-sm font-medium text-slate-800 dark:text-white">Marketplace is heating up</p>
                   <p className="text-xs text-slate-500 mt-0.5">Over 50 new textbooks listed in your university this week.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Quick Study Access */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Continue Studying</h3>
            <button onClick={() => onNavigate('study')} className="text-green-600 text-sm font-semibold hover:underline">Go to Hub</button>
          </div>
          
          {recentTopics.length > 0 ? (
            <div className="space-y-3">
              {recentTopics.slice(0, 3).map((topic, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group cursor-pointer" onClick={() => onNavigate('study')}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${topic.isCompleted ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{topic.title}</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-green-600 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-slate-50 dark:bg-slate-700 inline-block p-4 rounded-full mb-3">
                <GraduationCap className="text-slate-400" size={24} />
              </div>
              <p className="text-sm text-slate-500 mb-4">No active study topics.</p>
              <button 
                onClick={() => onNavigate('study')}
                className="text-green-600 font-bold text-sm hover:underline"
              >
                Upload a document to start
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
