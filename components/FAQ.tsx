
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_ITEMS = [
  { q: "How do I verify my student status?", a: "To verify, go to your Profile or Sign Up as a Student and upload a valid University ID card or Admission Letter. Verification typically takes 24 hours." },
  { q: "What are the subscription options?", a: "We offer two main categories: 'Study Only' plans for access to AI tools and quizzes, and 'Study + Sell' (Merchant) plans which add Marketplace selling privileges. Both have Basic, Standard, and Premium tiers." },
  { q: "Can I sell items as a Guest?", a: "Yes, Guests can sell items by subscribing to any 'Merchant' plan. However, please note that subscription rates for Guests are higher than for verified students." },
  { q: "Can Guests post on the Campus Feed?", a: "Absolutely! Guests are now welcome to share updates, ask questions, and interact with the community on the Campus Feed." },
  { q: "How does the Refer & Earn work?", a: "Share your unique referral code with friends. Once they sign up and verify, it counts towards your referral score. Refer 10 people to be featured on our Hall of Fame!" },
  { q: "How do I create an Institution Group?", a: "Go to the Institutions tab and click 'Create Group'. You can create groups for your department, club, or study circle." }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
            >
              <span className="font-bold text-lg text-slate-800 dark:text-white">{item.q}</span>
              {openIndex === idx ? <ChevronUp className="text-green-600" /> : <ChevronDown className="text-slate-400" />}
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
