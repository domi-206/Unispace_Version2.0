
import React, { useState } from 'react';
import { Eye, EyeOff, PlusCircle, ArrowUpRight, ArrowDownLeft, Wallet, Send, X } from 'lucide-react';
import { User, WalletTransaction } from '../types';

interface WalletCardProps {
  user: User;
  transactions: WalletTransaction[];
  onTopUp: () => void;
  onTransfer: (email: string, amount: number) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ user, transactions, onTopUp, onTransfer }) => {
  const [showBalance, setShowBalance] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (amount > 0 && recipientEmail) {
      if (amount > user.walletBalance) {
        alert("Insufficient funds.");
        return;
      }
      onTransfer(recipientEmail, amount);
      setIsTransferModalOpen(false);
      setRecipientEmail('');
      setTransferAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden" style={{ backgroundColor: '#07bc0c' }}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <p className="text-green-50 text-sm font-medium mb-1">Total Balance</p>
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
            className="flex-1 bg-white text-green-700 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors flex items-center justify-center space-x-2"
          >
            <PlusCircle size={18} />
            <span>Top Up</span>
          </button>
          <button 
            onClick={() => setIsTransferModalOpen(true)}
            className="flex-1 bg-green-900/30 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-green-900/50 transition-colors border border-white/20 flex items-center justify-center space-x-2"
          >
            <Send size={18} />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
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

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Transfer Funds</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Email</label>
                <input 
                  type="email" 
                  required 
                  value={recipientEmail} 
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="student@uni.edu.ng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                <input 
                  type="number" 
                  required 
                  min="100"
                  value={transferAmount} 
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="0.00"
                />
                <p className="text-xs text-slate-500 mt-1">Available: ₦{user.walletBalance.toLocaleString()}</p>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                <Send size={18} />
                <span>Send Money</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
