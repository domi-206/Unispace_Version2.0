
import React, { useState, useRef, useEffect } from 'react';
import { InstitutionGroup, User, CampusRole } from '../types';
import { Users, Lock, Plus, Send, Crown, Shield, LogOut, ArrowLeft, Upload, Share2, Copy, Check, AlertCircle, CreditCard, Clock } from 'lucide-react';

interface InstitutionsProps {
  user: User;
  groups: InstitutionGroup[];
  onJoin: (id: string) => void;
  onCreate: (name: string, description: string, imageUrl: string) => void;
  onSendMessage: (groupId: string, text: string) => void;
  onManageMember: (groupId: string, memberId: string, action: 'PROMOTE' | 'DROPOUT') => void;
}

export const Institutions: React.FC<InstitutionsProps> = ({ user, groups, onJoin, onCreate, onSendMessage, onManageMember }) => {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [paymentGroup, setPaymentGroup] = useState<InstitutionGroup | null>(null); // For Guest Payment Modal
  
  // Create Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('https://picsum.photos/200/200');

  // Chat State
  const [messageText, setMessageText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const currentUserMember = activeGroup?.members.find(m => m.userId === user.id);
  const isProfessor = currentUserMember?.role === 'PROFESSOR';

  const GUEST_JOIN_FEE = 2000;
  const CREATE_CAMPUS_FEE = 5000;

  // Filter out pending groups from general view unless user is creator/member
  const visibleGroups = groups.filter(g => g.status === 'ACTIVE' || g.isJoined);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeGroup?.messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check funds for everyone (Guests and Students both pay to build)
    if (user.walletBalance < CREATE_CAMPUS_FEE) {
      alert(`Insufficient funds. You need ₦${CREATE_CAMPUS_FEE.toLocaleString()} to build a campus.`);
      return;
    }

    if (newName && newDesc) {
      // Logic handled in App.tsx will deduct the fee
      const imgUrl = newImageFile ? URL.createObjectURL(newImageFile) : previewUrl;
      onCreate(newName, newDesc, imgUrl);
      setIsCreateModalOpen(false);
      setNewName('');
      setNewDesc('');
      setNewImageFile(null);
      setPreviewUrl('https://picsum.photos/200/200');
      alert("Campus created! It is now PENDING verification.");
    }
  };

  const handleJoinClick = (group: InstitutionGroup) => {
    if (user.role === 'GUEST') {
      // Open Payment Modal for Guests
      setPaymentGroup(group);
    } else {
      // Verified students join immediately (free)
      onJoin(group.id);
    }
  };

  const confirmGuestPayment = () => {
    if (paymentGroup) {
      if (user.walletBalance < GUEST_JOIN_FEE) {
        alert("Insufficient wallet balance for this transaction.");
      } else {
        onJoin(paymentGroup.id);
        setPaymentGroup(null);
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && activeGroupId) {
      onSendMessage(activeGroupId, messageText);
      setMessageText('');
    }
  };

  const handleShare = (groupId: string) => {
    const link = `https://unispace.ng/campus/${groupId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(groupId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRoleIcon = (role: CampusRole) => {
    switch(role) {
      case 'PROFESSOR': return <Crown size={14} className="text-yellow-500 fill-yellow-500" />;
      case 'COURSE_REP': return <Shield size={14} className="text-blue-500 fill-blue-500" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: CampusRole) => {
    switch(role) {
      case 'PROFESSOR': return 'Professor';
      case 'COURSE_REP': return 'Course Rep';
      default: return 'Student';
    }
  };

  // -- RENDER: ACTIVE CAMPUS CHAT VIEW --
  if (activeGroup) {
    if (activeGroup.status === 'PENDING') {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <Clock size={48} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Campus Pending Verification</h2>
          <p className="text-slate-500 max-w-md mt-2">
            "{activeGroup.name}" is currently under review by our safety team to ensure it meets our community standards.
          </p>
          <button onClick={() => setActiveGroupId(null)} className="mt-6 text-slate-500 hover:text-slate-800 dark:hover:text-white">Back to List</button>
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <button onClick={() => setActiveGroupId(null)} className="md:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                <ArrowLeft size={20} />
              </button>
              <img src={activeGroup.imageUrl} alt={activeGroup.name} className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{activeGroup.name}</h3>
                <p className="text-xs text-slate-500">{activeGroup.members.length} Students • {activeGroup.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleShare(activeGroup.id)}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center space-x-1"
                title="Copy Campus Link"
              >
                {copiedId === activeGroup.id ? <Check size={20} /> : <Share2 size={20} />}
                <span className="text-xs font-bold hidden sm:inline">{copiedId === activeGroup.id ? 'Copied' : 'Share'}</span>
              </button>
              <button 
                onClick={() => setShowMembersPanel(!showMembersPanel)}
                className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Users size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-950/50">
            {activeGroup.messages.map((msg) => {
              if (msg.senderId === 'sys') {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                    <span className="text-xs font-medium text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isMe = msg.senderId === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && <img src={msg.senderAvatar} className="w-8 h-8 rounded-full mr-2 self-end mb-1" />}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <div className="flex items-center space-x-1 ml-1 mb-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{msg.senderName}</span>
                        {getRoleIcon(msg.role)}
                      </div>
                    )}
                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-green-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-slate-800 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 mx-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })}
            {activeGroup.messages.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p>Welcome to {activeGroup.name}!</p>
                <p className="text-sm">Be the first to say hello.</p>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex space-x-2">
            <input 
              type="text" 
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder={`Message #${activeGroup.name}...`}
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 dark:text-white"
            />
            <button type="submit" disabled={!messageText.trim()} className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Send size={20} />
            </button>
          </form>
        </div>

        {/* Member Panel (Sidebar) */}
        {showMembersPanel && (
          <div className="w-full md:w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold dark:text-white">Faculty Attendance</h3>
              <p className="text-xs text-slate-500">{activeGroup.members.length} enrolled</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {activeGroup.members.map(member => (
                <div key={member.userId} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img src={member.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                      {member.role !== 'STUDENT' && (
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                          {getRoleIcon(member.role)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold dark:text-white">{member.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{getRoleLabel(member.role)}</p>
                    </div>
                  </div>
                  
                  {/* Professor Controls */}
                  {isProfessor && member.userId !== user.id && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                      {member.role === 'STUDENT' && (
                        <button 
                          onClick={() => onManageMember(activeGroup.id, member.userId, 'PROMOTE')}
                          title="Make Class Rep"
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                        >
                          <Shield size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => onManageMember(activeGroup.id, member.userId, 'DROPOUT')}
                        title="Drop Out Student"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -- RENDER: GALLERY / LIST VIEW --
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-green-700 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
             <h2 className="text-3xl font-bold mb-2">Campus Life</h2>
             <p className="text-green-100 max-w-lg">Connect with Professors, Course Reps, and students in your department. Build your own academic community.</p>
          </div>
          <div className="hidden md:block absolute right-0 bottom-0 opacity-10 transform translate-y-4 translate-x-4">
             <Users size={180} />
          </div>
       </div>

       <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold dark:text-white">Popular Campuses</h3>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 dark:shadow-none"
          >
             <Plus size={18} />
             <span>Build Campus</span>
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleGroups.map(group => (
             <div key={group.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow flex flex-col group-card relative overflow-hidden">
                {group.status === 'PENDING' && (
                  <div className="absolute top-0 left-0 right-0 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300 text-xs font-bold text-center py-1">
                    PENDING VERIFICATION
                  </div>
                )}
                <div className="flex justify-between items-start mb-4 mt-2">
                   <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex space-x-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(group.id); }}
                        className="text-slate-400 hover:text-green-600 transition-colors p-1"
                        title="Copy Link"
                      >
                        {copiedId === group.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      {group.isPrivate && <Lock size={16} className="text-slate-400 mt-1" />}
                   </div>
                </div>
                <h4 className="font-bold text-lg mb-1 dark:text-white">{group.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">{group.description}</p>
                <div className="flex items-center justify-between mt-auto">
                   <span className="text-xs font-semibold text-slate-400">{group.members.length} Students</span>
                   
                   {group.isJoined ? (
                     <button 
                       onClick={() => setActiveGroupId(group.id)}
                       className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
                     >
                       <span>Enter Campus</span>
                       <ArrowLeft className="rotate-180" size={16} />
                     </button>
                   ) : (
                     <button 
                       onClick={() => handleJoinClick(group)}
                       disabled={group.status === 'PENDING'}
                       className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                         group.status === 'PENDING'
                           ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                           : user.role === 'GUEST' 
                             ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                             : 'bg-green-600 text-white hover:bg-green-700'
                       }`}
                     >
                       {user.role === 'GUEST' ? `Join (₦${GUEST_JOIN_FEE.toLocaleString()})` : 'Join (Free)'}
                     </button>
                   )}
                </div>
             </div>
          ))}
       </div>

       {/* Guest Payment Modal */}
       {paymentGroup && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
               <div className="bg-green-600 p-6 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CreditCard size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Campus Access Fee</h3>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="text-center">
                     <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">You are about to join:</p>
                     <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{paymentGroup.name}</h4>
                     
                     <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-100 dark:border-slate-600">
                        <div className="flex justify-between items-center text-sm mb-2">
                           <span className="text-slate-500 dark:text-slate-400">Entry Fee:</span>
                           <span className="font-bold text-slate-800 dark:text-white">₦{GUEST_JOIN_FEE.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-600 pt-2">
                           <span className="text-slate-500 dark:text-slate-400">Your Wallet:</span>
                           <span className={`font-bold ${user.walletBalance >= GUEST_JOIN_FEE ? 'text-green-600' : 'text-red-500'}`}>
                              ₦{user.walletBalance.toLocaleString()}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <button 
                       onClick={confirmGuestPayment}
                       className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none transition-colors"
                     >
                        Pay & Join
                     </button>
                     <button 
                       onClick={() => setPaymentGroup(null)}
                       className="w-full py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         </div>
       )}

       {/* Create Modal */}
       {isCreateModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="bg-green-600 p-6 text-white">
                  <h3 className="text-xl font-bold">Build a New Campus</h3>
                  <p className="text-green-100 text-sm">Become a Professor and lead your community.</p>
               </div>
               
               <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 border-b border-yellow-100 dark:border-yellow-800">
                  <div className="flex items-start space-x-3 mb-2">
                     <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                     <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        A fee of <strong>₦{CREATE_CAMPUS_FEE.toLocaleString()}</strong> will be deducted. Your campus will be <strong>Pending Verification</strong> before going live.
                     </p>
                  </div>
                  <div className="flex justify-between text-xs border-t border-yellow-200 dark:border-yellow-800 pt-2 mt-2">
                     <span className="text-yellow-800 dark:text-yellow-200">Your Balance:</span>
                     <span className={`font-bold ${user.walletBalance < CREATE_CAMPUS_FEE ? "text-red-500" : "text-green-700 dark:text-green-400"}`}>
                        ₦{user.walletBalance.toLocaleString()}
                     </span>
                  </div>
               </div>

               <form onSubmit={handleCreate} className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Campus Name</label>
                     <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Computer Science 300L" className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                     <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this group for? No harmful/occult content." className="w-full mt-1 p-2 rounded-lg border border-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={3} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cover Image</label>
                     <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                           <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <label className="flex-1 cursor-pointer">
                           <span className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                              <Upload size={16} className="inline mr-2" />
                              Upload Image
                           </span>
                           <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                        </label>
                     </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                     <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                     <button 
                       type="submit" 
                       className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md flex justify-center items-center space-x-2"
                     >
                       <span>Pay & Build</span>
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};
