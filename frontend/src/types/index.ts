export type UserRole = 'client' | 'freelancer' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  bio?: string;
  status: 'active' | 'suspended';
  walletBalance: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PortfolioItem {
  _id?: string;
  title: string;
  description: string;
  image?: string;
  projectUrl?: string;
  tags?: string[];
  completedAt?: string;
}

export interface FreelancerProfile {
  _id: string;
  user: User | string;
  headline: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  availability: 'available' | 'busy' | 'not_available';
  languages: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  portfolio: PortfolioItem[];
  ratingAvg: number;
  ratingCount: number;
  completedOrdersCount: number;
  earningsTotal: number;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  servicesCount?: number;
}

export interface Service {
  _id: string;
  freelancer: User;
  title: string;
  description: string;
  category: Category;
  skills: string[];
  pricingType: 'fixed' | 'starting_at';
  price: number;
  deliveryTimeDays: number;
  revisionsAllowed: number;
  coverImage: string;
  galleryImages: string[];
  status: 'published' | 'draft' | 'paused';
  ratingAvg: number;
  ratingCount: number;
  ordersCount: number;
  createdAt: string;
}

export interface Project {
  _id: string;
  client: User;
  title: string;
  description: string;
  category: Category;
  skills: string[];
  budgetType: 'fixed' | 'hourly';
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  attachments?: Array<{ name: string; url: string; fileType?: string }>;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  hiredFreelancer?: User | null;
  acceptedProposal?: string | null;
  proposalsCount: number;
  createdAt: string;
  myProposal?: Proposal | null;
}

export interface Proposal {
  _id: string;
  project: Project | string;
  freelancer: User;
  freelancerProfile?: FreelancerProfile;
  coverLetter: string;
  bidAmount: number;
  deliveryTimeDays: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}

export type OrderStatus = 'in_progress' | 'delivered' | 'revision_requested' | 'completed' | 'cancelled';
export type PaymentStatus = 'escrow_held' | 'released' | 'refunded';

export interface OrderStatusHistoryItem {
  _id: string;
  order: string;
  fromStatus: string;
  toStatus: string;
  changedBy: User;
  notes: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  client: User;
  freelancer: User;
  service?: Service | null;
  project?: Project | null;
  proposal?: Proposal | null;
  title: string;
  agreedPrice: number;
  deadline: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  deliveryNotes?: string;
  deliveryFiles?: Array<{ name: string; url: string; size?: number; uploadedAt: string }>;
  revisionNotes?: string;
  revisionCount: number;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  history?: OrderStatusHistoryItem[];
  createdAt: string;
}

export interface Review {
  _id: string;
  order: string | Order;
  service?: string | Service;
  client: User;
  freelancer: string | User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  recipient: User;
  text: string;
  attachments?: Array<{ name: string; url: string; fileType?: string; size?: number }>;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  otherParticipant?: User;
  project?: Project;
  order?: Order;
  lastMessage: string;
  lastMessageSender?: User;
  lastMessageAt: string;
  unreadCount?: number;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender?: User;
  type:
    | 'proposal_received'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'order_created'
    | 'order_delivered'
    | 'revision_requested'
    | 'order_completed'
    | 'order_cancelled'
    | 'review_received'
    | 'message_received'
    | 'payment_released'
    | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SmartMatch {
  freelancer: {
    _id: string;
    name: string;
    avatar: string;
    headline: string;
    bio: string;
    skills: string[];
    hourlyRate: number;
    availability: string;
    ratingAvg: number;
    ratingCount: number;
    completedOrdersCount: number;
  };
  matchScore: number;
  matchReasons: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
}
