import { Router, Request, Response } from 'express';
import { db } from '../db';
import { BlogPost } from '../types';

const router = Router();

// Public: List published blog posts
router.get('/', (req: Request, res: Response) => {
  const { category, tag, q } = req.query;
  const database = db.get();
  let posts = (database.blogPosts || []).filter((p) => p.isPublished);

  if (category && typeof category === 'string' && category !== 'all') {
    posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (tag && typeof tag === 'string') {
    posts = posts.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
  }

  if (q && typeof q === 'string') {
    const term = q.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term)
    );
  }

  // Sort newest first
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  res.json({ posts });
});

// Public: Get single blog post by slug or ID
router.get('/:slugOrId', (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const database = db.get();
  const post = (database.blogPosts || []).find(
    (p) => (p.slug === slugOrId || p.id === slugOrId) && p.isPublished
  );

  if (!post) {
    res.status(404).json({ error: 'Blog post not found.' });
    return;
  }

  // Related posts in same category
  const related = (database.blogPosts || [])
    .filter((p) => p.id !== post.id && p.isPublished && p.category === post.category)
    .slice(0, 3);

  res.json({ post, related });
});

export default router;
