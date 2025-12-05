
import React from 'react';
import { ArrowLeft, ShieldAlert, Gavel, HeartHandshake } from 'lucide-react';

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
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service & Community Covenant</h1>
        <p className="text-slate-500 mb-8">Effective Date: October 2025</p>

        <div className="prose prose-green max-w-none space-y-8 text-slate-700">
          
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-700 flex items-center mb-4">
              <ShieldAlert className="mr-2" /> Zero Tolerance Policy
            </h2>
            <p className="mb-4 font-medium">Unispace is a platform for academic growth, business, and social development. We have a zero-tolerance policy for the following:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-red-800">
              <li><strong>No Hard Drugs:</strong> The sale, promotion, or discussion of illegal narcotics or controlled substances is strictly prohibited.</li>
              <li><strong>No Sexual Abuse or Harassment:</strong> Any form of sexual misconduct, unsolicited advances, or harassment will result in an immediate ban and reporting to authorities.</li>
              <li><strong>No Cybercrime:</strong> Fraud, hacking, carding, or any form of internet fraud ("Yahoo-Yahoo") is banned.</li>
              <li><strong>No Occultism:</strong> The formation of cult groups, satanic courses, or promotion of occult activities is forbidden.</li>
              <li><strong>No Hate Speech:</strong> Content that devalues, degrades, or incites violence against any individual or group is prohibited.</li>
            </ul>
          </div>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
              <HeartHandshake className="mr-2 text-green-600" />
              1. Purpose of Platform
            </h2>
            <p>Unispace is designed to improve one another. Blogs, Campuses, and Marketplace listings must be centered around:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Academic Education & Research</li>
              <li>Legitimate Student Business & Commerce</li>
              <li>Positive Social Life & Networking</li>
              <li>Career Development</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
              <Gavel className="mr-2 text-orange-600" />
              2. Reporting & Banning Policy
            </h2>
            <p>To ensure safety, we have implemented a strict <strong>3-Strike Rule</strong>:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Users can report others for violations of these terms (Cyberstalking, Harassment, Harmful Messages, etc.).</li>
              <li>If a user is reported and verified <strong>3 times</strong>, their account will be automatically <strong>BANNED</strong>.</li>
              <li><strong>Unbanning:</strong> To regain access, a banned user must pay a fine as a penalty for violating community standards.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. Campus Creation</h2>
            <p>All created campuses are subject to verification. We do not allow redundant campuses or those that do not foster interaction. Campuses promoting occultism or illegal activities will be deleted immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Privacy & Profile Views</h2>
            <p>To see the identity of users who have viewed your profile, you must subscribe to the Premium service. This ensures privacy controls are maintained.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
