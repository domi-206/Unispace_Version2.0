
import React, { useState } from 'react';
import { User, ProfileViewer } from '../types';
import { ShieldCheck, Eye, CreditCard, Lock, Settings, Edit3, Save, Copy, Share2, Briefcase, Mail, Globe, Check } from 'lucide-react';

interface ProfileProps {
  user: User;
  viewers: ProfileViewer[];
  onSubscribe: () => void;
  onVerify: () => void;
  onUpdateProfile: (data: Partial<User>) => void;
}

const INTEREST_TAGS = [
  "Technology", "Coding", "Design", "Business", "Marketing", 
  "Entrepreneurship", "Music", "Art", "Photography", "Fashion", 
  "Sports", "Gaming", "Reading", "Travel", "Science", "Politics"
];

export const Profile: React.FC<ProfileProps> = ({ user, viewers, onSubscribe, onVerify, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'VIEW' | 'SETTINGS'>('VIEW');
  const [editBio, setEditBio] = useState(user.bio);
  const [editName, setEditName] = useState(user.name);
  const [editPortfolio, setEditPortfolio] = useState(user.portfolioUrl || '');
  const [editBusinessEmail, setEditBusinessEmail] = useState(user.businessEmail || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests || []);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onUpdateProfile({ 
      name: editName, 
      bio: editBio,
      portfolioUrl: editPortfolio,
      businessEmail: editBusinessEmail,
      interests: selectedInterests
    });
    setActiveTab('VIEW');
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(t => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`https://unispace.ng/join?ref=${user.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-green-600 to-emerald-600">
           <div className="absolute top-4 right-4">
              <button 
                onClick={() => setActiveTab(activeTab === 'VIEW' ? 'SETTINGS' : 'VIEW')}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
              >
                 <Settings size={20} />
              </button>
           </div>
        </div>
        <div className="px-8 pb-8">
           <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="relative">
                 <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-white object-cover" />
                 {user.verified && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-800" title="Verified Student">
                       <ShieldCheck size={14} />
                    </div>
                 )}
              </div>
           </div>
           
           {activeTab === 'VIEW' ? (
             <div className="space-y-4">
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                   <p className="text-slate-500 dark:text-slate-400 mb-2">{user.role} @ {user.university}</p>
                   <p className="text-slate-600 dark:text-slate-300 text-sm max-w-lg">{user.bio || "No bio yet."}</p>
                </div>

                {/* Professional Links */}
                {(user.portfolioUrl || user.businessEmail) && (
                   <div className="flex flex-wrap gap-3">
                      {user.portfolioUrl && (
                         <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors">
                            <Globe size={14} />
                            <span>Portfolio</span>
                         </a>
                      )}
                      {user.businessEmail && (
                         <a href={`mailto:${user.businessEmail}`} className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors">
                            <Mail size={14} />
                            <span>Contact</span>
                         </a>
                      )}
                   </div>
                )}

                {/* Interests Display */}
                {user.interests && user.interests.length > 0 && (
                   <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                         {user.interests.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full border border-green-100 dark:border-green-800">
                               {tag}
                            </span>
                         ))}
                      </div>
                   </div>
                )}
             </div>
           ) : (
             <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-green-500 focus:border-green-500" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Business Email</label>
                      <input type="email" value={editBusinessEmail} onChange={e => setEditBusinessEmail(e.target.value)} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-green-500 focus:border-green-500" placeholder="contact@example.com" />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                   <textarea value={editBio} onChange={e => setEditBio(e.target.value)} className="w-full mt-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-green-500 focus:border-green-500" rows={3} />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Portfolio URL</label>
                   <div className="relative mt-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="url" value={editPortfolio} onChange={e => setEditPortfolio(e.target.value)} className="w-full pl-10 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-green-500 focus:border-green-500" placeholder="https://yourwebsite.com" />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Interests</label>
                   <div className="flex flex-wrap gap-2">
                      {INTEREST_TAGS.map(tag => (
                         <button
                           key={tag}
                           onClick={() => toggleInterest(tag)}
                           className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                             selectedInterests.includes(tag)
                               ? 'bg-green-600 text-white border-green-600'
                               : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-green-400'
                           }`}
                         >
                            {tag} {selectedInterests.includes(tag) && '✓'}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="pt-4 flex space-x-3">
                   <button onClick={handleSave} className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center space-x-2">
                      <Save size={18} /> <span>Save Changes</span>
                   </button>
                   <button onClick={() => setActiveTab('VIEW')} className="px-6 py-2.5 rounded-xl font-bold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                      Cancel
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>

      {activeTab === 'VIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2 space-y-6">
              {/* Profile Views */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                       <Eye className="mr-2 text-green-500" size={20} />
                       Who Viewed My Profile
                    </h3>
                 </div>
                 <div className="space-y-4">
                    {viewers.map((viewer) => (
                       <div key={viewer.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-center space-x-3">
                             {user.isPremium ? (
                                <img src={viewer.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="Viewer" />
                             ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 blur-sm"></div>
                             )}
                             <div>
                                {user.isPremium ? (
                                   <p className="text-sm font-semibold text-slate-900 dark:text-white">{viewer.name}</p>
                                ) : (
                                   <div className="h-4 w-24 bg-slate-200 dark:bg-slate-600 rounded blur-sm mb-1"></div>
                                )}
                                <p className="text-xs text-slate-500">{new Date(viewer.viewedAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                          {!user.isPremium && <Lock size={16} className="text-slate-400" />}
                       </div>
                    ))}
                    {viewers.length === 0 && (
                       <div className="text-center text-slate-400 py-4 text-sm">No recent profile views.</div>
                    )}
                 </div>
                 {!user.isPremium && viewers.length > 0 && (
                    <div className="mt-6 bg-green-900 rounded-xl p-6 text-white text-center">
                       <h4 className="font-bold mb-2">Unlock Profile Visitors</h4>
                       <p className="text-sm text-green-100 mb-4">See exactly who is checking out your profile.</p>
                       <button onClick={onSubscribe} className="bg-white text-green-900 font-bold py-2 px-6 rounded-lg hover:bg-green-50 transition-colors">Subscribe</button>
                    </div>
                 )}
              </div>
           </div>

           <div>
              {/* Refer & Earn */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">Refer & Earn</h3>
                  <p className="text-sm text-slate-500 mb-6">Invite friends to Unispace and get featured on our homepage!</p>
                  
                  <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl mb-4">
                     <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Your Referral Link</p>
                     <div className="flex items-center space-x-2">
                        <code className="flex-1 font-mono text-sm text-slate-800 dark:text-white truncate">
                           unispace.ng/join?ref={user.referralCode}
                        </code>
                        <button onClick={copyReferral} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                           {copied ? <span className="text-xs font-bold">Copied</span> : <Copy size={16} />}
                        </button>
                     </div>
                  </div>

                  <div className="space-y-2 mb-4">
                     <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>Progress</span>
                        <span>{user.referralCount}/10</span>
                     </div>
                     <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((user.referralCount / 10) * 100, 100)}%` }}></div>
                     </div>
                  </div>
                  
                  <button className="w-full py-2 border border-green-600 text-green-600 rounded-xl font-bold hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center space-x-2">
                     <Share2 size={16} />
                     <span>Share Link</span>
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
