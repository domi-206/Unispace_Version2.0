
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  { 
    q: "How does the Campus Feed school filter work?", 
    a: "At the top of the Campus Feed, you can use the dropdown filter to select specific schools like UNILAG, OAU, or ABU. This ensures you only see updates, study groups, and materials relevant to your local campus. You can switch back to 'All Universities' anytime to see the national feed." 
  },
  { 
    q: "What are the Professor and Course Rep roles?", 
    a: "The person who creates a Campus is automatically designated as the 'Professor' and has full control over the community. Professors can promote active students to 'Course Rep' status. Course Reps help manage the campus and moderate discussions." 
  },
  { 
    q: "How can I become a Course Rep?", 
    a: "To be eligible for promotion to Course Rep, a student must be active on UniSpace for at least 30 consecutive days. This ensures that only trusted and familiar members of the community take on leadership roles." 
  },
  { 
    q: "Is there a charge for building a Campus?", 
    a: "No. Building a Campus for your department, faculty, or interest group is 100% free. We believe in providing students with zero-cost infrastructure to lead and organize." 
  },
  { 
    q: "Why is my new Campus 'Pending'?", 
    a: "Every campus goes through a manual assessment process by our safety team before being released to the public. We check to ensure the group adheres to our Community Covenant (no harmful/occult content) to maintain a safe academic environment." 
  },
  { 
    q: "What is the difference between Student and Guest mode?", 
    a: "Student mode is for verified Nigerian scholars and includes the 'Road to Platinum' referral system. Guest mode is strictly for paying subscribers (non-students or merchants) who want to access our marketplace and AI tools without participating in the invite hierarchy or badge system." 
  },
  { 
    q: "How do I use the UniDoc Exam Solver?", 
    a: "Upload your PDFs to the StudyHub. Once synced, you can launch the Exam Solver to get terminology-based explanations and solve theory questions strictly using the context of your uploaded documents." 
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 mb-4">
          <HelpCircle size={32} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Knowledge Base</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Everything you need to know about the UniSpace ecosystem.</p>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className={`bg-white dark:bg-slate-800 rounded-3xl transition-all border ${openIndex === idx ? 'border-green-500 shadow-xl' : 'border-slate-200 dark:border-slate-700 shadow-sm'}`}>
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex justify-between items-center p-8 text-left focus:outline-none"
            >
              <span className="font-black text-lg text-slate-800 dark:text-white leading-tight pr-4">{item.q}</span>
              <div className={`p-2 rounded-full transition-colors ${openIndex === idx ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                {openIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            {openIndex === idx && (
              <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="h-px bg-slate-100 dark:bg-slate-700 mb-6"></div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-bold text-lg">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-slate-900 rounded-[40px] text-center text-white relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <Info size={32} className="mx-auto mb-4 text-green-400" />
         <h4 className="text-2xl font-black mb-2">Still have questions?</h4>
         <p className="text-slate-400 font-bold mb-8">Our support team is active 24/7 in the official UniSpace Support Campus.</p>
         <button className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-50 transition-all shadow-2xl">Contact Support</button>
      </div>
    </div>
  );
};
