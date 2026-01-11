
import React, { useState } from 'react';
import { User, UserRole, SubscriptionPlan } from '../types';
import { Check, Crown, Shield, Zap, Star, BookOpen, GraduationCap, Clock } from 'lucide-react';

interface PremiumProps {
  user: User;
  onSubscribe: (plan: SubscriptionPlan, price: number) => void;
}

type PlanCategory = 'STUDY' | 'PASSES';

export const Premium: React.FC<PremiumProps> = ({ user, onSubscribe }) => {
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('STUDY');
  const isStudent = user.role === UserRole.STUDENT;

  const handleSubscribe = (plan: SubscriptionPlan, price: number) => {
    if (user.walletBalance < price) {
      alert("Insufficient funds. Please top up your UniWallet.");
      return;
    }
    const planName = plan.replace(/PLAN_|STUDY_|PASS_/g, '').replace(/_/g, ' ');
    if (confirm(`Purchase ${planName} for ₦${price.toLocaleString()}?`)) {
      onSubscribe(plan, price);
    }
  };

  const renderPlanCard = (
    title: string,
    price: number,
    planId: SubscriptionPlan,
    features: string[],
    colorClass: string,
    icon: React.ReactNode,
    isPopular: boolean = false
  ) => {
    const isCurrent = user.subscriptionPlan === planId;
    const isPass = planId.startsWith('PASS_');

    return (
      <div className={`relative flex flex-col bg-white dark:bg-slate-800 rounded-3xl p-8 border-2 transition-all hover:shadow-lg ${isCurrent ? 'border-green-500 shadow-xl scale-[1.02]' : 'border-slate-100 dark:border-slate-700 shadow-sm'} ${isPopular && !isCurrent ? 'border-green-400' : ''}`}>
        {isCurrent && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
            ACTIVE
          </div>
        )}
        {isPopular && !isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-md uppercase tracking-widest whitespace-nowrap">
            Recommended
          </div>
        )}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${colorClass}`}>{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{isPass ? '24h Access' : 'Monthly Subscription'}</p>
        <div className="flex items-baseline mb-8">
          <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">₦{price.toLocaleString()}</span>
          <span className="text-slate-400 font-bold ml-1 text-xs">/{isPass ? '24h' : 'mo'}</span>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Check size={14} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => handleSubscribe(planId, price)}
          disabled={isCurrent && !isPass}
          className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
            isCurrent && !isPass
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700' 
              : 'bg-[#07bc0c] text-white hover:bg-green-700 shadow-md active:scale-95'
          }`}
        >
          {isCurrent && !isPass ? 'Active' : 'Get Started'}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Upgrade Your Space</h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto font-bold">Unlock premium academic tools to dominate your semester.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200 dark:border-slate-800">
          <button onClick={() => setActiveCategory('STUDY')} className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeCategory === 'STUDY' ? 'bg-white dark:bg-slate-800 text-green-600 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-500'}`}><GraduationCap size={18} /><span>Study Focused</span></button>
          <button onClick={() => setActiveCategory('PASSES')} className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeCategory === 'PASSES' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700' : 'text-slate-500'}`}><Clock size={18} /><span>Power Passes</span></button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeCategory === 'STUDY' && (
          <>
            {renderPlanCard("Basic Plan", 2000, "PLAN_STUDY_BASIC", ["Unlimited AI Chat", "1 Quiz Cycle / Week", "Standard Uploads", "Campus Feed Access"], "bg-blue-50 text-blue-600", <BookOpen size={28} />)}
            {renderPlanCard("Plus Plan", 8000, "PLAN_STUDY_STANDARD", ["Unlimited AI Chat", "2 Quiz Cycles / Week", "2 Uploads / Week", "Full UniDoc Access", "Standard AI Podcasts"], "bg-green-50 text-green-600", <Shield size={28} />, true)}
            {renderPlanCard("Unlimited Plan", 15000, "PLAN_STUDY_PREMIUM", ["Unlimited Quizzes", "Unlimited AI Podcasts", "Unlimited Uploads", "Full Exam Solver", "Lifetime Access"], "bg-purple-50 text-purple-600", <Crown size={28} />)}
          </>
        )}

        {activeCategory === 'PASSES' && (
          <div className="col-span-full flex flex-col items-center">
            <div className="max-w-sm w-full">
              {renderPlanCard("One-Day Pass", 500, "PASS_24H_STUDY", ["Unlimited AI Access (24h)", "Full Exam Solver Access", "Unlimited Doc Uploads", "Full UniDoc Access", "Ideal for exam night!"], "bg-blue-50 text-blue-600", <Zap size={28} />, true)}
            </div>
          </div>
        )}
      </div>
      
      {!isStudent && (
        <div className="mt-12 text-center p-6 bg-orange-50 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-800 shadow-sm max-w-lg mx-auto">
          <p className="text-sm text-orange-800 dark:text-orange-200 font-bold uppercase tracking-widest mb-1">Guest Account</p>
          <p className="text-orange-600 dark:text-orange-400 text-xs font-bold">Subscribe to access the full Study tool ecosystem.</p>
        </div>
      )}
    </div>
  );
};
