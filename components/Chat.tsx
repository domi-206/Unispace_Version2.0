import React, { useState } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { Send, UserCircle, Image as ImageIcon, MessageSquare } from 'lucide-react';

interface ChatProps {
  sessions: ChatSession[];
  currentUserId: string;
  onSendMessage: (sessionId: string, text: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ sessions, currentUserId, onSendMessage }) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessions.length > 0 ? sessions[0].id : null);
  const [newMessage, setNewMessage] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeSessionId) {
      onSendMessage(activeSessionId, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
           <h3 className="font-bold text-lg dark:text-white">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
           {sessions.map(session => (
             <button
               key={session.id}
               onClick={() => setActiveSessionId(session.id)}
               className={`w-full p-4 flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 ${activeSessionId === session.id ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
             >
               <img src={session.participantAvatar} alt={session.participantName} className="w-12 h-12 rounded-full object-cover" />
               <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                     <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{session.participantName}</span>
                     <span className="text-xs text-slate-400">{new Date(session.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate dark:text-slate-400">{session.lastMessage}</p>
               </div>
               {session.unreadCount > 0 && (
                 <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{session.unreadCount}</span>
               )}
             </button>
           ))}
           {sessions.length === 0 && (
             <div className="p-8 text-center text-slate-400">No active conversations. Start chatting from the Marketplace!</div>
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
        {activeSession ? (
          <>
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-3">
               <img src={activeSession.participantAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
               <div>
                  <h4 className="font-bold dark:text-white">{activeSession.participantName}</h4>
                  <p className="text-xs text-green-600">Online</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {activeSession.messages.map(msg => {
                 const isMe = msg.senderId === currentUserId;
                 return (
                   <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                       isMe 
                         ? 'bg-green-600 text-white rounded-br-none' 
                         : 'bg-white dark:bg-slate-700 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-600'
                     }`}>
                        {msg.productTitle && (
                          <div className="mb-2 pb-2 border-b border-white/20 flex items-center space-x-2">
                             {msg.productImage && <img src={msg.productImage} className="w-8 h-8 rounded bg-white object-cover" />}
                             <span className="text-xs font-bold opacity-90">Re: {msg.productTitle}</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-100' : 'text-slate-400'}`}>
                           {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                     </div>
                   </div>
                 );
               })}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center space-x-2">
               <input 
                 type="text" 
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 placeholder="Type a message..."
                 className="flex-1 bg-slate-100 dark:bg-slate-700 border-0 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-green-500 dark:text-white"
               />
               <button type="submit" className="p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                  <Send size={20} />
               </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
             <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                <p>Select a conversation to start chatting</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};