
import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ReportModalProps {
  reportedUserName: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ reportedUserName, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');

  const REASONS = [
    "Harassment / Bullying",
    "Cyberstalking",
    "Hateful / Harmful Content",
    "Sale of Illegal Drugs",
    "Occult / Satanic Activity",
    "Cybercrime / Fraud",
    "Sexual Abuse / Misconduct",
    "Other Violation"
  ];

  const handleSubmit = () => {
    if (reason) {
      onSubmit(reason);
    } else {
      alert("Please select a reason.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 text-center border-b border-red-100 dark:border-red-900/50">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Report User</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reporting <strong>{reportedUserName}</strong> for violating terms.
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-500 mb-3 font-semibold uppercase">Select Violation Type</p>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
            {REASONS.map((r) => (
              <label key={r} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all">
                <input 
                  type="radio" 
                  name="reportReason" 
                  value={r} 
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 accent-red-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{r}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-colors"
            >
              Submit Report
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-4">
            False reports may result in action against your account.
          </p>
        </div>
      </div>
    </div>
  );
};
