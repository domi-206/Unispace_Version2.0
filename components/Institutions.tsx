
import React, { useState, useRef, useEffect } from 'react';
import { InstitutionGroup, User, CampusRole, UserRole, CampusMember } from '../types';
import { Users, Lock, Plus, Send, Crown, Shield, LogOut, ArrowLeft, Upload, Share2, Copy, Check, AlertCircle, Clock, X, Globe, Briefcase, Building, ExternalLink, MapPin, Hash, UserCircle } from 'lucide-react';

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
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<CampusMember | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
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

  const visibleGroups = groups.filter(g => g.status === 'ACTIVE' || g.isJoined);

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
    if (newName && newDesc) {
      const imgUrl = newImageFile ? URL.createObjectURL(newImageFile) : previewUrl;
      onCreate(newName, newDesc, imgUrl);
      setIsCreateModalOpen(false);
      setNewName('');
      setNewDesc('');
      setNewImageFile(null);
      setPreviewUrl('https://picsum.photos/200/200');
      alert("Campus created! It is now PENDING verification. Our team will release it shortly.");
    }
  };

  const handleJoinClick = (group: InstitutionGroup) => {
    onJoin(group.id);
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

  const canBeCourseRep = (joinedAt: string) => {
    const joinedDate = new Date(joinedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinedDate <= thirtyDaysAgo;
  };

  // -- RENDER: ACTIVE CAMPUS CHAT VIEW --
  if (activeGroup) {
    if (activeGroup.status === 'PENDING') {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="bg-orange-100 p-6 rounded-full mb-6">
            <Clock size={48} className="text-orange-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">Campus Pending Release</h2>
          <p className="text-slate-500 max-w-md mt-2 font-bold leading-relaxed">
            "{activeGroup.name}" has been submitted. Our team manually assesses every campus before public release.
          </p>
          <button onClick={() => setActiveGroupId(null)} className="mt-8 px-8 py-3 bg-slate-100 rounded-2xl text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Back to List</button>
        </div>
      );
    }

    return (
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-500">
        <MemberProfileModal />
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-4">
              <button onClick={() => setActiveGroupId(null)} className="md:hidden p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all">
                <ArrowLeft size={20} />
              </button>
              <img src={activeGroup.imageUrl} alt={activeGroup.name} className="w-12 h-12 rounded-2xl object-cover shadow-md" />
              <div>
                <h3 className="font-black text-slate-800 dark:text-white truncate max-w-[180px] text-lg leading-tight">{activeGroup.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{activeGroup.members.length} Enrolled</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleShare(activeGroup.id)}
                className="p-3 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-2xl transition-all flex items-center space-x-2"
              >
                {copiedId === activeGroup.id ? <Check size={20} /> : <Share2 size={20} />}
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Invite</span>
              </button>
              <button 
                onClick={() => setShowMembersPanel(!showMembersPanel)}
                className={`p-3 rounded-2xl transition-all ${showMembersPanel ? 'bg-[#07bc0c] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                <Users size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100 dark:bg-slate-950/30">
            {activeGroup.messages.map((msg) => {
              if (msg.senderId === 'sys') {
                return (
                  <div key={msg.id} className="flex justify-center my-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isMe = msg.senderId === user.id;
              const senderMember = activeGroup.members.find(m => m.userId === msg.senderId);

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <button onClick={() => senderMember && setSelectedMemberProfile(senderMember)} className="self-end mb-1">
                      <img src={msg.senderAvatar} className="w-10 h-10 rounded-2xl mr-3 shadow-sm object-cover hover:scale-105 transition-transform" />
                    </button>
                  )}
                  <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <div className="flex items-center space-x-2 ml-1 mb-1.5">
                        <button onClick={() => senderMember && setSelectedMemberProfile(senderMember)} className="text-xs font-black text-slate-700 dark:text-slate-300 hover:text-[#07bc0c] transition-colors">{msg.senderName}</button>
                        {getRoleIcon(msg.role || 'STUDENT')}
                      </div>
                    )}
                    <div className={`px-6 py-3 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-[#07bc0c] text-white rounded-br-none shadow-[#07bc0c]/10' 
                        : 'bg-white dark:bg-slate-800 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 mt-2 mx-1 tracking-widest">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex space-x-3">
            <input 
              type="text" 
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder={`Message to ${activeGroup.name}...`}
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-green-500/10 dark:text-white font-bold"
            />
            <button type="submit" disabled={!messageText.trim()} className="bg-[#07bc0c] text-white p-4 rounded-2xl hover:bg-green-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl active:scale-95">
              <Send size={24} />
            </button>
          </form>
        </div>

        {/* Member Panel (Sidebar) */}
        {showMembersPanel && (
          <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-black dark:text-white text-lg tracking-tight">Active Faculty</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{activeGroup.members.length} Enrolled</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeGroup.members.map(member => (
                <div key={member.userId} onClick={() => setSelectedMemberProfile(member)} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[20px] group cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img src={member.avatarUrl} className="w-12 h-12 rounded-[18px] object-cover shadow-sm group-hover:scale-105 transition-transform" />
                      {member.role !== 'STUDENT' && (
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md border-2 border-slate-50 dark:border-slate-900">
                          {getRoleIcon(member.role)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{member.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{getRoleLabel(member.role)}</p>
                    </div>
                  </div>
                  
                  {isProfessor && member.userId !== user.id && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 transition-all">
                      {member.role === 'STUDENT' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canBeCourseRep(member.joinedAt)) {
                              onManageMember(activeGroup.id, member.userId, 'PROMOTE');
                            } else {
                              alert("Candidate must be active on Unispace for at least 30 days.");
                            }
                          }}
                          className={`p-2 rounded-xl transition-all ${canBeCourseRep(member.joinedAt) ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' : 'text-slate-300 cursor-not-allowed'}`}
                        >
                          <Shield size={18} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onManageMember(activeGroup.id, member.userId, 'DROPOUT'); }}
                        className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                      >
                        <LogOut size={18} />
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

  // Member Profile Modal
  function MemberProfileModal() {
    if (!selectedMemberProfile) return null;
    const seniority = Math.floor((Date.now() - new Date(selectedMemberProfile.joinedAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-[56px] shadow-4xl w-full max-w-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in duration-300">
          <div className="h-40 bg-gradient-to-r from-green-500 to-emerald-600 relative">
            <button onClick={() => setSelectedMemberProfile(null)} className="absolute top-6 right-6 bg-white/20 backdrop-blur p-2.5 rounded-full hover:bg-white/30 text-white transition-all"><X size={24}/></button>
          </div>
          <div className="px-12 pb-12">
             <div className="relative flex flex-col items-center -mt-20 mb-8">
                <img src={selectedMemberProfile.avatarUrl} className="w-40 h-40 rounded-full border-[8px] border-white dark:border-slate-800 shadow-4xl bg-white object-cover" />
                <div className="mt-6 text-center">
                   <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedMemberProfile.name}</h4>
                   <div className="flex flex-col items-center mt-3">
                      <p className="text-[#07bc0c] font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        {getRoleIcon(selectedMemberProfile.role)}
                        {getRoleLabel(selectedMemberProfile.role)}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 flex items-center gap-2">
                        <Briefcase size={16} className="text-slate-400"/> {selectedMemberProfile.profession || 'Verified Scholar'}
                      </p>
                      {selectedMemberProfile.workPlace && (
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
                          <Building size={16}/> {selectedMemberProfile.workPlace}
                        </p>
                      )}
                   </div>
                </div>
             </div>
             
             <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Since</p>
                      <p className="text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tight">{seniority} Days</p>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Trust Level</p>
                      <p className="text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tight">Verified</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">About</span>
                      <p className="text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                        "{selectedMemberProfile.bio || 'Exploring the digital academic ecosystem on Unispace.'}"
                      </p>
                   </div>
                   {selectedMemberProfile.websiteUrl && (
                      <a href={selectedMemberProfile.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-[24px] text-[#07bc0c] hover:underline font-black text-xs uppercase tracking-widest shadow-sm border border-slate-100 dark:border-slate-700 transition-all active:scale-95">
                         <Globe size={18} />
                         <span className="truncate flex-1">{selectedMemberProfile.websiteUrl.replace(/^https?:\/\//, '')}</span>
                         <ExternalLink size={14} />
                      </a>
                   )}
                </div>
                
                <button onClick={() => setSelectedMemberProfile(null)} className="w-full py-6 bg-slate-900 dark:bg-black text-white rounded-[32px] font-black uppercase tracking-widest text-xs shadow-4xl active:scale-95 transition-all mt-4">Close Portfolio</button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // -- RENDER: GALLERY / LIST VIEW --
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
       <MemberProfileModal />

       <div className="flex justify-between items-center bg-[#055a08] text-white p-16 rounded-[64px] shadow-3xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
             <h2 className="text-6xl font-black tracking-tighter leading-[0.9]">Faculties & <br/><span className="text-green-400">Communities.</span></h2>
             <p className="text-green-100 max-w-xl text-xl font-bold opacity-80 leading-relaxed">Join specialized faculty networks to access departmental resources, find study partners, and moderate peer growth.</p>
          </div>
          <div className="hidden md:block absolute right-0 bottom-0 opacity-10 transform translate-y-16 translate-x-16">
             <Users size={360} />
          </div>
       </div>

       <div className="flex justify-between items-center px-4">
          <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Scholarly Circles</h3>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-3 bg-[#07bc0c] text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-4xl shadow-green-100"
          >
             <Plus size={20} />
             <span>Initialize Circle</span>
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
          {visibleGroups.map(group => (
             <div key={group.id} className="bg-white dark:bg-slate-800 rounded-[56px] border border-slate-100 dark:border-slate-700 p-10 hover:shadow-4xl transition-all flex flex-col group relative overflow-hidden hover:-translate-y-2">
                {group.status === 'PENDING' && (
                  <div className="absolute top-0 left-0 right-0 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300 text-[10px] font-black tracking-[0.4em] text-center py-2.5 uppercase">
                    Verification Protocol
                  </div>
                )}
                <div className="flex justify-between items-start mb-10 mt-2">
                   <div className="w-20 h-20 rounded-[32px] bg-slate-100 dark:bg-slate-700 overflow-hidden shadow-xl border-4 border-white dark:border-slate-800">
                      <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   <div className="flex space-x-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(group.id); }}
                        className="text-slate-400 hover:text-green-600 transition-all p-3 bg-slate-50 dark:bg-slate-700 rounded-[20px]"
                      >
                        {copiedId === group.id ? <Check size={20} /> : <Share2 size={20} />}
                      </button>
                   </div>
                </div>
                <h4 className="font-black text-3xl mb-3 dark:text-white tracking-tighter leading-tight">{group.name}</h4>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-10 h-12 line-clamp-2 leading-relaxed">{group.description}</p>
                <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50 dark:border-slate-700">
                   <div className="flex -space-x-4">
                      {group.members.slice(0, 4).map((m, i) => (
                         <img key={i} src={m.avatarUrl} className="w-10 h-10 rounded-full border-[3px] border-white dark:border-slate-800 object-cover shadow-sm" />
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-10 h-10 rounded-full border-[3px] border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400">+{group.members.length - 4}</div>
                      )}
                   </div>
                   
                   {group.isJoined ? (
                     <button 
                       onClick={() => setActiveGroupId(group.id)}
                       className="px-8 py-4 bg-slate-900 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center space-x-3 shadow-2xl"
                     >
                       <span>Explore</span>
                       <ArrowLeft className="rotate-180" size={16} />
                     </button>
                   ) : (
                     <button 
                       onClick={() => handleJoinClick(group)}
                       disabled={group.status === 'PENDING'}
                       className={`px-10 py-4 text-xs font-black uppercase tracking-widest rounded-[24px] transition-all bg-[#07bc0c] text-white hover:bg-green-700 shadow-4xl shadow-green-100 ${group.status === 'PENDING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       Enroll
                     </button>
                   )}
                </div>
             </div>
          ))}
       </div>

       {/* Create Circle Modal */}
       {isCreateModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-[64px] shadow-4xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-12 duration-500">
               <div className="bg-[#055a08] p-16 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>
                  <div className="w-28 h-28 bg-white/20 rounded-[40px] flex items-center justify-center mx-auto mb-8 backdrop-blur-2xl relative z-10 border border-white/20">
                     <Plus size={56} />
                  </div>
                  <h3 className="text-5xl font-black tracking-tighter relative z-10">Circle Initialization</h3>
                  <p className="text-green-100 text-xl font-bold opacity-80 relative z-10 mt-4">Elevate your faculty with a specialized scholarly network.</p>
               </div>
               
               <div className="bg-blue-50 dark:bg-blue-900/20 p-10 border-b border-blue-100 dark:border-blue-800">
                  <div className="flex items-start space-x-6">
                     <div className="p-4 bg-white dark:bg-slate-800 rounded-[24px] shadow-xl text-blue-600 flex-shrink-0">
                        <AlertCircle size={32} />
                     </div>
                     <p className="text-sm text-blue-800 dark:text-blue-200 font-bold leading-relaxed">
                        Circle infrastructure is provided at zero cost. Unispace moderation manually reviews all circles for academic integrity and safety before final distillation into the global network.
                     </p>
                  </div>
               </div>

               <form onSubmit={handleCreate} className="p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Designation</label>
                       <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Mechanical 400L" className="w-full p-6 rounded-[28px] border-2 border-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-bold outline-none focus:border-[#07bc0c] transition-all text-lg shadow-sm" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Cover Visualization</label>
                       <div className="flex gap-6 items-center">
                          <div className="w-16 h-16 rounded-[24px] bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 shadow-inner">
                             <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <label className="flex-1 cursor-pointer">
                             <span className="inline-block px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-center w-full shadow-sm">
                                <Upload size={16} className="inline mr-2" />
                                Image Source
                             </span>
                             <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                          </label>
                       </div>
                    </div>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">Manifesto & Objectives</label>
                     <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Define the scholarly purpose of this circle..." className="w-full p-8 rounded-[40px] border-2 border-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-bold outline-none focus:border-[#07bc0c] transition-all text-lg resize-none min-h-[140px] shadow-sm" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 pt-4">
                     <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-7 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-100 rounded-[28px] transition-all">Abort Process</button>
                     <button 
                       type="submit" 
                       className="flex-[2] py-7 bg-[#07bc0c] text-white font-black uppercase tracking-widest text-xs rounded-[28px] hover:bg-green-700 shadow-4xl active:scale-[0.98] transition-all"
                     >
                       Initialize Scholarly Node
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};
