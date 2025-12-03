
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
import { User, UserRole, Product, WalletTransaction, FeedPost, ProfileViewer, ChatSession, InstitutionGroup, Topic, Notification } from './types';

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
  isPremium: false,
  referralCode: 'CHIOMA23',
  referralCount: 12, // Enough for Ambassador status
  joinedAt: new Date().toISOString(),
  interests: ['Technology', 'Coding', 'Reading'],
  portfolioUrl: 'https://github.com/chioma',
  businessEmail: 'chioma.dev@gmail.com'
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
];

const INITIAL_GROUPS: InstitutionGroup[] = [
  { id: 'g1', name: 'UNILAG Engineering', description: 'Faculty of Engineering students only.', memberCount: 1240, isPrivate: false, imageUrl: 'https://picsum.photos/200/200?random=1', isJoined: false },
  { id: 'g2', name: 'Tech Bros & Sis', description: 'Coding, Design, and Startups.', memberCount: 850, isPrivate: false, imageUrl: 'https://picsum.photos/200/200?random=2', isJoined: true },
  { id: 'g3', name: 'Gst 102 Study Grp', description: 'Exam prep for Gst 102.', memberCount: 45, isPrivate: true, imageUrl: 'https://picsum.photos/200/200?random=3', isJoined: false },
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
  // Lifted state for topics to share with Dashboard
  const [topics, setTopics] = useState<Topic[]>([]);
  // Mock products for dashboard
  const [products, setProducts] = useState<Product[]>([
     { id: 'p1', sellerId: 'u1', sellerName: 'Chioma', sellerVerified: true, title: 'Engineering Math 101', price: 5000, description: 'Slightly used.', category: 'Textbooks', imageUrl: 'https://picsum.photos/200', postedAt: new Date().toISOString(), expiresAt: new Date().toISOString() }
  ]);

  // Feature Access Check (7-Day Trial)
  const checkAccess = () => {
    if (user.isPremium) return true;
    const joined = new Date(user.joinedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  const hasTrialAccess = checkAccess();

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

  const handleCreateGroup = (name: string) => {
    const newGroup: InstitutionGroup = {
      id: `g${Date.now()}`,
      name,
      description: 'New Campus Group',
      memberCount: 1,
      isPrivate: false,
      imageUrl: `https://picsum.photos/200/200?random=${Math.random()}`,
      isJoined: true
    };
    setGroups([...groups, newGroup]);
  };

  const handleJoinGroup = (id: string) => {
    setGroups(groups.map(g => {
      if (g.id === id) {
        return { ...g, isJoined: true, memberCount: g.memberCount + 1 };
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
    // Deduct wallet balance mock
    setUser({ ...user, walletBalance: user.walletBalance - cost });
    setProducts([...products, { ...productData, id: `p${Date.now()}`, postedAt: new Date().toISOString(), expiresAt: new Date().toISOString() }]);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            activeListings={products.filter(p => p.sellerId === user.id)}
            recentTopics={topics} 
            unreadMessages={chats.reduce((acc, chat) => acc + chat.unreadCount, 0)}
            onNavigate={setActiveTab} 
          />
        );
      case 'wallet':
         return <WalletCard user={user} transactions={[]} onTopUp={() => setUser({...user, walletBalance: user.walletBalance + 5000})} />;
      case 'market':
        return <Marketplace products={products} user={user} hasAccess={hasTrialAccess} onAddProduct={handleAddProduct} onContact={handleContactSeller} />;
      case 'study':
        return <StudyHub isVerified={user.verified} hasAccess={hasTrialAccess} onShareResult={() => {}} topics={topics} onUpdateTopics={setTopics} />;
      case 'feed':
        return <CampusFeed posts={[]} user={user} onPostCreate={() => {}} />;
      case 'groups':
        return <Institutions groups={groups} onJoin={handleJoinGroup} onCreate={handleCreateGroup} />;
      case 'chat':
        return <Chat sessions={chats} currentUserId={user.id} onSendMessage={(sid, txt) => {
           setChats(prev => prev.map(c => c.id === sid ? {
             ...c,
             lastMessage: txt,
             lastMessageTime: new Date().toISOString(),
             messages: [...c.messages, { id: `m${Date.now()}`, senderId: user.id, text: txt, timestamp: new Date().toISOString() }]
           } : c));
        }} />;
      case 'faq':
        return <FAQ />;
      case 'profile':
        return <Profile user={user} viewers={[]} onSubscribe={() => setUser({...user, isPremium: true})} onVerify={() => {}} onUpdateProfile={(u) => setUser({...user, ...u})} />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  if (view === 'LANDING') return <LandingPage onGetStarted={() => setView('AUTH')} featuredUsers={MOCK_AMBASSADORS} />;
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
