
import React, { useState } from 'react';
import { Search, Plus, Clock, AlertCircle, MessageCircle, Lock, ShoppingBag } from 'lucide-react';
import { Product, User, MarketplaceDurationUnit } from '../types';

interface MarketplaceProps {
  products: Product[];
  user: User;
  hasAccess: boolean;
  onAddProduct: (product: Omit<Product, 'id' | 'postedAt' | 'expiresAt'>, cost: number) => void;
  onContact: (product: Product) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ products, user, hasAccess, onAddProduct, onContact }) => {
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Textbooks');
  const [durationUnit, setDurationUnit] = useState<MarketplaceDurationUnit>(MarketplaceDurationUnit.DAYS);
  const [durationValue, setDurationValue] = useState<number>(7);
  const listingFee = durationUnit === MarketplaceDurationUnit.DAYS ? 50 * durationValue : durationUnit === MarketplaceDurationUnit.WEEKS ? 300 * durationValue : 1000 * durationValue;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Lock size={48} className="text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">UniMarket Locked</h2>
        <p className="text-slate-500 max-w-md mt-2">Your 7-day free trial has expired. Subscribe to access the marketplace.</p>
        <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-full font-bold">Unlock Access</button>
      </div>
    );
  }

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.walletBalance < listingFee) {
       alert("Insufficient UniWallet balance.");
       return;
    }
    onAddProduct({
      sellerId: user.id,
      sellerName: user.name,
      sellerVerified: user.verified,
      title: newTitle,
      price: Number(newPrice),
      description: newDesc,
      category: newCategory,
      imageUrl: `https://picsum.photos/400/300?random=${Math.random()}`,
    }, listingFee);
    setIsListingModalOpen(false);
  };

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
         <div className="p-2 bg-green-100 rounded-lg text-green-700">
            <ShoppingBag size={24} />
         </div>
         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">UniMarket</h2>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search textbooks, gadgets, services..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Textbooks">Textbooks</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Services">Services</option>
          </select>
          {user.role === 'STUDENT' && user.verified && (
            <button 
              onClick={() => setIsListingModalOpen(true)}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 flex items-center space-x-2 shadow-lg shadow-green-200 dark:shadow-none"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Sell Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className="relative h-48 bg-slate-100">
              <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-green-600">
                {product.category}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{product.title}</h3>
                <p className="text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{product.description}</p>
              
              <div className="pt-4 border-t border-slate-50 dark:border-slate-700 mt-auto">
                 <button 
                  onClick={() => onContact(product)}
                  className="w-full py-2 bg-slate-50 dark:bg-slate-700 text-green-600 dark:text-white text-sm font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-600"
                >
                  <MessageCircle size={16} />
                  <span>Message Seller</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
             <ShoppingBag size={48} className="mx-auto mb-2 opacity-50" />
             <p>No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Listing Modal */}
      {isListingModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
               <h3 className="text-xl font-bold mb-4 dark:text-white">Sell on UniMarket</h3>
               <form onSubmit={handleCreateListing} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product Title</label>
                     <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Price (₦)</label>
                        <input required type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                           <option>Textbooks</option>
                           <option>Electronics</option>
                           <option>Fashion</option>
                           <option>Services</option>
                        </select>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                     <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full mt-1 p-2 rounded-lg border dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={3} />
                  </div>
                  
                  {/* Duration & Fee */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl space-y-3">
                     <p className="text-sm font-semibold text-green-800 dark:text-green-300">Listing Duration</p>
                     <div className="flex space-x-2">
                        <select value={durationUnit} onChange={e => setDurationUnit(e.target.value as MarketplaceDurationUnit)} className="flex-1 p-2 rounded-lg text-sm border-none dark:bg-slate-700 dark:text-white">
                           <option value={MarketplaceDurationUnit.DAYS}>Days</option>
                           <option value={MarketplaceDurationUnit.WEEKS}>Weeks</option>
                           <option value={MarketplaceDurationUnit.MONTHS}>Months</option>
                        </select>
                        <input type="number" min="1" max="12" value={durationValue} onChange={e => setDurationValue(Number(e.target.value))} className="w-20 p-2 rounded-lg text-sm border-none dark:bg-slate-700 dark:text-white" />
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-800">
                        <span className="text-sm text-green-700 dark:text-green-400">Estimated Fee:</span>
                        <span className="font-bold text-green-800 dark:text-green-300">₦{listingFee}</span>
                     </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                     <button type="button" onClick={() => setIsListingModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                     <button type="submit" className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Pay & List</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
