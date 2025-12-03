import React, { useState } from 'react';
import { FeedPost, User, UserRole } from '../types';
import { MessageSquare, Heart, Share2, PenSquare, Trophy } from 'lucide-react';

interface CampusFeedProps {
  posts: FeedPost[];
  user: User;
  onPostCreate: (content: string) => void;
}

export const CampusFeed: React.FC<CampusFeedProps> = ({ posts, user, onPostCreate }) => {
  const [newPostContent, setNewPostContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      onPostCreate(newPostContent);
      setNewPostContent('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Widget */}
      {user.role === UserRole.STUDENT && user.verified && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your thoughts with the campus..."
                  className="w-full bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none border border-transparent focus:bg-white transition-all"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-slate-400">Posts are visible to everyone</div>
                  <button 
                    type="submit" 
                    disabled={!newPostContent.trim()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    <PenSquare size={16} />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 flex items-start space-x-3">
              <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{post.authorName}</span>
                  {post.authorRole === UserRole.STUDENT && (
                    <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">STUDENT</span>
                  )}
                  <span className="text-slate-400 text-xs">• {new Date(post.postedAt).toLocaleDateString()}</span>
                </div>
                
                <p className="text-slate-800 text-sm mt-2 whitespace-pre-line">{post.content}</p>

                {/* Attachments - e.g. Quiz Result */}
                {post.isQuizResult && (
                   <div className="mt-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                         <Trophy className="text-yellow-500" size={24} />
                      </div>
                      <div>
                         <p className="text-indigo-900 font-bold text-sm">Ace'd a StudyHub Quiz!</p>
                         <p className="text-indigo-600 text-xs">Score: {post.quizScore}%</p>
                      </div>
                   </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-slate-500">
               <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                  <Heart size={18} />
                  <span className="text-xs font-medium">{post.likes}</span>
               </button>
               <button className="flex items-center space-x-2 hover:text-indigo-600 transition-colors">
                  <MessageSquare size={18} />
                  <span className="text-xs font-medium">{post.comments}</span>
               </button>
               <button className="flex items-center space-x-2 hover:text-indigo-600 transition-colors">
                  <Share2 size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
