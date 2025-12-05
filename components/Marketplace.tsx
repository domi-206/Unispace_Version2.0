
import React, { useState, useRef } from 'react';
import { Search, Plus, Clock, AlertCircle, MessageCircle, Lock, ShoppingBag, Download, FileText, Check, DollarSign, Upload, Box, Image as ImageIcon, User as UserIcon } from 'lucide-react';
import { Product, User, MarketplaceDurationUnit } from '../types';

interface MarketplaceProps {
  products: Product[];
  user: User;
  hasAccess: boolean;
  onAddProduct: (product: Omit<Product, 'id' | 'postedAt' | 'expiresAt' | 'purchasers'>, cost: number) => void;
  onContact: (product: Product) => void;
  onBuyProduct: (product: Product) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ products, user, hasAccess, onAddProduct, onContact, onBuyProduct }) => {
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Textbooks');
  
  // Product Type State
  const [isDigital, setIsDigital] = useState(false);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  
  const [durationUnit, setDurationUnit] = useState<MarketplaceDurationUnit>(MarketplaceDurationUnit.DAYS);
  const [durationValue, setDurationValue] = useState<number>(7);
  const listingFee = durationUnit === MarketplaceDurationUnit.DAYS ? 50 * durationValue : durationUnit === MarketplaceDurationUnit.WEEKS ? 300 * durationValue : 1000 * durationValue;

  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (isDigital && !digitalFile) {
      alert("Please upload the digital file (PDF/Document) for this product.");
      return;
    }

    const digitalFileUrl = digitalFile ? URL.createObjectURL(digitalFile) : undefined;
    // For physical items, we use a placeholder image. For digital, we might use a generic doc icon or allow image upload too.
    const imgUrl = isDigital 
      ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400' // Book/Doc placeholder
      : `https://picsum.photos/400/300?random=${Math.random()}`;

    onAddProduct({
      sellerId: user.id,
      sellerName: user.name,
      sellerVerified: user.verified,
      title: newTitle,
      price: Number(newPrice),
      description: newDesc,
      category: newCategory,
      imageUrl: imgUrl,
      digitalFileUrl: digitalFileUrl
    }, listingFee);
    
    // Reset
    setIsListingModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setDigitalFile(null);
    setIsDigital(false);
  };

  const handleBuy = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (user.walletBalance < product.price) {
      alert("Insufficient funds in your UniWallet.");
      return;
    }
    if (confirm(`Purchase "${product.title}" for ₦${product.price.toLocaleString()}?`)) {
      onBuyProduct(product);
    }
  };

  const handleMessage = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onContact(product);
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
        {filteredProducts.map(product => {
          const isPurchased = product.purchasers.includes(user.id);
          const isMyProduct = product.sellerId === user.id;
          const downloadCount = product.purchasers.length;

          return (
            <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-48 bg-slate-100">
                <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-green-600">
                  {product.category}
                </div>
                {product.digitalFileUrl && (
                  <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1">
                    <FileText size={12} /> Digital
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{product.title}</h3>
                  <p className="text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
                </div>
                
                {/* Seller & Downloads Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                   <div className="flex items-center space-x-1">
                      <UserIcon size={12} />
                      <span className="truncate max-w-[100px]">{product.sellerName}</span>
                   </div>
                   {product.digitalFileUrl && (
                      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                         <Download size={10} />
                         <span>{downloadCount} {downloadCount === 1 ? 'Sale' : 'Sales'}</span>
                      </div>
                   )}
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{product.description}</p>
                
                {/* Actions */}
                <div className="pt-4 border-t border-slate-50 dark:border-slate-700 mt-auto">
                   
                   {isPurchased ? (
                      product.digitalFileUrl ? (
                        <a 
                          href={product.digitalFileUrl} 
                          download 
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Download size={16} />
                          <span>Download File</span>
                        </a>
                      ) : (
                        <div className="w-full py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-bold rounded-lg flex items-center justify-center space-x-2">
                          <Check size={16} />
                          <span>Purchased</span>
                        </div>
                      )
                   ) : isMyProduct ? (
                      <div className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 text-sm font-bold rounded-lg text-center">
                        Listed by You
                      </div>
                   ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={(e) => handleMessage(e, product)}
                          className="py-2.5 bg-slate-50 dark:bg-slate-700 text-green-600 dark:text-white text-sm font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-600 active:scale-95"
                        >
                          <MessageCircle size={16} />
                          <span className="hidden sm:inline">Message</span>
                          <span className="sm:hidden">Chat</span>
                        </button>
                        <button 
                          onClick={(e) => handleBuy(e, product)}
                          className="py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-md shadow-green-100 dark:shadow-none active:scale-95"
                        >
                          <DollarSign size={16} />
                          <span>Buy Now</span>
                        </button>
                      </div>
                   )}

                </div>
              </div>
            </div>
          );
        })}
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
               <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Sell on UniMarket</h3>
               
               <form onSubmit={handleCreateListing} className="space-y-4">
                  {/* Product Type Toggle */}
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setIsDigital(false)}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isDigital ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      <Box size={16} className="inline mr-1" /> Physical Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDigital(true)}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isDigital ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      <FileText size={16} className="inline mr-1" /> Digital Product
                    </button>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Product Title</label>
                     <input 
                        required 
                        type="text" 
                        value={newTitle} 
                        onChange={e => setNewTitle(e.target.value)} 
                        className="w-full mt-1 p-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-slate-400"
                        placeholder={isDigital ? "e.g. Past Questions PDF" : "e.g. Engineering Mathematics"}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Price (₦)</label>
                        <input 
                           required 
                           type="number" 
                           value={newPrice} 
                           onChange={e => setNewPrice(e.target.value)} 
                           className="w-full mt-1 p-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-slate-400"
                           placeholder="0.00"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                        <select 
                           value={newCategory} 
                           onChange={e => setNewCategory(e.target.value)} 
                           className="w-full mt-1 p-2 rounded-lg border border-slate-600 bg-slate-900 text-white"
                        >
                           <option>Textbooks</option>
                           <option>Electronics</option>
                           <option>Fashion</option>
                           <option>Services</option>
                        </select>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                     <textarea 
                        required 
                        value={newDesc} 
                        onChange={e => setNewDesc(e.target.value)} 
                        className="w-full mt-1 p-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-slate-400" 
                        rows={3} 
                        placeholder={isDigital ? "Describe the contents of the file..." : "Describe condition, pickup location..."}
                     />
                  </div>

                  {/* Dynamic Upload Section */}
                  <div className="p-4 border border-dashed border-slate-600 rounded-xl bg-slate-900/50">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                         {isDigital ? <><FileText size={16} className="inline mr-1" /> Upload Document (PDF/DOC)</> : <><ImageIcon size={16} className="inline mr-1" /> Upload Product Image</>}
                      </label>
                      <div className="flex items-center gap-3">
                         <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept={isDigital ? ".pdf,.doc,.docx" : "image/*"}
                            onChange={(e) => setDigitalFile(e.target.files ? e.target.files[0] : null)}
                         />
                         <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-600"
                         >
                            {digitalFile ? 'Change File' : (isDigital ? 'Select Document' : 'Select Photo')}
                         </button>
                         {digitalFile && <span className="text-xs text-green-400 truncate flex-1">{digitalFile.name}</span>}
                      </div>
                      {isDigital && <p className="text-[10px] text-slate-500 mt-2">Buyers will be able to download this file immediately after purchase.</p>}
                  </div>
                  
                  {/* Duration & Fee */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl space-y-3">
                     <p className="text-sm font-semibold text-green-800 dark:text-green-300">Listing Duration</p>
                     <div className="flex space-x-2">
                        <select 
                           value={durationUnit} 
                           onChange={e => setDurationUnit(e.target.value as MarketplaceDurationUnit)} 
                           className="flex-1 p-2 rounded-lg text-sm border-none bg-slate-900 text-white"
                        >
                           <option value={MarketplaceDurationUnit.DAYS}>Days</option>
                           <option value={MarketplaceDurationUnit.WEEKS}>Weeks</option>
                           <option value={MarketplaceDurationUnit.MONTHS}>Months</option>
                        </select>
                        <input 
                           type="number" 
                           min="1" 
                           max="12" 
                           value={durationValue} 
                           onChange={e => setDurationValue(Number(e.target.value))} 
                           className="w-20 p-2 rounded-lg text-sm border-none bg-slate-900 text-white" 
                        />
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
