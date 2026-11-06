import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth } from '../auth';
import { ContactMessage, NewsletterSubscriber, SupportTicket } from '../types';

const router = Router();

// Public contact form
router.post('/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    return;
  }

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  db.mutate((d) => {
    d.contactMessages.unshift(newMessage);
  });

  res.status(201).json({
    message: 'Thank you! Your message has been received by our concierge team. We will respond within 24 hours.',
    ticketId: newMessage.id,
  });
});

// Newsletter subscribe
router.post('/newsletter/subscribe', (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const database = db.get();
  const existing = database.newsletterSubscribers.find((s) => s.email === cleanEmail);

  if (existing) {
    res.json({ message: 'You are already subscribed to the Shopkart newsletter with VIP discount access!' });
    return;
  }

  const newSub: NewsletterSubscriber = {
    id: `sub-${Date.now()}`,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    isActive: true,
  };

  db.mutate((d) => {
    d.newsletterSubscribers.push(newSub);
  });

  res.status(201).json({
    message: 'Welcome to Shopkart Insider! Check your inbox for your 10% welcome coupon (WELCOME10).',
  });
});

// Customer Support Tickets
router.get('/tickets', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const database = db.get();
  const tickets = database.supportTickets
    .filter((t) => t.userId === req.user!.id || t.customerEmail === req.user!.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ tickets });
});

// Create Support Ticket
router.post('/tickets', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { subject, category, message, priority = 'medium' } = req.body;

  if (!subject || !category || !message) {
    res.status(400).json({ error: 'Subject, category, and message are required.' });
    return;
  }

  const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const newTicket: SupportTicket = {
    id: `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ticketNumber,
    userId: req.user!.id,
    customerName: req.user!.name,
    customerEmail: req.user!.email,
    subject: subject.trim(),
    category: category.trim(),
    message: message.trim(),
    status: 'open',
    priority,
    replies: [],
    createdAt: new Date().toISOString(),
  };

  db.mutate((d) => {
    d.supportTickets.unshift(newTicket);
  });

  res.status(201).json({
    message: 'Support ticket submitted. A customer advocate has been assigned.',
    ticket: newTicket,
  });
});

// Reply to Ticket
router.post('/tickets/:id/reply', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Reply message cannot be empty.' });
    return;
  }

  const updatedTicket = db.mutate((d) => {
    const t = d.supportTickets.find(
      (item) => item.id === id && (item.userId === req.user!.id || req.user!.role === 'admin')
    );
    if (!t) return null;

    t.replies.push({
      id: `rep-${Date.now()}`,
      sender: req.user!.role === 'admin' ? 'support' : 'customer',
      senderName: req.user!.name,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });

    if (req.user!.role === 'admin') {
      t.status = 'in_progress';
    } else {
      t.status = 'open';
    }

    return t;
  });

  if (!updatedTicket) {
    res.status(404).json({ error: 'Support ticket not found.' });
    return;
  }

  res.json({ message: 'Reply sent successfully.', ticket: updatedTicket });
});

// Categories list
router.get('/categories', (_req: Request, res: Response) => {
  const database = db.get();
  const withCounts = database.categories.map((c) => {
    const count = database.products.filter((p) => p.categoryId === c.id).length;
    const subs = database.subCategories.filter((s) => s.categoryId === c.id);
    return { ...c, productCount: count, subCategories: subs };
  });
  res.json({ categories: withCounts });
});

// SubCategories list
router.get('/subcategories', (_req: Request, res: Response) => {
  const database = db.get();
  res.json({ subCategories: database.subCategories });
});

// Brands list
router.get('/brands', (_req: Request, res: Response) => {
  const database = db.get();
  const withCounts = database.brands.map((b) => {
    const count = database.products.filter((p) => p.brandId === b.id).length;
    return { ...b, productCount: count };
  });
  res.json({ brands: withCounts });
});

// Site Settings & Banners
router.get('/site/settings', (_req: Request, res: Response) => {
  const database = db.get();
  res.json({
    settings: database.settings,
    banners: database.banners.filter((b) => b.isActive),
  });
});

export default router;
