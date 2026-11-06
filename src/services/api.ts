import {
  User,
  Category,
  SubCategory,
  Brand,
  Product,
  ProductFacets,
  Cart,
  Coupon,
  Order,
  Review,
  Address,
  SupportTicket,
  SiteBanner,
  SiteSettings,
  BlogPost,
  UserNotification,
} from '../types';

const TOKEN_KEY = 'shopkart_auth_token';
const CART_TOKEN_KEY = 'shopkart_cart_session_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getCartSessionToken(): string {
  let token = localStorage.getItem(CART_TOKEN_KEY);
  if (!token) {
    token = `gst-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(CART_TOKEN_KEY, token);
  }
  return token;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const cartToken = getCartSessionToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-cart-token': cartToken,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: User; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (details: { name: string; email: string; password: string; phone?: string }) =>
      request<{ token: string; user: User; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(details),
      }),

    getProfile: () => request<{ user: User }>('/api/auth/me'),

    updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
      request<{ user: User; message: string }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    addAddress: (address: Omit<Address, 'id'>) =>
      request<{ message: string; addresses: Address[] }>('/api/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      }),

    updateAddress: (id: string, address: Partial<Address>) =>
      request<{ message: string; addresses: Address[] }>(`/api/auth/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(address),
      }),

    deleteAddress: (id: string) =>
      request<{ message: string; addresses: Address[] }>(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
      }),

    setDefaultAddress: (id: string) =>
      request<{ message: string; addresses: Address[] }>(`/api/auth/addresses/${id}/default`, {
        method: 'PUT',
      }),

    changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwords),
      }),

    forgotPassword: (email: string) =>
      request<{ message: string; resetPin?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (payload: { email: string; resetPin: string; newPassword: string }) =>
      request<{ message: string; token: string; user: User }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Products
  products: {
    list: (params: Record<string, string | number | boolean | undefined> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const query = searchParams.toString();
      return request<{
        products: Product[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
        facets?: ProductFacets;
      }>(`/api/products${query ? `?${query}` : ''}`);
    },

    getDetail: (idOrSlug: string) =>
      request<{
        product: Product;
        category?: Category;
        brand?: Brand;
        related: Product[];
        reviews: Review[];
        ratingDistribution: Record<number, number>;
      }>(`/api/products/${idOrSlug}`),
  },

  // Cart
  cart: {
    get: () => request<{ cart: Cart }>('/api/cart'),

    addItem: (item: { productId: string; variantId?: string; quantity?: number }) =>
      request<{ cart: Cart; message: string }>('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify(item),
      }),

    updateQuantity: (item: { productId: string; variantId?: string; quantity: number }) =>
      request<{ cart: Cart; message: string }>('/api/cart/update', {
        method: 'PUT',
        body: JSON.stringify(item),
      }),

    removeItem: (productId: string, variantId?: string) =>
      request<{ cart: Cart; message: string }>(
        `/api/cart/item/${productId}${variantId ? `?variantId=${variantId}` : ''}`,
        { method: 'DELETE' }
      ),

    clear: () => request<{ cart: Cart; message: string }>('/api/cart/clear', { method: 'DELETE' }),

    mergeGuestCart: (guestToken: string) =>
      request<{ cart: Cart; message: string }>('/api/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ guestToken }),
      }),
  },

  // Wishlist
  wishlist: {
    get: () => request<{ wishlist: Product[]; count: number }>('/api/cart/wishlist'),
    toggle: (productId: string) =>
      request<{ message: string; isInWishlist: boolean; count: number }>('/api/cart/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }),
  },

  // Coupons
  coupons: {
    list: () => request<{ coupons: Coupon[] }>('/api/coupons'),
    validate: (code: string, subtotal: number) =>
      request<{
        valid: boolean;
        code: string;
        description: string;
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        discount: number;
      }>('/api/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      }),
  },

  // Orders & Checkout
  orders: {
    calculate: (data: { items: any[]; couponCode?: string; shippingMethodId?: string }) =>
      request<{
        subtotal: number;
        discount: number;
        shippingFee: number;
        tax: number;
        total: number;
        currencySymbol: string;
      }>('/api/orders/calculate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    create: (orderPayload: any) =>
      request<{ message: string; order: Order }>('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      }),

    list: () => request<{ orders: Order[] }>('/api/orders'),

    get: (id: string) => request<{ order: Order }>(`/api/orders/${id}`),

    cancel: (id: string, reason?: string) =>
      request<{ message: string; order: Order }>(`/api/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    requestReturn: (id: string, data: { reason: string; comments: string; requestType: string }) =>
      request<{ message: string; order: Order }>(`/api/orders/${id}/return`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Reviews
  reviews: {
    submit: (productId: string, data: { rating: number; title: string; comment: string }) =>
      request<{ message: string; review: Review }>(`/api/reviews/product/${productId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    markHelpful: (reviewId: string) =>
      request<{ message: string; helpfulCount: number }>(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      }),
  },

  // Support & Metadata
  support: {
    getCategories: () => request<{ categories: Category[] }>('/api/support/categories'),
    getSubCategories: () => request<{ subCategories: SubCategory[] }>('/api/support/subcategories'),
    getBrands: () => request<{ brands: Brand[] }>('/api/support/brands'),
    getSiteInfo: () => request<{ settings: SiteSettings; banners: SiteBanner[] }>('/api/support/site/settings'),
    contact: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
      request<{ message: string; ticketId: string }>('/api/support/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    subscribeNewsletter: (email: string) =>
      request<{ message: string }>('/api/support/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    getTickets: () => request<{ tickets: SupportTicket[] }>('/api/support/tickets'),
    createTicket: (data: { subject: string; category: string; message: string; priority?: string }) =>
      request<{ message: string; ticket: SupportTicket }>('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    replyTicket: (ticketId: string, message: string) =>
      request<{ message: string; ticket: SupportTicket }>(`/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },

  // Admin
  admin: {
    getDashboard: () =>
      request<{
        metrics: {
          totalRevenue: number;
          totalOrders: number;
          totalCustomers: number;
          lowStockCount: number;
          outOfStockCount: number;
          pendingReturns: number;
        };
        statusCounts: Record<string, number>;
        topProducts: Array<{ title: string; count: number; revenue: number; image: string }>;
        categorySales: Record<string, number>;
        recentOrders: Order[];
        lowStockProducts: Product[];
      }>('/api/admin/dashboard'),

    getOrders: (params: { status?: string; q?: string; page?: number } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append('status', params.status);
      if (params.q) searchParams.append('q', params.q);
      if (params.page) searchParams.append('page', String(params.page));
      return request<{ orders: Order[]; pagination: any }>(`/api/admin/orders?${searchParams.toString()}`);
    },

    updateOrderStatus: (id: string, data: { status: string; trackingNumber?: string; trackingCarrier?: string; note?: string }) =>
      request<{ message: string; order: Order }>(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getReturns: () => request<{ returns: Order[] }>('/api/admin/returns'),

    handleReturn: (id: string, data: { action: 'approve' | 'reject' | 'complete'; adminNotes?: string }) =>
      request<{ message: string; order: Order }>(`/api/admin/returns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getProducts: () => request<{ products: Product[] }>('/api/admin/products'),

    createProduct: (data: any) =>
      request<{ message: string; product: Product }>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateProduct: (id: string, data: any) =>
      request<{ message: string; product: Product }>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteProduct: (id: string) =>
      request<{ message: string }>(`/api/admin/products/${id}`, { method: 'DELETE' }),

    getInventory: () =>
      request<{
        products: Array<{ id: string; title: string; sku: string; stock: number; lowStockThreshold: number; status: string; variants: any[] }>;
        recentMovements: any[];
      }>('/api/admin/inventory'),

    adjustInventory: (data: { productId: string; variantId?: string; quantityAdjustment: number; reason: string }) =>
      request<{ message: string; result: any }>('/api/admin/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getCoupons: () => request<{ coupons: Coupon[] }>('/api/admin/coupons'),

    createCoupon: (data: any) =>
      request<{ message: string; coupon: Coupon }>('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateCoupon: (id: string, data: any) =>
      request<{ message: string; coupon: Coupon }>(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteCoupon: (id: string) =>
      request<{ message: string }>(`/api/admin/coupons/${id}`, { method: 'DELETE' }),

    createCategory: (data: any) =>
      request<{ message: string; category: Category }>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    createBrand: (data: any) =>
      request<{ message: string; brand: Brand }>('/api/admin/brands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getUsers: () => request<{ users: any[] }>('/api/admin/users'),

    getTickets: () => request<{ tickets: SupportTicket[] }>('/api/admin/tickets'),

    replyTicket: (id: string, data: { status?: string; replyMessage?: string }) =>
      request<{ message: string; ticket: SupportTicket }>(`/api/admin/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getMessages: () => request<{ messages: any[] }>('/api/admin/messages'),

    getSubscribers: () => request<{ subscribers: any[] }>('/api/admin/subscribers'),

    updateSettings: (settings: Partial<SiteSettings>) =>
      request<{ message: string; settings: SiteSettings }>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),

    // Admin Blog
    getBlogPosts: () => request<{ posts: BlogPost[] }>('/api/admin/blog'),
    createBlogPost: (data: Partial<BlogPost>) =>
      request<{ message: string; post: BlogPost }>('/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateBlogPost: (id: string, data: Partial<BlogPost>) =>
      request<{ message: string; post: BlogPost }>(`/api/admin/blog/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteBlogPost: (id: string) =>
      request<{ message: string }>(`/api/admin/blog/${id}`, { method: 'DELETE' }),

    // Admin Reviews
    getReviews: () =>
      request<{ reviews: Array<Review & { productTitle: string; productImage: string }> }>('/api/admin/reviews'),
    deleteReview: (id: string) =>
      request<{ message: string }>(`/api/admin/reviews/${id}`, { method: 'DELETE' }),

    // Admin Banners
    getBanners: () => request<{ banners: SiteBanner[] }>('/api/admin/banners'),
    createBanner: (data: Partial<SiteBanner>) =>
      request<{ message: string; banner: SiteBanner }>('/api/admin/banners', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateBanner: (id: string, data: Partial<SiteBanner>) =>
      request<{ message: string; banner: SiteBanner }>(`/api/admin/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteBanner: (id: string) =>
      request<{ message: string }>(`/api/admin/banners/${id}`, { method: 'DELETE' }),

    // Admin Subcategories
    createSubCategory: (data: { categoryId: string; name: string; description?: string }) =>
      request<{ message: string; subCategory: SubCategory }>('/api/admin/subcategories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteSubCategory: (id: string) =>
      request<{ message: string }>(`/api/admin/subcategories/${id}`, { method: 'DELETE' }),

    // User Role Toggle
    updateUserRole: (id: string, role: 'customer' | 'admin') =>
      request<{ message: string; user: { id: string; email: string; role: string } }>(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),

    // Forensic Image & Catalog Audit
    getImageAudit: () =>
      request<{
        summary: {
          totalProductsAudited: number;
          verifiedMatchingImages: number;
          duplicateImageAssignments: number;
          brokenImageUrls: number;
          missingImages: number;
          productsRequiringManualVerification: number;
          isValid: boolean;
          lastAuditedAt: string;
        };
        validation: any;
        duplicateSignatures: Array<{ signature: string; skus: string[] }>;
        products: Array<{
          id: string;
          sku: string;
          title: string;
          category: string;
          brand: string;
          primaryImage: string;
          galleryCount: number;
          signature: string;
          status: 'verified' | 'flagged';
        }>;
      }>('/api/admin/audit/images'),
  },

  // Public Blog
  blog: {
    list: (params: { category?: string; tag?: string; q?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.category) q.append('category', params.category);
      if (params.tag) q.append('tag', params.tag);
      if (params.q) q.append('q', params.q);
      const queryStr = q.toString();
      return request<{ posts: BlogPost[] }>(`/api/blog${queryStr ? `?${queryStr}` : ''}`);
    },
    getDetail: (slugOrId: string) =>
      request<{ post: BlogPost; related: BlogPost[] }>(`/api/blog/${slugOrId}`),
  },

  // User Notifications
  notifications: {
    list: () => request<{ notifications: UserNotification[]; unreadCount: number }>('/api/notifications'),
    markRead: (id: string) =>
      request<{ message: string; notification: UserNotification }>(`/api/notifications/${id}/read`, {
        method: 'PUT',
      }),
    markAllRead: () => request<{ message: string }>('/api/notifications/read-all', { method: 'PUT' }),
  },
};
