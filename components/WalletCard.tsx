
import React from 'react';
import { Eye, EyeOff, PlusCircle, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { User, WalletTransaction } from '../types';

interface WalletCardProps {
  user: User;
  transactions: WalletTransaction[];
  onTopUp: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ user, transactions, onTopUp }) => {
  // Balance hidden by default
  const [showBalance, setShowBalance] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Total Balance</p>
            <div className="flex items-center space-x-3">
              <h2 className="text-4xl font-bold tracking-tight">
                {showBalance ? `₦${user.walletBalance.toLocaleString()}` : '••••••••'}
              </h2>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <Wallet size={24} className="text-white" />
          </div>
        </div>

        <div className="flex space-x-3 relative z-10">
          <button 
            onClick={onTopUp}
            className="flex-1 bg-white text-indigo-700 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2"
          >
            <PlusCircle size={18} />
            <span>Top Up</span>
          </button>
          <button className="flex-1 bg-indigo-800/50 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-indigo-800/70 transition-colors border border-white/10">
            Withdraw
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No transactions yet.</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-full ${
                    tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'CREDIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{tx.description}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${
                  tx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-900'
                }`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
