import { Router, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAuth } from '../auth';

const router = Router();
router.use(requireAuth);

// Get current user's notifications
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const database = db.get();
  const userNotifs = (database.notifications || [])
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  res.json({
    notifications: userNotifs,
    unreadCount,
  });
});

// Mark single notification as read
router.put('/:id/read', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const updated = db.mutate((d) => {
    const notif = (d.notifications || []).find((n) => n.id === id && n.userId === userId);
    if (!notif) return null;
    notif.isRead = true;
    return notif;
  });

  if (!updated) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }

  res.json({ message: 'Notification marked as read.', notification: updated });
});

// Mark all as read
router.put('/read-all', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  db.mutate((d) => {
    (d.notifications || []).forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
  });

  res.json({ message: 'All notifications marked as read.' });
});

export default router;
