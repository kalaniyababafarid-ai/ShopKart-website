export type UserRole = 'customer' | 'admin';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  addresses: Address[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  banner?: string;
  isFeatured?: boolean;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  isFeatured?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes: {
    size?: string;
    color?: string;
    ram?: string;
    storage?: string;
    [key: string]: string | undefined;
  };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  categoryId: string;
  subCategoryId?: string;
  brandId: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  stock: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isDeal: boolean;
  dealEndsAt?: string;
  tags: string[];
  images: string[];
  specs: Record<string, string>;
  variants: ProductVariant[];
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  variantId?: string;
  quantityChange: number;
  type: 'sale' | 'restock' | 'return' | 'adjustment';
  reason: string;
  previousStock: number;
  newStock: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxStock: number;
  attributes?: Record<string, string | undefined>;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionToken?: string;
  items: CartItem[];
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'cod';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
  attributes?: Record<string, string | undefined>;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  comments: string;
  requestType: 'return' | 'refund' | 'replacement';
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  adminNotes?: string;
  refundAmount?: number;
  replacementTrackingNumber?: string;
  replacementCarrier?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  shippingMethod: {
    id: string;
    name: string;
    estimatedDays: string;
    cost: number;
  };
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  trackingNumber?: string;
  trackingCarrier?: string;
  returnRequest?: ReturnRequest;
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  replies: Array<{
    id: string;
    sender: 'customer' | 'support';
    senderName: string;
    message: string;
    createdAt: string;
  }>;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface SiteBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  link: string;
  buttonText: string;
  badge?: string;
  isActive: boolean;
}

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // e.g. 0.08 for 8%
  freeShippingThreshold: number; // e.g. 50
  standardShippingFee: number; // e.g. 5.99
  expressShippingFee: number; // e.g. 14.99
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  author: string;
  authorAvatar: string;
  readTime: string;
  isPublished: boolean;
  publishedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'security' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}
