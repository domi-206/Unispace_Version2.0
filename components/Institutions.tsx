
import React from 'react';
import { InstitutionGroup } from '../types';
import { Users, Lock, Plus, Check } from 'lucide-react';

interface InstitutionsProps {
  groups: InstitutionGroup[];
  onJoin: (id: string) => void;
  onCreate: (name: string) => void;
}

export const Institutions: React.FC<InstitutionsProps> = ({ groups, onJoin, onCreate }) => {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-green-700 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
             <h2 className="text-3xl font-bold mb-2">Campus Life</h2>
             <p className="text-green-100 max-w-lg">Connect with students from your department, faculty, or interest groups. Share resources and collaborate.</p>
          </div>
          <div className="hidden md:block absolute right-0 bottom-0 opacity-10 transform translate-y-4 translate-x-4">
             <Users size={180} />
          </div>
       </div>

       <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold dark:text-white">Popular Campuses</h3>
          <button onClick={() => onCreate("New Campus")} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors">
             <Plus size={18} />
             <span>Build Campus</span>
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
             <div key={group.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                   </div>
                   {group.isPrivate && <Lock size={16} className="text-slate-400" />}
                </div>
                <h4 className="font-bold text-lg mb-1 dark:text-white">{group.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 line-clamp-2">{group.description}</p>
                <div className="flex items-center justify-between mt-auto">
                   <span className="text-xs font-semibold text-slate-400">{group.memberCount} Students</span>
                   <button 
                     onClick={() => !group.isJoined && onJoin(group.id)}
                     disabled={group.isJoined}
                     className={`text-sm font-bold flex items-center space-x-1 ${
                       group.isJoined 
                         ? 'text-slate-400 cursor-default'
                         : 'text-green-600 hover:text-green-700 dark:text-green-400 hover:underline'
                     }`}
                   >
                      {group.isJoined ? (
                        <><span>Joined</span> <Check size={14} /></>
                      ) : (
                        'Join Campus'
                      )}
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};
