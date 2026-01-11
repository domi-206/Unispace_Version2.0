
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
import { Settings } from './components/Settings';
import { User, UserRole, UserTier, Product, WalletTransaction, FeedPost, ChatSession, InstitutionGroup, Topic, Notification, SubscriptionPlan } from './types';
import { Wallet as WalletIcon } from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_USER: User = {
  id: 'u1',
  name: 'Chioma Adebayo',
  email: 'chioma@uni.edu.ng',
  role: UserRole.STUDENT,
  verified: true,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma',
  bio: 'Innovating at the intersection of AI and academic accessibility. Building digital futures for Nigerian students.',
  university: 'University of Lagos',
  walletBalance: 15000,
  
  profession: 'Frontend Architect',
  workPlace: 'Innovation Hub UNILAG',
  websiteUrl: 'https://chiomadevs.com',
  careerInterests: ['Neural Interface Design', 'React Performance', 'Digital Ethics'],

  tier: UserTier.STARTER,
  unlockedPerks: [],
  subscriptionPlan: 'FREE',
  weeklyUploads: 0,
  weeklyQuizzes: 0,
  weeklyAiQueries: 0,
  weeklyMarketPosts: 0,
  lastWeeklyReset: new Date().toISOString(),

  referralCode: 'CHIOMA23',
  referralCount: 12,
  joinedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  interests: ['Technology', 'Coding', 'Research'],
  portfolioUrl: 'https://github.com/chioma',
  businessEmail: 'chioma.dev@gmail.com',
  hideCampusCount: false,
  reportsCount: 0,
  isBanned: false,
  blockedUsers: [],
  preferences: {
    font: 'Inter',
    fontSize: 'base',
    theme: 'light'
  }
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'System Convergence', message: 'Unispace v4.0 distills professional networking into your campus.', time: '2 hours ago', read: false, type: 'INFO' },
  { id: 'n2', title: 'Node Funded', message: 'UniWallet successfully topped with ₦5,000.', time: '5 hours ago', read: false, type: 'SUCCESS' },
  { id: 'n3', title: 'Circle Protocol', message: 'A new faculty circle has been initialized in your domain.', time: '1 day ago', read: true, type: 'WARNING' }
];

const MOCK_AMBASSADORS: User[] = [
  INITIAL_USER,
  { ...INITIAL_USER, id: 'u2', name: 'Emeka Obi', referralCount: 450, tier: UserTier.GOLD, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', university: 'University of Nigeria, Nsukka', profession: 'Product Strategist', bio: 'Distilling complex student problems into elegant solutions.' },
  { ...INITIAL_USER, id: 'u3', name: 'Zainab Musa', referralCount: 155, tier: UserTier.SILVER, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab', university: 'Ahmadu Bello University', profession: 'Data Researcher', bio: 'Quantifying the student experience through empirical analysis.' },
];

const INITIAL_GROUPS: InstitutionGroup[] = [
  { 
    id: 'g1', 
    name: 'UNILAG Engineering', 
    description: 'Faculty of Engineering distilling scholarly resources.', 
    isPrivate: false, 
    imageUrl: 'https://picsum.photos/200/200?random=1', 
    isJoined: false,
    status: 'ACTIVE',
    members: [
      { userId: 'u2', name: 'Emeka Obi', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', role: 'PROFESSOR', joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), profession: 'Lead Researcher', bio: 'Engineering logic distillation.' }
    ],
    messages: []
  },
];

const INITIAL_CHATS: ChatSession[] = [];

function App() {
  const [view, setView] = useState<'LANDING' | 'AUTH' | 'APP' | 'TERMS' | 'LEARN_MORE'>('LANDING');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    { id: 'f1', authorId: 'u2', authorName: 'Emeka Obi', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', authorRole: UserRole.STUDENT, authorUniversity: 'University of Nigeria, Nsukka', content: 'The scholarly node expansion is proceeding as planned. 🚀', likes: 24, comments: 5, postedAt: new Date(Date.now() - 10000000).toISOString() },
    { id: 'f2', authorId: 'u3', authorName: 'Zainab Musa', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab', authorRole: UserRole.STUDENT, authorUniversity: 'Ahmadu Bello University', content: 'Seeking 300L Thermodynamics syllabus distillation. Anyone?', likes: 12, comments: 2, postedAt: new Date(Date.now() - 5000000).toISOString() }
  ]);

  useEffect(() => {
    const root = document.documentElement;
    const fontFamilies = { 'Inter': "'Inter', sans-serif", 'Serif': "Georgia, serif", 'Mono': "monospace" };
    root.style.setProperty('--font-family', fontFamilies[user.preferences.font]);
    document.body.style.fontFamily = fontFamilies[user.preferences.font];
    const fontSizes = { 'sm': '14px', 'base': '16px', 'lg': '18px', 'xl': '20px' };
    root.style.fontSize = fontSizes[user.preferences.fontSize];
    if (user.preferences.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [user.preferences]);

  useEffect(() => {
    if (user.role !== UserRole.STUDENT) return;
    let newTier = UserTier.STARTER;
    let isLeader = false;
    if (user.referralCount >= 1000) { newTier = UserTier.PLATINUM; isLeader = true; }
    else if (user.referralCount >= 700) newTier = UserTier.DIAMOND;
    else if (user.referralCount >= 300) newTier = UserTier.GOLD;
    else if (user.referralCount >= 150) newTier = UserTier.SILVER;
    else if (user.referralCount >= 5) newTier = UserTier.BRONZE;

    if (newTier !== user.tier || isLeader !== user.isCampusLeader) {
      setUser(prev => ({ ...prev, tier: newTier, isCampusLeader: isLeader }));
    }
  }, [user.referralCount, user.role]);

  const handleSubscribe = (plan: SubscriptionPlan, price: number) => {
    if (user.walletBalance < price) { alert("Insufficient funds."); return; }
    setUser(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - price,
      subscriptionPlan: plan.startsWith('PASS_') ? prev.subscriptionPlan : plan,
      passExpiry: plan.startsWith('PASS_') ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : prev.passExpiry,
      subscriptionExpiry: !plan.startsWith('PASS_') ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : prev.subscriptionExpiry
    }));
  };

  const handleLogout = () => {
    setUser(INITIAL_USER);
    setView('LANDING');
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard user={user} activeListings={products.filter(p => p.sellerId === user.id)} recentTopics={topics} unreadMessages={chats.reduce((acc, chat) => acc + chat.unreadCount, 0)} onNavigate={setActiveTab} />;
      case 'wallet':
         return (
           <div className="max-w-2xl mx-auto space-y-6">
             <div className="flex items-center space-x-2 mb-2">
               <WalletIcon className="text-green-600" size={28} />
               <h2 className="text-2xl font-bold dark:text-white">UniWallet</h2>
             </div>
             <WalletCard user={user} transactions={walletTransactions} onTopUp={() => {
                   setUser({...user, walletBalance: user.walletBalance + 5000});
                   setWalletTransactions(prev => [{ id: `tx${Date.now()}`, type: 'CREDIT', amount: 5000, description: 'Top Up', date: new Date().toISOString(), status: 'SUCCESS' }, ...prev]);
                }} onTransfer={(email, amount) => {
                  setUser(prev => ({ ...prev, walletBalance: prev.walletBalance - amount }));
                  setWalletTransactions(prev => [{ id: `tx${Date.now()}`, type: 'DEBIT', amount: amount, description: `Transfer to ${email}`, date: new Date().toISOString(), status: 'SUCCESS' }, ...prev]);
                }} />
           </div>
         );
      case 'market':
        return <Marketplace products={products} user={user} hasAccess={true} onAddProduct={(pd, c) => {
          setUser({ ...user, walletBalance: user.walletBalance - c });
          setProducts([...products, { ...pd, id: `p${Date.now()}`, postedAt: new Date().toISOString(), expiresAt: new Date().toISOString(), purchasers: [] }]);
        }} onContact={(p) => setActiveTab('chat')} onBuyProduct={(p) => {
          setUser(prev => ({...prev, walletBalance: prev.walletBalance - p.price}));
          setProducts(prev => prev.map(item => item.id === p.id ? { ...item, purchasers: [...item.purchasers, user.id] } : item));
        }} checkLimit={() => true} />;
      case 'study':
        return <StudyHub user={user} topics={topics} onUpdateTopics={setTopics} checkLimit={() => true} hasAccess={true} onShareResult={() => {}} />;
      case 'feed':
        return <CampusFeed posts={feedPosts} user={user} onPostCreate={(content, img) => {
          setFeedPosts([{ id: `f${Date.now()}`, authorId: user.id, authorName: user.name, authorAvatar: user.avatarUrl, authorRole: user.role, authorUniversity: user.university, content, postedAt: new Date().toISOString() }, ...feedPosts]);
        }} />;
      case 'groups':
        return <Institutions user={user} groups={groups} onJoin={(id) => setGroups(groups.map(g => g.id === id ? { ...g, isJoined: true } : g))} onCreate={(n, d, i) => setGroups([...groups, { id: `g${Date.now()}`, name: n, description: d, isPrivate: false, imageUrl: i, isJoined: true, status: 'PENDING', members: [{ userId: user.id, name: user.name, avatarUrl: user.avatarUrl, role: 'PROFESSOR', joinedAt: user.joinedAt, profession: user.profession, bio: user.bio, websiteUrl: user.websiteUrl }], messages: [] }])} onSendMessage={(gid, t) => {}} onManageMember={(gid, mid, a) => {}} />;
      case 'chat':
        return <Chat sessions={chats} currentUserId={user.id} onSendMessage={(sid, txt) => {}} />;
      case 'premium':
        return <Premium user={user} onSubscribe={handleSubscribe} />;
      case 'settings':
        return <Settings user={user} onUpdatePreferences={(prefs) => setUser(prev => ({ ...prev, preferences: { ...prev.preferences, ...prefs } }))} onLogout={handleLogout} />;
      case 'faq':
        return <FAQ />;
      case 'profile':
        return <Profile user={user} joinedCampusCount={groups.filter(g => g.isJoined).length} onSubscribe={() => setActiveTab('premium')} onUpdateProfile={(u) => setUser({...user, ...u})} onNavigateToSettings={() => setActiveTab('settings')} />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  if (view === 'LANDING') return <LandingPage onGetStarted={() => setView('AUTH')} onLearnMore={() => setView('LEARN_MORE')} featuredUsers={MOCK_AMBASSADORS} />;
  if (view === 'AUTH') return <Auth onLogin={(ud) => { setUser({ ...INITIAL_USER, ...ud, joinedAt: new Date().toISOString() } as User); setView('APP'); }} onNavigateToLanding={() => setView('LANDING')} onViewTerms={() => setView('TERMS')} />;
  if (view === 'TERMS') return <TermsOfService onBack={() => setView('AUTH')} />;
  if (view === 'LEARN_MORE') return <LearnMore onBack={() => setView('LANDING')} />;

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      userRole={user.role} 
      isDarkMode={user.preferences.theme === 'dark'} 
      toggleTheme={() => setUser(prev => ({ ...prev, preferences: { ...prev.preferences, theme: prev.preferences.theme === 'dark' ? 'light' : 'dark' } }))}
      notifications={notifications}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
