
import React from 'react';
import { ArrowLeft, Rocket, Shield, Globe, Users, Crown, Heart, Zap, Search, ShieldCheck } from 'lucide-react';

interface LearnMoreProps {
  onBack: () => void;
}

export const LearnMore: React.FC<LearnMoreProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-[#055a08] text-white py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <button onClick={onBack} className="flex items-center text-green-300 hover:text-white mb-12 transition-all font-black uppercase tracking-[0.2em] text-xs group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Return to Surface
          </button>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">The UniSpace<br/><span className="text-green-400">Blueprint.</span></h1>
          <p className="text-2xl md:text-3xl text-green-100 max-w-3xl leading-tight font-bold opacity-90">Revolutionizing the Nigerian campus experience through localized community, AI mastery, and verified student commerce.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-24 space-y-32">
        {/* Core Pillars */}
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 shadow-xl shadow-green-200/50"><Globe size={40} /></div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Localized Relevance</h2>
            <p className="text-slate-600 leading-relaxed text-xl font-bold">
              Why browse a national feed when you need course notes for UNILAG? Our localized school filters allow you to drill down into your specific university, finding students and materials that actually matter to your exams.
            </p>
            <ul className="space-y-4">
              {['School-specific Study Hubs', 'Local Faculty News', 'Instant Peer Connectivity'].map((item) => (
                <li key={item} className="flex items-center space-x-3 text-slate-800 font-black uppercase tracking-widest text-xs">
                  <Zap size={16} className="text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-[56px] p-12 border-2 border-slate-100 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Search size={120} />
             </div>
             <div className="space-y-6 relative z-10">
                <div className="p-4 bg-slate-50 rounded-2xl border-l-8 border-blue-500">
                  <p className="text-xs font-black text-slate-400 uppercase mb-1">Campus Hierarchy</p>
                  <p className="text-xl font-black text-slate-900">Professor (Creator)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border-l-8 border-purple-500 ml-8">
                  <p className="text-xs font-black text-slate-400 uppercase mb-1">Moderator</p>
                  <p className="text-xl font-black text-slate-900">Course Rep (30d active)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border-l-8 border-green-500 ml-16">
                  <p className="text-xs font-black text-slate-400 uppercase mb-1">Members</p>
                  <p className="text-xl font-black text-slate-900">Verified Student Body</p>
                </div>
             </div>
          </div>
        </div>

        {/* Safety & Trust */}
        <div className="flex flex-col md:flex-row gap-16 items-start bg-white p-16 rounded-[64px] border-2 border-slate-100 shadow-xl">
          <div className="bg-orange-100 p-6 rounded-[32px] text-orange-600 shadow-lg shadow-orange-100/50">
            <ShieldCheck size={48} />
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">The Manual Safety Net</h2>
            <p className="text-slate-600 leading-relaxed text-xl font-bold">
              Safety isn't automated here. All new campuses are manually assessed before public release to block harmful content. Student verification requires valid credentials, and Guest mode provides a transparent, professional entry point for commerce.
            </p>
            <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">
              <Shield size={14} />
              <span>Zero Tolerance: Drugs • Fraud • Occultism</span>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-slate-900 rounded-[72px] p-16 md:p-24 text-white relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-600/20 to-transparent"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-12">
             <div className="w-24 h-24 bg-[#07bc0c] rounded-[40px] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <Heart size={48} fill="white" />
             </div>
             <div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">Free Infrastructure<br/>for Students.</h2>
                <p className="text-green-100 text-2xl font-bold leading-relaxed opacity-80 mb-12">
                  Building your faculty's digital home shouldn't cost a kobo. Use our tools to organize, study, and thrive together without financial barriers.
                </p>
             </div>
             <button onClick={onBack} className="bg-white text-slate-900 px-16 py-6 rounded-full font-black text-lg uppercase tracking-widest hover:bg-green-400 hover:text-white transition-all shadow-4xl transform hover:scale-105 active:scale-95">Enter UniSpace</button>
          </div>
        </div>
      </div>

      <footer className="py-24 border-t border-slate-200 bg-white text-center">
         <p className="text-slate-400 font-black text-sm uppercase tracking-[0.4em]">&copy; UniSpace Nigeria • Excellence & Trust</p>
      </footer>
    </div>
  );
};
