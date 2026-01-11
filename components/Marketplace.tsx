
import React, { useState, useRef } from 'react';
import { Search, Plus, Clock, AlertCircle, MessageCircle, Lock, ShoppingBag, Download, FileText, Check, DollarSign, Upload, Box, Image as ImageIcon, User as UserIcon, X } from 'lucide-react';
import { Product, User, MarketplaceDurationUnit } from '../types';

interface MarketplaceProps {
  products: Product[];
  user: User;
  hasAccess: boolean;
  onAddProduct: (product: Omit<Product, 'id' | 'postedAt' | 'expiresAt' | 'purchasers'>, cost: number) => void;
  onContact: (product: Product) => void;
  onBuyProduct: (product: Product) => void;
  checkLimit: (type: 'MARKET_POST') => boolean;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ products, user, hasAccess, onAddProduct, onContact, onBuyProduct, checkLimit }) => {
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
  const [digitalFile, setDigitalFile] = useState<File | null>(null); // For digital doc OR physical image
  const [coverImage, setCoverImage] = useState<File | null>(null); // Specific for Digital Product Cover
  
  const [durationUnit, setDurationUnit] = useState<MarketplaceDurationUnit>(MarketplaceDurationUnit.DAYS);
  const [durationValue, setDurationValue] = useState<number>(7);
  const listingFee = durationUnit === MarketplaceDurationUnit.DAYS ? 50 * durationValue : durationUnit === MarketplaceDurationUnit.WEEKS ? 300 * durationValue : 1000 * durationValue;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleStartListing = () => {
     if (!checkLimit('MARKET_POST')) return;
     setIsListingModalOpen(true);
  };

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

    if (!isDigital && !digitalFile) {
       alert("Please upload a product image.");
       return;
    }

    const digitalFileUrl = isDigital && digitalFile ? URL.createObjectURL(digitalFile) : undefined;
    
    // Determine Image URL
    let imgUrl = '';
    if (!isDigital) {
       // Physical product: digitalFile state holds the image
       imgUrl = digitalFile ? URL.createObjectURL(digitalFile) : `https://picsum.photos/400/300?random=${Math.random()}`;
    } else {
       // Digital product: coverImage holds the image, or fallback
       imgUrl = coverImage ? URL.createObjectURL(coverImage) : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';
    }

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
    setCoverImage(null);
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
    <div className="space-y-6 pb-24 md:pb-0 relative">
      <div className="flex items-center space-x-2 mb-4">
         <div className="p-2 bg-green-100 rounded-lg text-green-700">
            <ShoppingBag size={24} />
         </div>
         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">UniMarket</h2>
      </div>

      {/* Controls - Sticky on Mobile */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 py-2 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search textbooks, gadgets..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-slate-400 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Textbooks">Textbooks</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Services">Services</option>
            </select>
            {/* Desktop Sell Button */}
            <button 
              onClick={handleStartListing}
              className="hidden md:flex bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 items-center space-x-2 shadow-lg shadow-green-200 dark:shadow-none transition-colors"
            >
              <Plus size={20} />
              <span>Sell Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <button 
        onClick={handleStartListing}
        className="md:hidden fixed bottom-24 right-6 z-40 bg-green-600 text-white p-4 rounded-full shadow-xl shadow-green-600/40 hover:bg-green-700 active:scale-95 transition-transform"
        aria-label="Sell Item"
      >
        <Plus size={28} />
      </button>

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
         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sell on UniSpace</h3>
                   <button 
                     onClick={() => setIsListingModalOpen(false)} 
                     className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                   >
                     <X size={24} />
                   </button>
               </div>
               
               <form onSubmit={handleCreateListing} className="space-y-5">
                  {/* Product Type Toggle */}
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIsDigital(false)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isDigital ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      <Box size={16} className="inline mr-1" /> Physical Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDigital(true)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isDigital ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                      <FileText size={16} className="inline mr-1" /> Digital Product
                    </button>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Title</label>
                     <input 
                        required 
                        type="text" 
                        value={newTitle} 
                        onChange={e => setNewTitle(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder={isDigital ? "e.g. Past Questions PDF" : "e.g. Engineering Mathematics"}
                     />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Price (₦)</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                           <input 
                              required 
                              type="number" 
                              value={newPrice} 
                              onChange={e => setNewPrice(e.target.value)} 
                              className="w-full pl-8 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 outline-none"
                              placeholder="0.00"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                        <select 
                           value={newCategory} 
                           onChange={e => setNewCategory(e.target.value)} 
                           className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                        >
                           <option>Textbooks</option>
                           <option>Electronics</option>
                           <option>Fashion</option>
                           <option>Services</option>
                        </select>
                     </div>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                     <textarea 
                        required 
                        value={newDesc} 
                        onChange={e => setNewDesc(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 outline-none resize-none" 
                        rows={3} 
                        placeholder={isDigital ? "Describe the contents of the file..." : "Describe condition, pickup location..."}
                     />
                  </div>

                  {/* Dynamic Upload Section */}
                  <div className="space-y-4">
                     {/* Main File/Image */}
                     <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                         <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3 text-center">
                            {isDigital ? <><FileText size={20} className="inline mr-1 text-blue-500" /> Upload Document (PDF/DOC)</> : <><ImageIcon size={20} className="inline mr-1 text-green-500" /> Upload Product Image</>}
                         </label>
                         <div className="flex flex-col items-center gap-3">
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
                               className="px-6 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm"
                            >
                               {digitalFile ? 'Change File' : (isDigital ? 'Select Document' : 'Select Photo')}
                            </button>
                            {digitalFile && <span className="text-xs text-green-600 font-medium truncate max-w-full">{digitalFile.name}</span>}
                         </div>
                         {isDigital && <p className="text-[10px] text-slate-400 text-center mt-3">Buyers will be able to download this file immediately after purchase.</p>}
                     </div>

                     {/* Extra Cover Image for Digital Products */}
                     {isDigital && (
                        <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                           <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3 text-center">
                              <ImageIcon size={20} className="inline mr-1 text-orange-500" /> Upload Cover Image (Optional)
                           </label>
                           <div className="flex flex-col items-center gap-3">
                              <input 
                                 type="file" 
                                 ref={coverInputRef}
                                 className="hidden" 
                                 accept="image/*"
                                 onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
                              />
                              <button 
                                 type="button" 
                                 onClick={() => coverInputRef.current?.click()}
                                 className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm"
                              >
                                 {coverImage ? 'Change Cover' : 'Select Cover Image'}
                              </button>
                              {coverImage && <span className="text-xs text-orange-600 font-medium truncate max-w-full">{coverImage.name}</span>}
                           </div>
                           <p className="text-[10px] text-slate-400 text-center mt-3">A visual preview makes your digital product sell faster.</p>
                        </div>
                     )}
                  </div>
                  
                  {/* Duration & Fee */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl space-y-3 border border-green-100 dark:border-green-800">
                     <p className="text-sm font-bold text-green-800 dark:text-green-300">Listing Duration</p>
                     <div className="flex space-x-3">
                        <select 
                           value={durationUnit} 
                           onChange={e => setDurationUnit(e.target.value as MarketplaceDurationUnit)} 
                           className="flex-1 p-2 rounded-lg text-sm border-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
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
                           className="w-20 p-2 rounded-lg text-sm border-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm text-center" 
                        />
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-800">
                        <span className="text-sm text-green-700 dark:text-green-400 font-medium">Estimated Fee:</span>
                        <span className="font-bold text-green-800 dark:text-green-300 text-lg">₦{listingFee.toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="pt-2">
                     <button type="submit" className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none active:scale-95 transition-all">Pay & List Item</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
