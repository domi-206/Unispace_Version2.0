
import React from 'react';
import { ArrowLeft, Rocket, Shield, Globe } from 'lucide-react';

interface LearnMoreProps {
  onBack: () => void;
}

export const LearnMore: React.FC<LearnMoreProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-green-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center text-green-200 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Unispace</h1>
          <p className="text-xl text-green-100 max-w-2xl">Building the digital infrastructure for the next generation of Nigerian scholars and entrepreneurs.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <Rocket size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              To bridge the gap between academic success and financial independence for students. Unispace provides a seamless ecosystem where learning meets commerce.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Trust & Safety</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              We prioritize verification. Every "Student" user on Unispace is verified with a valid school ID, creating a trusted environment for buying, selling, and interacting.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-orange-100 p-4 rounded-xl text-orange-600">
            <Globe size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Nationwide Connection</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              From UNILAG to ABU Zaria, Unispace connects students across all Nigerian universities, fostering a diverse exchange of ideas and resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
