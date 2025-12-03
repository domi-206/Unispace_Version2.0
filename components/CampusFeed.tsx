
import React, { useState, useRef } from 'react';
import { FeedPost, User, UserRole } from '../types';
import { MessageSquare, Heart, Share2, PenSquare, Trophy, Image as ImageIcon, X, Send } from 'lucide-react';

interface CampusFeedProps {
  posts: FeedPost[];
  user: User;
  onPostCreate: (content: string, image?: File) => void;
}

export const CampusFeed: React.FC<CampusFeedProps> = ({ posts, user, onPostCreate }) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Interaction States
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim() || selectedImage) {
      onPostCreate(newPostContent, selectedImage || undefined);
      setNewPostContent('');
      clearImage();
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(postId)) {
        newLikes.delete(postId);
      } else {
        newLikes.add(postId);
      }
      return newLikes;
    });
  };

  const toggleComment = (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
      setCommentText('');
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      // In a real app, this would send to backend.
      // Here we just clear the input to simulate success.
      alert("Comment posted!");
      setCommentText('');
      setActiveCommentPostId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Widget */}
      {user.role === UserRole.STUDENT && user.verified && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your thoughts with the campus..."
                  className="w-full bg-slate-900 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none border border-transparent text-white placeholder:text-slate-400"
                  rows={3}
                />
                
                {previewUrl && (
                  <div className="relative mt-2 inline-block">
                    <img src={previewUrl} alt="Preview" className="h-32 w-auto rounded-lg border border-slate-200 dark:border-slate-600" />
                    <button 
                      type="button" 
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center space-x-2">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                      title="Upload Image"
                    >
                      <ImageIcon size={20} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                    <div className="text-xs text-slate-400 hidden sm:block">Posts are visible to everyone</div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={!newPostContent.trim() && !selectedImage}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2 shadow-lg shadow-green-200 dark:shadow-none"
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
        {posts.map((post) => {
          const isLiked = likedPosts.has(post.id);
          const isCommenting = activeCommentPostId === post.id;

          return (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 flex items-start space-x-3">
                <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{post.authorName}</span>
                    {post.authorRole === UserRole.STUDENT && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">STUDENT</span>
                    )}
                    <span className="text-slate-400 text-xs">• {new Date(post.postedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {post.content && <p className="text-slate-800 dark:text-slate-200 text-sm mt-2 whitespace-pre-line">{post.content}</p>}
                  
                  {post.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                      <img src={post.imageUrl} alt="Post content" className="w-full max-h-96 object-cover" />
                    </div>
                  )}

                  {/* Attachments - e.g. Quiz Result */}
                  {post.isQuizResult && (
                     <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800 flex items-center space-x-4">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                           <Trophy className="text-yellow-500" size={24} />
                        </div>
                        <div>
                           <p className="text-green-900 dark:text-green-300 font-bold text-sm">Ace'd a StudyHub Quiz!</p>
                           <p className="text-green-600 dark:text-green-400 text-xs">Score: {post.quizScore}%</p>
                        </div>
                     </div>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-slate-500 dark:text-slate-400">
                 <button 
                   onClick={() => toggleLike(post.id)}
                   className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                 >
                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    <span className="text-xs font-medium">{post.likes + (isLiked ? 1 : 0)}</span>
                 </button>
                 <button 
                   onClick={() => toggleComment(post.id)}
                   className={`flex items-center space-x-2 transition-colors ${isCommenting ? 'text-green-600' : 'hover:text-green-600'}`}
                 >
                    <MessageSquare size={18} />
                    <span className="text-xs font-medium">{post.comments}</span>
                 </button>
                 <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                    <Share2 size={18} />
                 </button>
              </div>

              {/* Comment Input Section */}
              {isCommenting && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                  <form onSubmit={submitComment} className="flex space-x-2">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..." 
                      className="flex-1 px-4 py-2 text-sm rounded-full border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-slate-400"
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      disabled={!commentText.trim()}
                      className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
