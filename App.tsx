
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { WalletCard } from './components/WalletCard';
import { Marketplace } from './components/Marketplace';
import { StudyHub } from './components/StudyHub';
import { CampusFeed } from './components/CampusFeed';
import { Profile } from './components/Profile';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { Chat } from './components/Chat';
import { Institutions } from './components/Institutions';
import { FAQ } from './components/FAQ';
import { Dashboard } from './components/Dashboard';
import { TermsOfService } from './components/TermsOfService';
import { LearnMore } from './components/LearnMore';
import { Premium } from './components/Premium';
import { User, UserRole, Product, WalletTransaction, FeedPost, ProfileViewer, ChatSession, InstitutionGroup, Topic, Notification, CampusMessage, CampusMember, SubscriptionPlan } from './types';
import { AlertOctagon, Wallet as WalletIcon } from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_USER: User = {
  id: 'u1',
  name: 'Chioma Adebayo',
  email: 'chioma@uni.edu.ng',
  role: UserRole.STUDENT,
  verified: true,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma',
  bio: 'Computer Science | 300L | UNILAG',
  university: 'University of Lagos',
  walletBalance: 15000,
  
  subscriptionPlan: 'FREE',
  weeklyUploads: 0,
  weeklyQuizzes: 0,
  weeklyAiQueries: 0,
  weeklyMarketPosts: 0,
  lastWeeklyReset: new Date().toISOString(),

  referralCode: 'CHIOMA23',
  referralCount: 12, // Enough for Ambassador status
  joinedAt: new Date().toISOString(),
  interests: ['Technology', 'Coding', 'Reading'],
  portfolioUrl: 'https://github.com/chioma',
  businessEmail: 'chioma.dev@gmail.com',
  hideCampusCount: false,
  reportsCount: 0,
  isBanned: false,
  blockedUsers: []
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'System Update', message: 'Unispace v2.0 is live with new Campus features!', time: '2 hours ago', read: false, type: 'INFO' },
  { id: 'n2', title: 'Wallet Credit', message: 'Your wallet was funded with ₦5,000.', time: '5 hours ago', read: false, type: 'SUCCESS' },
  { id: 'n3', title: 'Quiz Reminder', message: 'You have a pending quiz in StudyHub.', time: '1 day ago', read: true, type: 'WARNING' }
];

const MOCK_AMBASSADORS: User[] = [
  INITIAL_USER,
  { ...INITIAL_USER, id: 'u2', name: 'Emeka Obi', referralCount: 45, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', university: 'University of Nigeria, Nsukka' },
  { ...INITIAL_USER, id: 'u3', name: 'Zainab Musa', referralCount: 28, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab', university: 'Ahmadu Bello University' },
  { ...INITIAL_USER, id: 'u4', name: 'Tunde Bakare', referralCount: 15, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde', university: 'Obafemi Awolowo University' },
  { ...INITIAL_USER, id: 'u5', name: 'Ngozi Eze', referralCount: 11, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ngozi', university: 'University of Port Harcourt' },
  { ...INITIAL_USER, id: 'u6', name: 'Adebayo Salami', referralCount: 20, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo', university: 'Lagos State University' },
  { ...INITIAL_USER, id: 'u7', name: 'Fatima Yusuf', referralCount: 14, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima', university: 'Bayero University Kano' },
];

const INITIAL_GROUPS: InstitutionGroup[] = [
  { 
    id: 'g1', 
    name: 'UNILAG Engineering', 
    description: 'Faculty of Engineering students only.', 
    isPrivate: false, 
    imageUrl: 'https://picsum.photos/200/200?random=1', 
    isJoined: false,
    status: 'ACTIVE',
    members: [
      { userId: 'u2', name: 'Emeka Obi', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', role: 'PROFESSOR', joinedAt: new Date().toISOString() },
      { userId: 'u3', name: 'Zainab Musa', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab', role: 'COURSE_REP', joinedAt: new Date().toISOString() }
    ],
    messages: [
      { id: 'gm1', senderId: 'u2', senderName: 'Emeka Obi', senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', role: 'PROFESSOR', text: 'Welcome to the semester everyone!', timestamp: new Date(Date.now() - 100000).toISOString() }
    ]
  },
  { 
    id: 'g2', 
    name: 'Tech Bros & Sis', 
    description: 'Coding, Design, and Startups.', 
    isPrivate: false, 
    imageUrl: 'https://picsum.photos/200/200?random=2', 
    isJoined: true,
    status: 'ACTIVE',
    members: [
      { userId: 'u1', name: 'Chioma Adebayo', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma', role: 'PROFESSOR', joinedAt: new Date().toISOString() },
      { userId: 'u4', name: 'Tunde Bakare', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde', role: 'STUDENT', joinedAt: new Date().toISOString() }
    ],
    messages: [
      { id: 'gm2', senderId: 'u4', senderName: 'Tunde Bakare', senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde', role: 'STUDENT', text: 'Anyone attending the hackathon?', timestamp: new Date(Date.now() - 50000).toISOString() }
    ]
  },
];

const INITIAL_CHATS: ChatSession[] = [
  { 
    id: 'c1', participantId: 'u2', participantName: 'Emeka Obi', participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka',
    lastMessage: 'Is the textbook still available?', lastMessageTime: new Date().toISOString(), unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'u2', text: 'Hi, is this available?', timestamp: new Date(Date.now() - 100000).toISOString(), productTitle: 'Engineering Math' },
      { id: 'm2', senderId: 'u1', text: 'Yes it is!', timestamp: new Date(Date.now() - 50000).toISOString() }
    ]
  }
];

function App() {
  const [view, setView] = useState<'LANDING' | 'AUTH' | 'APP' | 'TERMS' | 'LEARN_MORE'>('LANDING');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  // Lifted state for topics to share with Dashboard
  const [topics, setTopics] = useState<Topic[]>([]);
  // Mock products for dashboard
  const [products, setProducts] = useState<Product[]>([
     { id: 'p1', sellerId: 'u1', sellerName: 'Chioma', sellerVerified: true, title: 'Engineering Math 101', price: 5000, description: 'Slightly used.', category: 'Textbooks', imageUrl: 'https://picsum.photos/200', postedAt: new Date().toISOString(), expiresAt: new Date().toISOString(), purchasers: [] }
  ]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    { id: 'f1', authorId: 'u2', authorName: 'Emeka Obi', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', authorRole: UserRole.STUDENT, content: 'Just finished my final year project! 🚀', likes: 24, comments: 5, postedAt: new Date(Date.now() - 10000000).toISOString() }
  ]);

  // Feature Access Check (7-Day Trial or Subscription)
  const checkAccess = () => {
    if (user.subscriptionPlan !== 'FREE') return true;
    const joined = new Date(user.joinedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  const hasAccess = checkAccess();

  // Limit Check Logic
  const checkLimit = (type: 'UPLOAD' | 'QUIZ' | 'AI' | 'MARKET_POST') => {
    const plan = user.subscriptionPlan;
    
    // Unlimited Plans
    if (plan === 'PLAN_STUDY_PREMIUM' || plan === 'PLAN_MERCHANT_PREMIUM') {
      if (type === 'MARKET_POST' && plan === 'PLAN_STUDY_PREMIUM') {
         alert("Your 'Study Premium' plan does not include selling. Upgrade to a Merchant plan.");
         return false;
      }
      return true;
    }

    if (type === 'UPLOAD') {
      let limit = 0;
      if (plan === 'FREE') limit = 0; // Or 1 if in trial? Assuming 0 for expired free.
      else if (plan.includes('BASIC')) limit = 1;
      else if (plan.includes('STANDARD')) limit = 5;
      
      // Trial Logic override
      if (plan === 'FREE' && hasAccess) limit = 1; 

      if (user.weeklyUploads >= limit) {
        alert("Weekly upload limit reached. Upgrade for more.");
        return false;
      }
      setUser(prev => ({ ...prev, weeklyUploads: prev.weeklyUploads + 1 }));
      return true;
    }

    if (type === 'QUIZ') {
      let limit = 0;
      if (plan.includes('BASIC')) limit = 3;
      else if (plan.includes('STANDARD')) limit = 15;
      
      if (plan === 'FREE' && hasAccess) limit = 1; 

      if (user.weeklyQuizzes >= limit) {
        alert("Weekly quiz session limit reached. Upgrade for more.");
        return false;
      }
      setUser(prev => ({ ...prev, weeklyQuizzes: prev.weeklyQuizzes + 1 }));
      return true;
    }

    if (type === 'AI') {
      let limit = 0;
      if (plan.includes('STANDARD')) limit = 10;
      else if (plan.includes('PREMIUM')) return true;
      
      if (user.weeklyAiQueries >= limit) {
        alert("Weekly AI query limit reached. Upgrade for more.");
        return false;
      }
      setUser(prev => ({ ...prev, weeklyAiQueries: prev.weeklyAiQueries + 1 }));
      return true;
    }

    if (type === 'MARKET_POST') {
      if (!plan.includes('MERCHANT')) {
        alert("Your current plan does not support selling items. Upgrade to a Merchant plan.");
        return false;
      }

      let limit = 0;
      if (plan === 'PLAN_MERCHANT_BASIC') limit = 3;
      else if (plan === 'PLAN_MERCHANT_STANDARD') limit = 15;
      
      if (user.weeklyMarketPosts >= limit) {
         alert(`Weekly posting limit reached (${limit} posts). Upgrade for more.`);
         return false;
      }
      
      setUser(prev => ({ ...prev, weeklyMarketPosts: prev.weeklyMarketPosts + 1 }));
      return true;
    }

    return true;
  };

  // Safety: Report User Handler
  const handleReportUser = (reportedUserId: string, reason: string) => {
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      title: 'Report Received',
      message: `We are reviewing your report against user. Reason: ${reason}`,
      time: 'Just now',
      read: false,
      type: 'INFO'
    };
    setNotifications([newNotif, ...notifications]);
    alert("Report submitted. Our safety team will review it.");
  };

  const handleBlockUser = (userId: string) => {
    if (!user.blockedUsers.includes(userId)) {
      setUser(prev => ({
        ...prev,
        blockedUsers: [...prev.blockedUsers, userId]
      }));
      alert("User blocked. You will no longer see their content.");
    }
  };

  const handlePayBanFine = () => {
    const FINE_AMOUNT = 5000;
    if (user.walletBalance >= FINE_AMOUNT) {
      setUser(prev => ({
        ...prev,
        walletBalance: prev.walletBalance - FINE_AMOUNT,
        isBanned: false,
        reportsCount: 0 // Reset reports
      }));
      setWalletTransactions(prev => [{
        id: `tx${Date.now()}`,
        type: 'DEBIT',
        amount: FINE_AMOUNT,
        description: 'Community Violation Fine',
        date: new Date().toISOString(),
        status: 'SUCCESS'
      }, ...prev]);
      alert("Fine paid. Your account access has been restored.");
    } else {
      alert("Insufficient funds to pay fine. Please top up.");
    }
  };

  const handleLogin = (userData: Partial<User>) => {
    setUser({ ...INITIAL_USER, ...userData } as User);
    setView('APP');
  };

  const handleLogout = () => {
    setUser(INITIAL_USER);
    setTopics([]);
    setChats(INITIAL_CHATS);
    setView('LANDING');
    setActiveTab('dashboard');
  };

  const handleSubscribe = (plan: SubscriptionPlan, price: number) => {
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - price,
      subscriptionPlan: plan,
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }));
    
    setWalletTransactions(prev => [{
      id: `tx${Date.now()}_sub`,
      type: 'DEBIT',
      amount: price,
      description: `Subscription: ${plan.replace(/_/g, ' ')}`,
      date: new Date().toISOString(),
      status: 'SUCCESS'
    }, ...prev]);

    const planName = plan.replace(/PLAN_|STUDY_|MERCHANT_/g, '').replace(/_/g, ' ');
    alert(`Successfully subscribed to ${planName} Plan!`);
  };

  const handleCreateGroup = (name: string, description: string, imageUrl: string) => {
    const CREATE_FEE = 5000;
    
    // Deduct fee
    setUser(prev => ({ ...prev, walletBalance: prev.walletBalance - CREATE_FEE }));
    
    // Record Transaction
    const feeTx: WalletTransaction = {
      id: `tx${Date.now()}`,
      type: 'DEBIT',
      amount: CREATE_FEE,
      description: `Campus Creation: ${name}`,
      date: new Date().toISOString(),
      status: 'SUCCESS'
    };
    setWalletTransactions(prev => [feeTx, ...prev]);

    const creatorMember: CampusMember = {
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: 'PROFESSOR',
      joinedAt: new Date().toISOString()
    };

    // New groups are PENDING verification
    const newGroup: InstitutionGroup = {
      id: `g${Date.now()}`,
      name,
      description,
      isPrivate: false,
      imageUrl: imageUrl || `https://picsum.photos/200/200?random=${Math.random()}`,
      isJoined: true,
      status: 'PENDING',
      members: [creatorMember],
      messages: []
    };
    setGroups([...groups, newGroup]);
  };

  const handleJoinGroup = (id: string) => {
    const GUEST_FEE = 2000;

    // Check Logic for Guests vs Students
    if (user.role === UserRole.GUEST) {
      setUser(prev => ({ ...prev, walletBalance: prev.walletBalance - GUEST_FEE }));
      
      const feeTx: WalletTransaction = {
        id: `tx${Date.now()}`,
        type: 'DEBIT',
        amount: GUEST_FEE,
        description: `Campus Access Fee`,
        date: new Date().toISOString(),
        status: 'SUCCESS'
      };
      setWalletTransactions(prev => [feeTx, ...prev]);
    } 

    setGroups(groups.map(g => {
      if (g.id === id) {
        const newMember: CampusMember = {
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: 'STUDENT',
          joinedAt: new Date().toISOString()
        };
        
        const publicWelcome: CampusMessage = {
          id: `sys${Date.now()}_1`,
          senderId: 'sys',
          senderName: 'System',
          senderAvatar: '',
          role: 'PROFESSOR',
          text: `Welcome ${user.name} to the ${g.name} faculty.`,
          timestamp: new Date().toISOString()
        };

        const personalAdmission: CampusMessage = {
          id: `sys${Date.now()}_2`,
          senderId: 'sys',
          senderName: 'System',
          senderAvatar: '',
          role: 'PROFESSOR',
          text: `You have been admitted into ${g.name} campus.`,
          timestamp: new Date().toISOString()
        };

        return { 
          ...g, 
          isJoined: true, 
          members: [...g.members, newMember],
          messages: [...g.messages, publicWelcome, personalAdmission]
        };
      }
      return g;
    }));
  };

  const handleCampusMessage = (groupId: string, text: string) => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        const myRole = g.members.find(m => m.userId === user.id)?.role || 'STUDENT';
        const newMessage: CampusMessage = {
          id: `cm${Date.now()}`,
          senderId: user.id,
          senderName: user.name,
          senderAvatar: user.avatarUrl,
          role: myRole,
          text,
          timestamp: new Date().toISOString()
        };
        return { ...g, messages: [...g.messages, newMessage] };
      }
      return g;
    }));
  };

  const handleManageMember = (groupId: string, memberId: string, action: 'PROMOTE' | 'DROPOUT') => {
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        if (action === 'DROPOUT') {
          return { ...g, members: g.members.filter(m => m.userId !== memberId) };
        }
        if (action === 'PROMOTE') {
          return {
            ...g,
            members: g.members.map(m => m.userId === memberId ? { ...m, role: 'COURSE_REP' } : m)
          };
        }
      }
      return g;
    }));
  };

  const handleContactSeller = (product: Product) => {
    const existingChat = chats.find(c => c.participantId === product.sellerId);
    if (existingChat) {
       setActiveTab('chat');
    } else {
       const newChat: ChatSession = {
         id: `c${Date.now()}`,
         participantId: product.sellerId,
         participantName: product.sellerName,
         participantAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.sellerName}`,
         lastMessage: 'Started inquiry about ' + product.title,
         lastMessageTime: new Date().toISOString(),
         unreadCount: 0,
         messages: [{
           id: `m${Date.now()}`,
           senderId: user.id,
           text: `Hi, I'm interested in "${product.title}"`,
           timestamp: new Date().toISOString(),
           productTitle: product.title,
           productId: product.id,
           productImage: product.imageUrl
         }]
       };
       setChats([newChat, ...chats]);
       setActiveTab('chat');
    }
  };

  const handleAddProduct = (productData: any, cost: number) => {
    setUser({ ...user, walletBalance: user.walletBalance - cost });
    const newTx: WalletTransaction = {
      id: `tx${Date.now()}`,
      type: 'DEBIT',
      amount: cost,
      description: `Listing Fee: ${productData.title}`,
      date: new Date().toISOString(),
      status: 'SUCCESS'
    };
    setWalletTransactions([newTx, ...walletTransactions]);
    setProducts([...products, { ...productData, id: `p${Date.now()}`, postedAt: new Date().toISOString(), expiresAt: new Date().toISOString(), purchasers: [] }]);
  };

  const handleBuyProduct = (product: Product) => {
    setUser(prev => ({...prev, walletBalance: prev.walletBalance - product.price}));
    const debitTx: WalletTransaction = {
      id: `tx${Date.now()}_b`,
      type: 'DEBIT',
      amount: product.price,
      description: `Purchase: ${product.title}`,
      date: new Date().toISOString(),
      status: 'SUCCESS'
    };
    setWalletTransactions(prev => [debitTx, ...prev]);
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return { ...p, purchasers: [...p.purchasers, user.id] };
      }
      return p;
    }));
    setNotifications(prev => [{
      id: `n${Date.now()}`,
      title: 'Purchase Successful',
      message: `You bought ${product.title}. Check UniMarket for details.`,
      time: 'Just now',
      read: false,
      type: 'SUCCESS'
    }, ...prev]);
  };

  const handleWalletTransfer = (recipientEmail: string, amount: number) => {
    setUser(prev => ({ ...prev, walletBalance: prev.walletBalance - amount }));
    const newTx: WalletTransaction = {
      id: `tx${Date.now()}`,
      type: 'DEBIT',
      amount: amount,
      description: `Transfer to ${recipientEmail}`,
      date: new Date().toISOString(),
      status: 'SUCCESS'
    };
    setWalletTransactions([newTx, ...walletTransactions]);
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      title: 'Transfer Successful',
      message: `You sent ₦${amount.toLocaleString()} to ${recipientEmail}`,
      time: 'Just now',
      read: false,
      type: 'SUCCESS'
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleCreatePost = (content: string, image?: File) => {
    const newPost: FeedPost = {
      id: `f${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      authorRole: user.role,
      content,
      imageUrl: image ? URL.createObjectURL(image) : undefined,
      likes: 0,
      comments: 0,
      postedAt: new Date().toISOString()
    };
    setFeedPosts([newPost, ...feedPosts]);
  };

  // Filter content based on blocked users
  const visibleFeedPosts = feedPosts.filter(p => !user.blockedUsers.includes(p.authorId));
  const visibleProducts = products.filter(p => !user.blockedUsers.includes(p.sellerId));

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            activeListings={visibleProducts.filter(p => p.sellerId === user.id)}
            recentTopics={topics} 
            unreadMessages={chats.reduce((acc, chat) => acc + chat.unreadCount, 0)}
            onNavigate={setActiveTab} 
          />
        );
      case 'wallet':
         return (
           <div className="max-w-2xl mx-auto space-y-6">
             <div className="flex items-center space-x-2 mb-2">
               <WalletIcon className="text-green-600" size={28} />
               <h2 className="text-2xl font-bold dark:text-white">UniWallet</h2>
             </div>
             <WalletCard 
                user={user} 
                transactions={walletTransactions} 
                onTopUp={() => {
                   setUser({...user, walletBalance: user.walletBalance + 5000});
                   setWalletTransactions(prev => [{
                      id: `tx${Date.now()}_top`,
                      type: 'CREDIT',
                      amount: 5000,
                      description: 'Top Up',
                      date: new Date().toISOString(),
                      status: 'SUCCESS'
                   }, ...prev]);
                }}
                onTransfer={handleWalletTransfer}
             />
           </div>
         );
      case 'market':
        return <Marketplace 
          products={visibleProducts} 
          user={user} 
          hasAccess={hasAccess} 
          onAddProduct={handleAddProduct} 
          onContact={handleContactSeller}
          onBuyProduct={handleBuyProduct}
          checkLimit={checkLimit}
        />;
      case 'study':
        return <StudyHub user={user} hasAccess={hasAccess} onShareResult={() => {}} topics={topics} onUpdateTopics={setTopics} checkLimit={checkLimit} />;
      case 'feed':
        return <CampusFeed posts={visibleFeedPosts} user={user} onPostCreate={handleCreatePost} />;
      case 'groups':
        return <Institutions 
          user={user}
          groups={groups} 
          onJoin={handleJoinGroup} 
          onCreate={handleCreateGroup} 
          onSendMessage={handleCampusMessage}
          onManageMember={handleManageMember}
        />;
      case 'chat':
        return <Chat sessions={chats} currentUserId={user.id} onSendMessage={(sid, txt) => {
           setChats(prev => prev.map(c => c.id === sid ? {
             ...c,
             lastMessage: txt,
             lastMessageTime: new Date().toISOString(),
             messages: [...c.messages, { id: `m${Date.now()}`, senderId: user.id, text: txt, timestamp: new Date().toISOString() }]
           } : c));
        }} />;
      case 'premium':
        return <Premium user={user} onSubscribe={handleSubscribe} />;
      case 'faq':
        return <FAQ />;
      case 'profile':
        return <Profile 
          user={user} 
          viewers={[]} 
          joinedCampusCount={groups.filter(g => g.isJoined).length}
          onSubscribe={() => setActiveTab('premium')} 
          onVerify={() => {}} 
          onUpdateProfile={(u) => setUser({...user, ...u})}
          onReportUser={handleReportUser}
          onBlockUser={handleBlockUser}
        />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  // --- BANNED SCREEN ---
  if (user.isBanned) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border-2 border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertOctagon size={40} className="text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Account Banned</h2>
          <p className="text-slate-600 mb-6">
            Your account has been suspended due to multiple violations of our Community Terms (Reported 3+ times).
          </p>
          <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-left">
            <p className="font-semibold mb-2">Violation Types:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>Harassment / Cyberstalking</li>
              <li>Hateful Content</li>
              <li>Community Guidelines Violation</li>
            </ul>
          </div>
          <p className="text-sm font-semibold text-red-600 mb-6">Fine Required: ₦5,000</p>
          <button 
            onClick={handlePayBanFine}
            className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            Pay Fine to Restore Access
          </button>
        </div>
      </div>
    );
  }

  if (view === 'LANDING') return <LandingPage onGetStarted={() => setView('AUTH')} onLearnMore={() => setView('LEARN_MORE')} featuredUsers={MOCK_AMBASSADORS} />;
  if (view === 'AUTH') return <Auth onLogin={handleLogin} onNavigateToLanding={() => setView('LANDING')} onViewTerms={() => setView('TERMS')} />;
  if (view === 'TERMS') return <TermsOfService onBack={() => setView('AUTH')} />;
  if (view === 'LEARN_MORE') return <LearnMore onBack={() => setView('LANDING')} />;

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      userRole={user.role} 
      isDarkMode={isDarkMode} 
      toggleTheme={() => setIsDarkMode(!isDarkMode)}
      notifications={notifications}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
