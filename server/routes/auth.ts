import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { AuthenticatedRequest, createToken, requireAuth } from '../auth';
import { Address, User } from '../types';

const router = Router();

function safeUser(user: User) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// Register
router.post('/register', (req, res: Response) => {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, password, and name are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const database = db.get();
  const existing = database.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: email.trim().toLowerCase(),
    passwordHash,
    name: name.trim(),
    role: 'customer',
    phone: phone?.trim(),
    isVerified: true,
    addresses: [],
    createdAt: new Date().toISOString(),
  };

  db.mutate((d) => {
    d.users.push(newUser);
  });

  const token = createToken(newUser);
  res.status(201).json({
    message: 'Account successfully registered.',
    token,
    user: safeUser(newUser),
  });
});

// Login
router.post('/login', (req, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const database = db.get();
  const user = database.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password credentials.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid email or password credentials.' });
    return;
  }

  const token = createToken(user);
  res.json({
    message: 'Authentication successful.',
    token,
    user: safeUser(user),
  });
});

// Current user profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: safeUser(req.user!) });
});

// Update profile details
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, phone, avatar } = req.body;
  const userId = req.user!.id;

  const updatedUser = db.mutate((d) => {
    const user = d.users.find((u) => u.id === userId);
    if (!user) return null;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    return user;
  });

  if (!updatedUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({ message: 'Profile updated successfully.', user: safeUser(updatedUser) });
});

// Add Address
router.post('/addresses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;

  if (!fullName || !phone || !street || !city || !state || !postalCode) {
    res.status(400).json({ error: 'All address fields are required.' });
    return;
  }

  const newAddress: Address = {
    id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fullName: fullName.trim(),
    phone: phone.trim(),
    street: street.trim(),
    city: city.trim(),
    state: state.trim(),
    postalCode: postalCode.trim(),
    country: (country || 'United States').trim(),
    isDefault: !!isDefault,
  };

  const updatedUser = db.mutate((d) => {
    const user = d.users.find((u) => u.id === req.user!.id);
    if (!user) return null;

    if (newAddress.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    return user;
  });

  res.status(201).json({ message: 'Address saved.', addresses: updatedUser?.addresses || [] });
});

// Update Address
router.put('/addresses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;

  const updatedUser = db.mutate((d) => {
    const user = d.users.find((u) => u.id === req.user!.id);
    if (!user) return null;

    const address = user.addresses.find((a) => a.id === id);
    if (!address) return null;

    if (fullName) address.fullName = fullName.trim();
    if (phone) address.phone = phone.trim();
    if (street) address.street = street.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (postalCode) address.postalCode = postalCode.trim();
    if (country) address.country = country.trim();

    if (isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }

    return user;
  });

  if (!updatedUser) {
    res.status(404).json({ error: 'Address not found.' });
    return;
  }

  res.json({ message: 'Address updated.', addresses: updatedUser.addresses });
});

// Delete Address
router.delete('/addresses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const updatedUser = db.mutate((d) => {
    const user = d.users.find((u) => u.id === req.user!.id);
    if (!user) return null;

    const wasDefault = user.addresses.find((a) => a.id === id)?.isDefault;
    user.addresses = user.addresses.filter((a) => a.id !== id);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    return user;
  });

  if (!updatedUser) {
    res.status(404).json({ error: 'Address not found.' });
    return;
  }

  res.json({ message: 'Address deleted.', addresses: updatedUser.addresses });
});

// Set default address
router.put('/addresses/:id/default', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const updatedUser = db.mutate((d) => {
    const user = d.users.find((u) => u.id === req.user!.id);
    if (!user) return null;

    user.addresses.forEach((a) => {
      a.isDefault = a.id === id;
    });

    return user;
  });

  res.json({ message: 'Default address updated.', addresses: updatedUser?.addresses || [] });
});

// Change Password
router.post('/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Both current password and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const database = db.get();
  const user = database.users.find((u) => u.id === req.user!.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isMatch) {
    res.status(400).json({ error: 'The current password you provided is incorrect.' });
    return;
  }

  db.mutate((d) => {
    const u = d.users.find((item) => item.id === req.user!.id);
    if (u) {
      u.passwordHash = bcrypt.hashSync(newPassword, 10);
    }
  });

  res.json({ message: 'Password has been updated securely.' });
});

// Forgot Password
router.post('/forgot-password', (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required.' });
    return;
  }

  const database = db.get();
  const user = database.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    res.json({
      message: 'If an account exists with that email, a password reset PIN has been dispatched.',
      resetPin: '782910',
    });
    return;
  }

  res.json({
    message: 'Password reset link and security verification PIN sent to your email.',
    resetPin: '782910',
  });
});

// Reset Password with PIN
router.post('/reset-password', (req, res: Response) => {
  const { email, resetPin, newPassword } = req.body;

  if (!email || !resetPin || !newPassword) {
    res.status(400).json({ error: 'Email, verification PIN, and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  if (resetPin !== '782910') {
    res.status(400).json({ error: 'Invalid or expired verification PIN. Please request a new PIN.' });
    return;
  }

  const database = db.get();
  const user = database.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    res.status(404).json({ error: 'No account found with this email address.' });
    return;
  }

  const updatedUser = db.mutate((d) => {
    const u = d.users.find((item) => item.id === user.id);
    if (!u) return null;
    u.passwordHash = bcrypt.hashSync(newPassword, 10);
    return u;
  });

  if (!updatedUser) {
    res.status(500).json({ error: 'Failed to reset password.' });
    return;
  }

  const token = createToken(updatedUser);
  res.json({
    message: 'Password successfully reset! You are now securely signed in.',
    token,
    user: safeUser(updatedUser),
  });
});

export default router;
