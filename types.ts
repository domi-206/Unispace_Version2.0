
export enum UserRole {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT'
}

export enum UserTier {
  STARTER = 'Starter',
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  DIAMOND = 'Diamond',
  PLATINUM = 'Platinum'
}

export type UnlockedPerk = 'PODCAST' | 'EXAM_SOLVER' | 'SUMMARIZER' | 'FLASH_DOCS';

export type SubscriptionPlan = 
  | 'FREE' 
  | 'PLAN_STUDY_BASIC' 
  | 'PLAN_STUDY_STANDARD' 
  | 'PLAN_STUDY_PREMIUM'
  | 'PASS_24H_STUDY';

export interface UserPreferences {
  font: 'Inter' | 'Serif' | 'Mono';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  theme: 'light' | 'dark' | 'system';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  isCampusLeader?: boolean;
  avatarUrl: string;
  bio: string;
  university: string;
  walletBalance: number;
  
  // Professional Profile (LinkedIn style)
  profession?: string;
  workPlace?: string;
  websiteUrl?: string;
  careerInterests?: string[];
  
  tier: UserTier;
  unlockedPerks: UnlockedPerk[];
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: string;
  passExpiry?: string;
  weeklyUploads: number;
  weeklyQuizzes: number;
  weeklyAiQueries: number;
  weeklyMarketPosts: number;
  lastWeeklyReset: string;

  referralCode: string;
  referralCount: number;
  joinedAt: string; // ISO Date
  interests?: string[];
  portfolioUrl?: string;
  businessEmail?: string;
  hideCampusCount?: boolean;
  banExpiresAt?: string;
  reportsCount: number;
  isBanned: boolean;
  blockedUsers: string[];
  
  preferences: UserPreferences;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  referenceText?: string;
  pageNumber?: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  isCompleted?: boolean;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorUniversity: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  postedAt: string;
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
  digitalFileUrl?: string;
  postedAt: string;
  expiresAt: string;
  purchasers: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  productTitle?: string;
  productImage?: string;
  role?: CampusRole;
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

export type CampusRole = 'PROFESSOR' | 'COURSE_REP' | 'STUDENT';
export type InstitutionStatus = 'ACTIVE' | 'PENDING' | 'BANNED';

export interface CampusMember {
  userId: string;
  name: string;
  avatarUrl: string;
  role: CampusRole;
  joinedAt: string;
  // Professional fields for preview
  profession?: string;
  workPlace?: string;
  bio?: string;
  websiteUrl?: string;
}

export interface InstitutionGroup {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  imageUrl: string;
  isJoined: boolean;
  status: InstitutionStatus;
  members: CampusMember[];
  messages: any[];
}

export interface QuizConfig {
  numQuestions: number;
  isTimed: boolean;
  timePerQuestion: number;
  totalSessionTime: number;
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  strengths: string;
  weaknesses: string;
  feedback: string;
}

export interface SubQuestion {
  id: string;
  text: string;
  keywords: string[];
  referenceText: string;
  pageNumber: number;
}

export interface TheorySection {
  id: string;
  title: string;
  mainQuestion: string;
  subQuestions: SubQuestion[];
  isCompulsory: boolean;
}

export interface GradedAnswer {
  subId: string;
  score: number;
  feedback: string;
  keywordsFound: string[];
}

export interface ExamResult {
  score: number;
  passed: boolean;
  strengths: string;
  weaknesses: string;
  feedback: string;
  gradedAnswers: GradedAnswer[];
  total: number;
  maxScore: number;
  passingScore: number;
}

export interface ExamConfig {
  totalQuestions: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  timeLimit: number;
}

export enum MarketplaceDurationUnit {
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS'
}
