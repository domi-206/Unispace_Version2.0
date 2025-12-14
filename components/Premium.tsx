
import React, { useState } from 'react';
import { User, UserRole, SubscriptionPlan } from '../types';
import { Check, Crown, Shield, Zap, Star, BookOpen, ShoppingBag, GraduationCap } from 'lucide-react';

interface PremiumProps {
  user: User;
  onSubscribe: (plan: SubscriptionPlan, price: number) => void;
}

type PlanCategory = 'STUDY' | 'MERCHANT';

export const Premium: React.FC<PremiumProps> = ({ user, onSubscribe }) => {
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('STUDY');
  const isStudent = user.role === UserRole.STUDENT;

  // Pricing Multiplier: Guests pay 2x
  const priceMultiplier = isStudent ? 1 : 2;

  const handleSubscribe = (plan: SubscriptionPlan, price: number) => {
    if (user.walletBalance < price) {
      alert("Insufficient funds. Please top up your wallet.");
      return;
    }
    const planName = plan.replace(/PLAN_|STUDY_|MERCHANT_/g, '').replace(/_/g, ' ');
    if (confirm(`Subscribe to ${planName} Plan for ₦${price.toLocaleString()}?`)) {
      onSubscribe(plan, price);
    }
  };

  const renderPlanCard = (
    title: string,
    basePrice: number,
    planId: SubscriptionPlan,
    features: string[],
    colorClass: string,
    icon: React.ReactNode,
    isPopular: boolean = false
  ) => {
    const price = basePrice * priceMultiplier;
    const isCurrent = user.subscriptionPlan === planId;

    return (
      <div className={`relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 transition-transform hover:scale-[1.02] ${isCurrent ? 'border-green-500 shadow-xl' : 'border-slate-100 dark:border-slate-700 shadow-sm'} ${isPopular ? 'border-green-500 ring-4 ring-green-500/10' : ''}`}>
        {isCurrent && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
            CURRENT
          </div>
        )}
        {isPopular && !isCurrent && (
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
            BEST VALUE
          </div>
        )}
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${colorClass}`}>
          {icon}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 mb-4">{activeCategory === 'STUDY' ? 'For Academic Focus' : 'For Business & Study'}</p>
        
        <div className="flex items-baseline mb-6">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">₦{price.toLocaleString()}</span>
          <span className="text-slate-500 text-sm ml-1">/month</span>
        </div>
        
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
              <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleSubscribe(planId, price)}
          disabled={isCurrent}
          className={`w-full py-3 rounded-xl font-bold transition-colors ${
            isCurrent 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700' 
              : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none'
          }`}
        >
          {isCurrent ? 'Active Plan' : 'Choose Plan'}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Upgrade Your Unispace Experience
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          {isStudent 
            ? "Tailored plans for scholars and campus entrepreneurs." 
            : "Explore campus life with our exclusive guest access plans."}
        </p>
      </div>

      {/* Category Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center shadow-inner">
          <button 
            onClick={() => setActiveCategory('STUDY')}
            className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
              activeCategory === 'STUDY' 
                ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <GraduationCap size={18} />
            <span>Study Only</span>
          </button>
          <button 
            onClick={() => setActiveCategory('MERCHANT')}
            className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
              activeCategory === 'MERCHANT' 
                ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Study + Sell</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {activeCategory === 'STUDY' && (
          <>
            {renderPlanCard(
              "Study Basic",
              1000,
              "PLAN_STUDY_BASIC",
              [
                "1 Document Upload / Week",
                "3 Quiz Sessions / Week",
                "Access to Community Feed",
                "No Marketplace Selling",
                "Basic Support"
              ],
              "bg-blue-100 text-blue-600",
              <BookOpen size={24} />
            )}
            {renderPlanCard(
              "Study Standard",
              2500,
              "PLAN_STUDY_STANDARD",
              [
                "5 Document Uploads / Week",
                "15 Quiz Sessions / Week",
                "AI Text Summary",
                "No Marketplace Selling",
                "Priority Support"
              ],
              "bg-green-100 text-green-600",
              <Shield size={24} />,
              true
            )}
            {renderPlanCard(
              "Study Premium",
              5000,
              "PLAN_STUDY_PREMIUM",
              [
                "Unlimited Uploads",
                "Unlimited Quizzes",
                "Full AI Engine Access",
                "Exam Solver & Flashcards",
                "24/7 Support"
              ],
              "bg-purple-100 text-purple-600",
              <Crown size={24} />
            )}
          </>
        )}

        {activeCategory === 'MERCHANT' && (
          <>
            {renderPlanCard(
              "Merchant Starter",
              3000,
              "PLAN_MERCHANT_BASIC",
              [
                "Everything in Study Basic",
                "Post 3 Items / Week",
                "Basic Seller Badge",
                "Direct Messaging",
                "Standard Visibility"
              ],
              "bg-orange-100 text-orange-600",
              <ShoppingBag size={24} />
            )}
            {renderPlanCard(
              "Merchant Pro",
              7000,
              "PLAN_MERCHANT_STANDARD",
              [
                "Everything in Study Standard",
                "Post 15 Items / Week",
                "Verified Seller Badge",
                "Boosted Listings (2x)",
                "Analytics Dashboard"
              ],
              "bg-red-100 text-red-600",
              <Zap size={24} />,
              true
            )}
            {renderPlanCard(
              "Business Tycoon",
              15000,
              "PLAN_MERCHANT_PREMIUM",
              [
                "Everything in Study Premium",
                "Unlimited Item Posting",
                "Top Seller Verification",
                "Homepage Feature Spot",
                "0% Commission Fees"
              ],
              "bg-indigo-100 text-indigo-600",
              <Star size={24} />
            )}
          </>
        )}
      </div>
      
      {!isStudent && (
        <div className="mt-8 text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Guest Notice:</strong> Prices are higher for non-students to maintain the integrity of our academic ecosystem. 
            Verify your student status to unlock standard rates.
          </p>
        </div>
      )}
    </div>
  );
};
