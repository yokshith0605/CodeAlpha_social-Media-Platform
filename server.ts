import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Helper to extract current active user from request header
  const getCurrentUserId = (req: express.Request): string | undefined => {
    return (req.headers['x-user-id'] as string) || undefined;
  };

  // --- API Routes ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Current user / Users list
  app.get('/api/users', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const search = req.query.search as string | undefined;
      let users = db.getUsers(currentUserId);
      if (search) {
        const q = search.toLowerCase();
        users = users.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q));
      }
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get user profile
  app.get('/api/users/:id', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const user = db.getUserById(req.params.id, currentUserId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create new user
  app.post('/api/users', (req, res) => {
    try {
      const { username, name, avatar, bio, location, website, role } = req.body;
      if (!username || !name) {
        return res.status(400).json({ error: 'Username and display name are required' });
      }
      const newUser = db.createUser({ username, name, avatar, bio, location, website, role });
      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update profile
  app.put('/api/users/:id', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      if (currentUserId && currentUserId !== req.params.id) {
        return res.status(403).json({ error: 'Cannot edit another user profile' });
      }
      const updatedUser = db.updateUser(req.params.id, req.body);
      res.json(updatedUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Toggle follow user
  app.post('/api/users/:id/follow', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      if (!currentUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const result = db.toggleFollow(currentUserId, req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get user followers
  app.get('/api/users/:id/followers', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const followers = db.getFollowers(req.params.id, currentUserId);
      res.json(followers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get user following
  app.get('/api/users/:id/following', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const following = db.getFollowing(req.params.id, currentUserId);
      res.json(following);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Posts Feed
  app.get('/api/posts', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const feed = (req.query.feed as 'foryou' | 'following' | 'explore') || 'foryou';
      const userId = req.query.userId as string | undefined;
      const tag = req.query.tag as string | undefined;
      const search = req.query.search as string | undefined;
      const bookmarks = req.query.bookmarks === 'true';

      let posts = db.getPosts({
        feed,
        userId,
        tag,
        search,
        currentUserId,
      });

      if (bookmarks && currentUserId) {
        posts = posts.filter(p => p.bookmarkedBy.includes(currentUserId));
      }

      res.json(posts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Single post
  app.get('/api/posts/:id', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const post = db.getPostById(req.params.id, currentUserId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create post
  app.post('/api/posts', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const { content, image, tags, authorId } = req.body;
      const effectiveAuthorId = authorId || currentUserId;

      if (!effectiveAuthorId) {
        return res.status(400).json({ error: 'Author is required' });
      }
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Post content cannot be empty' });
      }

      const newPost = db.createPost({
        authorId: effectiveAuthorId,
        content,
        image,
        tags,
      });
      res.status(201).json(newPost);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete post
  app.delete('/api/posts/:id', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      if (!currentUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const success = db.deletePost(req.params.id, currentUserId);
      if (!success) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ success: true, deletedPostId: req.params.id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Like post
  app.post('/api/posts/:id/like', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      if (!currentUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const result = db.toggleLikePost(req.params.id, currentUserId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Bookmark post
  app.post('/api/posts/:id/bookmark', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      if (!currentUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const result = db.toggleBookmarkPost(req.params.id, currentUserId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Comments for post
  app.get('/api/posts/:id/comments', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const comments = db.getComments(req.params.id, currentUserId);
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add comment
  app.post('/api/posts/:id/comments', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      const { content, authorId } = req.body;
      const effectiveAuthorId = authorId || currentUserId;

      if (!effectiveAuthorId) {
        return res.status(401).json({ error: 'Author is required' });
      }
      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Comment content cannot be empty' });
      }

      const newComment = db.createComment({
        postId: req.params.id,
        authorId: effectiveAuthorId,
        content,
      });
      res.status(201).json(newComment);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Like comment
  app.post('/api/comments/:id/like', (req, res) => {
    try {
      const currentUserId = getCurrentUserId(req);
      if (!currentUserId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const result = db.toggleLikeComment(req.params.id, currentUserId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Trending & Recommended
  app.get('/api/trending', (_req, res) => {
    try {
      const trending = db.getTrending();
      res.json(trending);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Static & Frontend Mounting ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pulse Social server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
