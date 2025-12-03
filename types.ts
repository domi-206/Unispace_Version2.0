
export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  avatarUrl: string;
  bio: string;
  university: string;
  walletBalance: number;
  isPremium: boolean;
  premiumExpiry?: number;
  referralCode: string;
  referralCount: number;
  joinedAt: string; // ISO Date for trial logic
  interests?: string[];
  portfolioUrl?: string;
  businessEmail?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  postedAt: string;
  expiresAt: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  strengths: string[];
  weaknesses: string[];
  keyTerms: string[];
  passed: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  lastScore?: number;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  likes: number;
  comments: number;
  postedAt: string;
  isQuizResult?: boolean;
  quizScore?: number;
}

export interface ProfileViewer {
  id: string;
  name: string;
  avatarUrl: string;
  viewedAt: string;
}

export enum MarketplaceDurationUnit {
  DAYS = 'Days',
  WEEKS = 'Weeks',
  MONTHS = 'Months'
}

export interface QuizConfig {
  numQuestions: number;
  isTimed: boolean;
  timePerQuestion: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  productId?: string;
  productTitle?: string;
  productImage?: string;
}

export interface ChatSession {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface InstitutionGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  imageUrl: string;
  isJoined?: boolean;
}
