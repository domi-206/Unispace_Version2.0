
import React from 'react';
import { User } from '../types';
import { Star, ShieldCheck, TrendingUp, Users, Crown } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  featuredUsers: User[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, featuredUsers }) => {
  const ambassadors = featuredUsers.filter(u => u.referralCount >= 10);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-950 opacity-90"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-400 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-yellow-400 opacity-10 blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:w-2/3">
            <div className="inline-block bg-green-800/50 backdrop-blur-sm border border-green-700 rounded-full px-4 py-1.5 mb-6">
               <span className="text-green-300 font-semibold text-sm tracking-wide uppercase">The #1 Platform for Nigerian Students</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Your Campus Life, <br />
              <span className="text-green-400">Upgraded.</span>
            </h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl leading-relaxed">
              Unispace connects you with everything you need: a trusted marketplace, AI-powered study tools, and a thriving community of peers across Nigeria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                 onClick={onGetStarted}
                 className="bg-green-400 text-green-950 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-300 transition-all hover:scale-105 shadow-lg shadow-green-900/50"
               >
                 Join Unispace Now
               </button>
               <button className="px-8 py-4 rounded-full font-bold text-lg border border-green-500 text-green-100 hover:bg-green-800/50 transition-colors">
                 Learn More
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-16">We've built a complete ecosystem to help you succeed academically and socially.</p>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6 mx-auto transform -rotate-3"><TrendingUp size={28} /></div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">UniMarket</h3>
                  <p className="text-slate-600 leading-relaxed">Buy and sell textbooks, gadgets, and services securely within your campus. No more sketchy meetups.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 mx-auto transform rotate-3"><ShieldCheck size={28} /></div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">StudyHub AI</h3>
                  <p className="text-slate-600 leading-relaxed">Upload course materials and let our AI generate topic-by-topic quizzes to help you ace your exams.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 mx-auto transform -rotate-2"><Users size={28} /></div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">Institutions</h3>
                  <p className="text-slate-600 leading-relaxed">Join department groups, find study partners, and stay updated with campus news in real-time.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Ambassador Section */}
      {ambassadors.length > 0 && (
        <div className="py-24 bg-white border-t border-slate-100">
           <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                 <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
                    <Crown size={16} />
                    <span>Hall of Fame</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Campus Ambassadors</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto">
                    Meet the students driving change and building the Unispace community across Nigeria. 
                    Refer 10 friends to get featured here!
                 </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {ambassadors.map((ambassador) => (
                    <div key={ambassador.id} className="group relative bg-white rounded-2xl border border-slate-200 p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                       <div className="absolute top-0 right-0 p-2">
                          <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                             {ambassador.referralCount} Invites
                          </div>
                       </div>
                       <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-br from-yellow-400 to-orange-500 mb-3">
                          <img src={ambassador.avatarUrl} alt={ambassador.name} className="w-full h-full rounded-full border-2 border-white object-cover" />
                       </div>
                       <h3 className="font-bold text-slate-900 text-sm truncate">{ambassador.name}</h3>
                       <p className="text-xs text-slate-500 truncate mb-2">{ambassador.university}</p>
                       <div className="flex justify-center">
                          <Star className="text-yellow-400 fill-yellow-400" size={14} />
                          <Star className="text-yellow-400 fill-yellow-400" size={14} />
                          <Star className="text-yellow-400 fill-yellow-400" size={14} />
                          <Star className="text-yellow-400 fill-yellow-400" size={14} />
                          <Star className="text-yellow-400 fill-yellow-400" size={14} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
               <div className="bg-green-600 text-white p-1.5 rounded-lg font-bold text-xl">U</div>
               <span className="font-bold text-white text-xl">Unispace</span>
            </div>
            <div className="text-sm">
               &copy; {new Date().getFullYear()} Unispace Nigeria. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
};
