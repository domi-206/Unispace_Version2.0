
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_ITEMS = [
  { q: "How do I verify my student status?", a: "To verify, go to your Profile or Sign Up as a Student and upload a valid University ID card or Admission Letter. Verification typically takes 24 hours." },
  { q: "Is Unispace free to use?", a: "Unispace offers a 7-day free trial for the Marketplace and StudyHub. After that, you can subscribe to continue enjoying premium features." },
  { q: "How does the Refer & Earn work?", a: "Share your unique referral code with friends. Once they sign up and verify, it counts towards your referral score. Refer 10 people to be featured on our Hall of Fame!" },
  { q: "Can I sell items as a Guest?", a: "Guests can view items but cannot list products. You must be a verified student to sell on UniMarket to ensure safety and trust." },
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
