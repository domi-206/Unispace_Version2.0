
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-green-600 mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms and Conditions</h1>
        <p className="text-slate-500 mb-8">Last updated: October 2025</p>

        <div className="prose prose-green max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using Unispace, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Student Verification</h2>
            <p>To access student-only features, users must provide valid proof of studentship. Falsifying documents will result in immediate account termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. Marketplace Conduct</h2>
            <p>Users are responsible for the items they list. Unispace is not liable for the quality of goods exchanged. Transactions are facilitated via the UniWallet.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. User Content</h2>
            <p>You retain ownership of content you post (study materials, blog posts), but grant Unispace license to display it.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Privacy</h2>
            <p>We value your privacy. Your personal data is securely stored and never sold to third parties.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
