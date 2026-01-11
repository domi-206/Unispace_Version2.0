
import React, { useState } from 'react';
import { User, UserTier, UserRole } from '../types';
import { 
  ShieldCheck, Settings, Copy, Share2, Users, Crown, Gem, Star, Zap, Award, 
  Check, Mic, FileText, Globe, Edit3, ExternalLink, Clock, Briefcase, 
  Building, MapPin, Hash, UserCircle, Save, X, Plus 
} from 'lucide-react';

interface ProfileProps {
  user: User;
  currentUser?: User;
  joinedCampusCount: number;
  onSubscribe: () => void;
  onUpdateProfile: (data: Partial<User>) => void;
  onNavigateToSettings: () => void;
}

const TIER_CONFIG: Record<UserTier, { color: string, icon: any, gradient: string, glow: string }> = {
  [UserTier.STARTER]: { color: 'text-slate-400', icon: Zap, gradient: 'from-slate-100 to-slate-200', glow: 'shadow-slate-100' },
  [UserTier.BRONZE]: { color: 'text-orange-700', icon: Award, gradient: 'from-orange-100 to-orange-300', glow: 'shadow-orange-200' },
  [UserTier.SILVER]: { color: 'text-slate-600', icon: Star, gradient: 'from-slate-200 to-slate-400', glow: 'shadow-slate-300' },
  [UserTier.GOLD]: { color: 'text-yellow-700', icon: Crown, gradient: 'from-yellow-200 to-yellow-500', glow: 'shadow-yellow-300' },
  [UserTier.DIAMOND]: { color: 'text-blue-700', icon: Gem, gradient: 'from-blue-200 to-blue-500', glow: 'shadow-blue-300' },
  [UserTier.PLATINUM]: { color: 'text-purple-700', icon: Crown, gradient: 'from-purple-200 to-purple-600', glow: 'shadow-purple-400' },
};

export const Profile: React.FC<ProfileProps> = ({ user, currentUser, joinedCampusCount, onSubscribe, onUpdateProfile, onNavigateToSettings }) => {
  const [activeTab, setActiveTab] = useState<'VIEW' | 'REFERRALS'>('VIEW');
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState({
    name: user.name,
    bio: user.bio,
    profession: user.profession || '',
    workPlace: user.workPlace || '',
    websiteUrl: user.websiteUrl || '',
    careerInterests: user.careerInterests || []
  });

  const [newInterest, setNewInterest] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const isOwnProfile = !currentUser || currentUser.id === user.id;
  const isStudent = user.role === UserRole.STUDENT;
  const config = TIER_CONFIG[user.tier];
  const TierIcon = config.icon;

  const referralLink = `https://unispace.ng/join?ref=${user.referralCode}`;

  const handleSave = () => {
    onUpdateProfile(editData);
    setIsEditing(false);
  };

  const addInterest = () => {
    if (newInterest.trim() && !editData.careerInterests.includes(newInterest.trim())) {
      setEditData({ ...editData, careerInterests: [...editData.careerInterests, newInterest.trim()] });
      setNewInterest('');
    }
  };

  const removeInterest = (val: string) => {
    setEditData({ ...editData, careerInterests: editData.careerInterests.filter(i => i !== val) });
  };

  const copyToClipboard = (text: string, type: 'LINK' | 'TEMPLATE') => {
    navigator.clipboard.writeText(text);
    if (type === 'LINK') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedTemplate(text);
      setTimeout(() => setCopiedTemplate(null), 2000);
    }
  };

  const templates = [
    {
      id: 'no-stress',
      title: 'The "No Stress" (Casual)',
      content: `School stress is plenty but I’ve found the cheat code! 🚀\nThis AI Study tool turns my bulky PDFs into Podcasts 🎧 and even solves past questions for me.\nUse my link to get a 7-day Free Trial and start reading smart:\n${referralLink}\nDon't gree for any carryover! ✌️`
    },
    {
      id: 'academic-savior',
      title: 'The "Academic Savior" (Value)',
      content: `Check this AI tool for Nigerian students! 🤯\nUpload materials and it will:\n✅ Summarize everything.\n✅ Create Quizzes.\n✅ Solve Theory questions.\n✅ Create study Podcasts.\nJoin using my link for 7 days full access:\n${referralLink}\nLet's get these A’s! 📈📚`
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        <div className="h-32 bg-green-700 relative">
           <div className="absolute top-4 right-4 flex space-x-2">
              {isOwnProfile && !isEditing && (
                <>
                  <button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl backdrop-blur-md transition-all font-bold text-[10px] uppercase tracking-widest">
                    Edit Profile
                  </button>
                  <button onClick={onNavigateToSettings} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl backdrop-blur-md transition-all"><Settings size={18} /></button>
                </>
              )}
           </div>
        </div>
        
        <div className="px-8 pb-8">
           <div className="relative flex flex-col sm:flex-row items-end sm:items-center -mt-12 mb-6 gap-6">
              <div className="relative">
                 <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-800 shadow-xl bg-white object-cover relative z-10" />
                 {user.verified && (
                    <div className="absolute bottom-1 right-1 bg-green-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800 z-20"><ShieldCheck size={16} /></div>
                 )}
              </div>

              <div className="flex-1 space-y-1">
                 {isEditing ? (
                    <div className="space-y-2 mb-4">
                       <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full text-2xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500 dark:text-white" />
                       <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={editData.profession} onChange={e => setEditData({...editData, profession: e.target.value})} placeholder="Profession" className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                          <input type="text" value={editData.workPlace} onChange={e => setEditData({...editData, workPlace: e.target.value})} placeholder="Faculty/Work" className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                       </div>
                    </div>
                 ) : (
                    <div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {user.name}
                        {isStudent && user.isCampusLeader && <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Leader</span>}
                       </h2>
                       <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-green-600"/> {user.profession || 'Student'}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-green-600"/> {user.university}</span>
                       </div>
                    </div>
                 )}
              </div>

              {isStudent && (
                <div className="flex-shrink-0">
                   <div className="flex items-center space-x-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                      <TierIcon size={20} className={`${config.color}`} fill="currentColor" />
                      <div className="text-left leading-none">
                         <span className={`block font-black text-xs uppercase tracking-widest ${config.color}`}>{user.tier} Rank</span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           {!isEditing ? (
             <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bio</p>
                   <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">"{user.bio || "Exploring Unispace."}"</p>
                </div>
                
                {user.websiteUrl && (
                  <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-600 hover:underline font-bold text-xs">
                    <Globe size={14} className="mr-1.5" />
                    {user.websiteUrl.replace(/^https?:\/\//, '')}
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                )}
             </div>
           ) : (
             <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Website</label>
                      <input type="text" value={editData.websiteUrl} onChange={e => setEditData({...editData, websiteUrl: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="https://example.com" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Bio</label>
                      <textarea value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm outline-none focus:ring-2 focus:ring-green-500 min-h-[80px] resize-none" placeholder="Tell your story..." />
                   </div>
                </div>
                
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Competencies / Interests</label>
                   <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      {editData.careerInterests.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-black rounded-full border shadow-sm uppercase tracking-widest">
                           {tag}
                           <button onClick={() => removeInterest(tag)} className="p-0.5 hover:text-red-500"><X size={12}/></button>
                        </span>
                      ))}
                      <div className="flex items-center gap-2">
                         <input type="text" value={newInterest} onChange={e => setNewInterest(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())} className="bg-transparent border-none focus:ring-0 font-bold text-xs" placeholder="Add interest..." />
                         <button onClick={addInterest} className="text-green-600 hover:text-green-700"><Plus size={16}/></button>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button onClick={() => setIsEditing(false)} className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] hover:bg-slate-100 rounded-xl">Cancel</button>
                   <button onClick={handleSave} className="flex-[2] py-3 bg-green-600 text-white rounded-xl font-bold uppercase text-[10px] hover:bg-green-700 shadow-sm active:scale-95 flex items-center justify-center space-x-2">
                      <Save size={14} />
                      <span>Save Changes</span>
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-slate-100 dark:border-slate-700">
          <button onClick={() => setActiveTab('VIEW')} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'VIEW' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-400 hover:bg-slate-50'}`}>Identity</button>
          {isStudent && <button onClick={() => setActiveTab('REFERRALS')} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'REFERRALS' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-400 hover:bg-slate-50'}`}>Referrals</button>}
        </div>
      </div>

      {activeTab === 'VIEW' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-black mb-6 dark:text-white uppercase tracking-widest flex items-center"><Users className="mr-2 text-blue-500" size={16}/> Ecosystem Presence</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                  <p className="text-2xl font-black dark:text-white">{joinedCampusCount}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Faculties</p>
                </div>
                {isStudent && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-2xl font-black dark:text-white">{user.referralCount}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Invites</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-black mb-6 dark:text-white uppercase tracking-widest flex items-center"><Star className="mr-2 text-yellow-500" size={16}/> Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {(user.careerInterests || ['Academic Achievement', 'Digital Strategy']).map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-[10px] font-black rounded-full border border-green-100 dark:border-green-800 uppercase tracking-widest">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-sm font-black mb-2 uppercase tracking-widest">{isStudent ? 'Growth Path' : 'Premium'}</h3>
                <p className="text-[10px] font-bold text-slate-400 mb-6 leading-relaxed">
                  {isStudent ? 'Unlock Platinum for lifetime tool access.' : 'Upgrade your account for full study tool access.'}
                </p>
                <button onClick={onSubscribe} className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-green-400 hover:text-white transition-all">Upgrade Now</button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
               <h4 className="font-black uppercase tracking-widest text-[9px] text-slate-400 mb-4">Longevity</h4>
               <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-green-600"><Clock size={18} /></div>
                  <div>
                    <p className="font-black text-lg dark:text-white leading-none">{Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24))} Days</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black mt-1">Established {new Date(user.joinedAt).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Network Hub</h3>
            <p className="text-slate-500 text-sm font-bold mb-8 max-w-md mx-auto">Invite peers to escape document stress and earn permanent academic tools.</p>
            <div className="inline-flex items-center space-x-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-2 w-full max-w-md">
              <span className="font-mono text-sm font-bold text-green-600 truncate flex-1 text-left">{referralLink}</span>
              <button onClick={() => copyToClipboard(referralLink, 'LINK')} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-green-600 transition-all">
                {copiedLink ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Code: {user.referralCode}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col hover:border-green-600 transition-all group">
                <h4 className="text-xs font-black text-slate-800 dark:text-white mb-4 uppercase tracking-widest">{tpl.title}</h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-pre-wrap flex-1 mb-6 italic leading-relaxed border border-slate-100 dark:border-slate-700">
                  {tpl.content}
                </div>
                <button 
                  onClick={() => copyToClipboard(tpl.content, 'TEMPLATE')}
                  className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${copiedTemplate === tpl.content ? 'bg-green-100 text-green-600' : 'bg-slate-900 dark:bg-black text-white hover:bg-green-600'}`}
                >
                  {copiedTemplate === tpl.content ? (
                    <><Check size={14} /> <span>Copied!</span></>
                  ) : (
                    <><Copy size={14} /> <span>Copy Message</span></>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
