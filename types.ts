
export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT'
}

export type SubscriptionPlan = 
  | 'FREE' 
  | 'PLAN_STUDY_BASIC' 
  | 'PLAN_STUDY_STANDARD' 
  | 'PLAN_STUDY_PREMIUM'
  | 'PLAN_MERCHANT_BASIC' 
  | 'PLAN_MERCHANT_STANDARD' 
  | 'PLAN_MERCHANT_PREMIUM';

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
  
  // Subscription & Usage
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: string;
  weeklyUploads: number;
  weeklyQuizzes: number;
  weeklyAiQueries: number;
  weeklyMarketPosts: number;
  lastWeeklyReset: string; // ISO Date

  referralCode: string;
  referralCount: number;
  joinedAt: string; // ISO Date for trial logic
  interests?: string[];
  portfolioUrl?: string;
  businessEmail?: string;
  hideCampusCount?: boolean;
  banExpiresAt?: string; // Date string
  // Safety & Moderation
  reportsCount: number;
  isBanned: boolean;
  blockedUsers: string[]; // List of IDs
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
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
  digitalFileUrl?: string; // URL for PDF/Digital items
  purchasers: string[]; // List of User IDs who bought this
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
  imageUrl?: string;
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

// Campus / Institutions Types

export type CampusRole = 'PROFESSOR' | 'COURSE_REP' | 'STUDENT';

export interface CampusMember {
  userId: string;
  name: string;
  avatarUrl: string;
  role: CampusRole;
  joinedAt: string;
}

export interface CampusMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  role: CampusRole;
  text: string;
  timestamp: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // List of User IDs who voted
}

export interface CampusPoll {
  id: string;
  creatorId: string;
  question: string;
  options: PollOption[];
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface InstitutionGroup {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  imageUrl: string;
  isJoined?: boolean;
  members: CampusMember[];
  messages: CampusMessage[];
  polls?: CampusPoll[];
  status: 'ACTIVE' | 'PENDING';
}

// AI Engine Types

export interface SolverResult {
  markdownText: string; // The full formatted text response
}

export interface Flashcard {
  term: string; // The "Q: ..." part
  definition: string; // The "A: ..." part
}

export interface SummaryResult {
  markdownText: string; // The structured topic-by-topic summary
}
