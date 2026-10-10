import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Post, Comment, Follow, TrendingTag } from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'social_db.json');

export interface DatabaseSchema {
  users: User[];
  posts: Post[];
  comments: Comment[];
  follows: Follow[];
}

const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    username: 'elena_design',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    bio: 'Principal Architect & Design Systems Lead. Obsessed with minimal spatial flow, brutalist web layouts, and quiet typography.',
    location: 'Kyiv / Berlin',
    website: 'https://elenarostova.design',
    role: 'Design Systems Architect',
    joinedDate: 'March 2024',
    followersCount: 2,
    followingCount: 2,
    postsCount: 2,
  },
  {
    id: 'user_2',
    username: 'marcus_chen',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    bio: 'Building resilient backend microservices & distributed tools. Specialty coffee nerd, custom keyboard builder, and open-source enthusiast.',
    location: 'San Francisco, CA',
    website: 'https://marcuschen.dev',
    role: 'Staff Systems Engineer',
    joinedDate: 'January 2024',
    followersCount: 3,
    followingCount: 3,
    postsCount: 1,
  },
  {
    id: 'user_3',
    username: 'maya_captures',
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bio: 'Visual storyteller & documentary photographer. Chasing moody coastal fog, rain-soaked city dusk, and quiet human connections. Leica & medium format.',
    location: 'Seattle, WA',
    website: 'https://mayalinphoto.com',
    role: 'Documentary Photographer',
    joinedDate: 'April 2024',
    followersCount: 2,
    followingCount: 2,
    postsCount: 2,
  },
  {
    id: 'user_4',
    username: 'kaito_tanaka',
    name: 'Kaito Tanaka',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    bio: 'Creative Technologist & audio experimenter. Writing clean, lightweight web applications. Believer in calm software and deep work.',
    location: 'Tokyo, Japan',
    website: 'https://kaito.studio',
    role: 'Creative Technologist',
    joinedDate: 'February 2024',
    followersCount: 2,
    followingCount: 2,
    postsCount: 1,
  },
];

const INITIAL_FOLLOWS: Follow[] = [
  { followerId: 'user_1', followingId: 'user_2', createdAt: '2024-03-10T10:00:00Z' },
  { followerId: 'user_1', followingId: 'user_3', createdAt: '2024-03-12T11:00:00Z' },
  { followerId: 'user_2', followingId: 'user_1', createdAt: '2024-03-10T12:00:00Z' },
  { followerId: 'user_2', followingId: 'user_3', createdAt: '2024-03-14T14:00:00Z' },
  { followerId: 'user_2', followingId: 'user_4', createdAt: '2024-03-15T09:00:00Z' },
  { followerId: 'user_3', followingId: 'user_1', createdAt: '2024-04-02T16:00:00Z' },
  { followerId: 'user_3', followingId: 'user_2', createdAt: '2024-04-03T18:00:00Z' },
  { followerId: 'user_4', followingId: 'user_1', createdAt: '2024-03-20T08:00:00Z' },
  { followerId: 'user_4', followingId: 'user_2', createdAt: '2024-03-22T08:30:00Z' },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_1',
    content: 'Just finalized the conceptual drawings for the lake pavilion. Cast architectural concrete paired with Japanese charred cedar, surrounded by a still reflecting pool. What element brings you the deepest sense of calm in built spaces?',
    image: '/src/assets/images/minimal_architecture_post_1791625798233.jpg',
    tags: ['architecture', 'minimalism', 'design'],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    likesCount: 3,
    commentsCount: 3,
    repostsCount: 1,
    likedBy: ['user_2', 'user_3', 'user_4'],
    bookmarkedBy: ['user_2'],
  },
  {
    id: 'post_2',
    authorId: 'user_2',
    content: 'Reset my morning workspace before kicking off the Express backend architecture. There is genuine joy in pairing a clean physical desk with a disciplined code structure. Ethiopian Yirgacheffe in the cup!',
    image: '/src/assets/images/design_workspace_post_1791625823670.jpg',
    tags: ['workspace', 'developer', 'engineering'],
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    likesCount: 2,
    commentsCount: 2,
    repostsCount: 0,
    likedBy: ['user_1', 'user_3'],
    bookmarkedBy: ['user_1'],
  },
  {
    id: 'post_3',
    authorId: 'user_3',
    content: 'Twilight street scene in Tokyo right after a spring cloudburst. The rain turns every asphalt alleyway into a dark mirror catching the lantern glow. Shot on 35mm film.',
    image: '/src/assets/images/urban_street_post_1791625812078.jpg',
    tags: ['photography', 'tokyo', 'streetstyle'],
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    likesCount: 3,
    commentsCount: 2,
    repostsCount: 2,
    likedBy: ['user_1', 'user_2', 'user_4'],
    bookmarkedBy: ['user_1', 'user_2'],
  },
  {
    id: 'post_4',
    authorId: 'user_3',
    content: 'The Pacific Northwest coast under heavy morning fog. Cold salt spray, dark basalt sea stacks, and centuries of silent Douglas firs standing guard. Nature at its most majestic.',
    image: '/src/assets/images/coastal_fog_post_1791625835737.jpg',
    tags: ['photography', 'nature', 'pnw'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
    likesCount: 2,
    commentsCount: 1,
    repostsCount: 1,
    likedBy: ['user_1', 'user_4'],
    bookmarkedBy: [],
  },
  {
    id: 'post_5',
    authorId: 'user_4',
    content: 'Refactored our event loop and state management today. Deleting 850 lines of redundant boilerplate code while keeping all test suites green is easily the most rewarding feeling in software engineering.',
    tags: ['software', 'cleancode', 'webdev'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
    likesCount: 3,
    commentsCount: 1,
    repostsCount: 2,
    likedBy: ['user_1', 'user_2', 'user_3'],
    bookmarkedBy: ['user_3'],
  },
  {
    id: 'post_6',
    authorId: 'user_1',
    content: 'A reminder for designers and engineers alike: complexity is easy, simplicity requires ruthless intentionality. Build for clarity, durability, and human ease.',
    tags: ['design', 'philosophy'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    likesCount: 2,
    commentsCount: 1,
    repostsCount: 0,
    likedBy: ['user_2', 'user_4'],
    bookmarkedBy: [],
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comment_1',
    postId: 'post_1',
    authorId: 'user_2',
    content: 'The flush perimeter between the concrete foundation and the water reflection is incredible Elena. How did you detail the drainage overflow?',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    likesCount: 2,
    likedBy: ['user_1', 'user_3'],
  },
  {
    id: 'comment_2',
    postId: 'post_1',
    authorId: 'user_1',
    content: 'Hidden stainless steel slot drains beneath the granite perimeter tiles! Kept all mechanical fixtures invisible.',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    likesCount: 1,
    likedBy: ['user_2'],
  },
  {
    id: 'comment_3',
    postId: 'post_1',
    authorId: 'user_3',
    content: 'The natural lighting and proportion in this frame is pure tranquility. Would love to photograph the physical build when completed!',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    likesCount: 1,
    likedBy: ['user_1'],
  },
  {
    id: 'comment_4',
    postId: 'post_2',
    authorId: 'user_1',
    content: 'That speckled ceramic mug is lovely! What grinder settings are you using for the Yirgacheffe?',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likesCount: 1,
    likedBy: ['user_2'],
  },
  {
    id: 'comment_5',
    postId: 'post_2',
    authorId: 'user_2',
    content: 'Medium-fine on a Comandante C40 at 24 clicks. Keeps the floral brightness while extracting full sweetness.',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    likesCount: 1,
    likedBy: ['user_1'],
  },
  {
    id: 'comment_6',
    postId: 'post_3',
    authorId: 'user_1',
    content: 'The color harmony between the warm vermilion signage and cool rainy asphalt is breathtaking Maya.',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    likesCount: 1,
    likedBy: ['user_3'],
  },
  {
    id: 'comment_7',
    postId: 'post_3',
    authorId: 'user_4',
    content: 'Recognize this cozy spot near Shinjuku! Nothing beats late night ramen when it rains in Tokyo.',
    createdAt: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
    likesCount: 2,
    likedBy: ['user_2', 'user_3'],
  },
  {
    id: 'comment_8',
    postId: 'post_4',
    authorId: 'user_4',
    content: 'Moody coastal scenes have such unmatched cinematic weight. Oregon coast?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    likesCount: 1,
    likedBy: ['user_3'],
  },
  {
    id: 'comment_9',
    postId: 'post_5',
    authorId: 'user_2',
    content: 'Less code = less surface area for bugs. The hardest part is having the discipline to delete what took hours to write initially!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    likesCount: 2,
    likedBy: ['user_1', 'user_4'],
  },
  {
    id: 'comment_10',
    postId: 'post_6',
    authorId: 'user_3',
    content: 'Could not agree more. Simplicity is an ongoing subtraction until only the essential remains.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    likesCount: 1,
    likedBy: ['user_1'],
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.syncCounts();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.posts && parsed.comments && parsed.follows) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing seed data:', err);
    }

    const initialData: DatabaseSchema = {
      users: INITIAL_USERS,
      posts: INITIAL_POSTS,
      comments: INITIAL_COMMENTS,
      follows: INITIAL_FOLLOWS,
    };
    this.saveData(initialData);
    return initialData;
  }

  private saveData(dataToSave = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  private syncCounts() {
    for (const user of this.data.users) {
      user.followersCount = this.data.follows.filter(f => f.followingId === user.id).length;
      user.followingCount = this.data.follows.filter(f => f.followerId === user.id).length;
      user.postsCount = this.data.posts.filter(p => p.authorId === user.id).length;
    }
    for (const post of this.data.posts) {
      post.likesCount = post.likedBy.length;
      post.commentsCount = this.data.comments.filter(c => c.postId === post.id).length;
    }
  }

  // --- Users ---
  public getUsers(currentUserId?: string): User[] {
    this.syncCounts();
    return this.data.users.map(u => ({
      ...u,
      isFollowing: currentUserId ? this.isFollowing(currentUserId, u.id) : false,
    }));
  }

  public getUserById(id: string, currentUserId?: string): User | undefined {
    this.syncCounts();
    const user = this.data.users.find(u => u.id === id || u.username === id);
    if (!user) return undefined;
    return {
      ...user,
      isFollowing: currentUserId ? this.isFollowing(currentUserId, user.id) : false,
    };
  }

  public createUser(userData: {
    username: string;
    name: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    role?: string;
  }): User {
    const cleanUsername = userData.username.replace(/^@/, '').trim().toLowerCase();
    const existing = this.data.users.find(u => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      throw new Error(`Username @${cleanUsername} is already taken.`);
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: cleanUsername,
      name: userData.name.trim(),
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: userData.bio || 'New member of the Pulse community.',
      location: userData.location || '',
      website: userData.website || '',
      role: userData.role || 'Member',
      joinedDate: 'Just now',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    };

    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const current = this.data.users[index];
    if (updates.username && updates.username !== current.username) {
      const cleanUsername = updates.username.replace(/^@/, '').trim().toLowerCase();
      const existing = this.data.users.find(u => u.id !== id && u.username.toLowerCase() === cleanUsername);
      if (existing) throw new Error(`Username @${cleanUsername} is already taken.`);
      updates.username = cleanUsername;
    }

    this.data.users[index] = {
      ...current,
      ...updates,
      id: current.id, // Immutable
    };

    this.saveData();
    return this.data.users[index];
  }

  // --- Follows ---
  public isFollowing(followerId: string, followingId: string): boolean {
    return this.data.follows.some(f => f.followerId === followerId && f.followingId === followingId);
  }

  public toggleFollow(followerId: string, targetUserId: string): { isFollowing: boolean; targetUser: User } {
    if (followerId === targetUserId) {
      throw new Error('Users cannot follow themselves');
    }

    const targetUser = this.data.users.find(u => u.id === targetUserId);
    if (!targetUser) throw new Error('Target user not found');

    const index = this.data.follows.findIndex(f => f.followerId === followerId && f.followingId === targetUserId);
    let isFollowing = false;

    if (index >= 0) {
      // Unfollow
      this.data.follows.splice(index, 1);
      isFollowing = false;
    } else {
      // Follow
      this.data.follows.push({
        followerId,
        followingId: targetUserId,
        createdAt: new Date().toISOString(),
      });
      isFollowing = true;
    }

    this.syncCounts();
    this.saveData();

    return {
      isFollowing,
      targetUser: {
        ...targetUser,
        isFollowing,
      },
    };
  }

  public getFollowers(userId: string, currentUserId?: string): User[] {
    const followerIds = this.data.follows
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);

    return this.data.users
      .filter(u => followerIds.includes(u.id))
      .map(u => ({
        ...u,
        isFollowing: currentUserId ? this.isFollowing(currentUserId, u.id) : false,
      }));
  }

  public getFollowing(userId: string, currentUserId?: string): User[] {
    const followingIds = this.data.follows
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);

    return this.data.users
      .filter(u => followingIds.includes(u.id))
      .map(u => ({
        ...u,
        isFollowing: currentUserId ? this.isFollowing(currentUserId, u.id) : false,
      }));
  }

  // --- Posts ---
  public getPosts(options: {
    feed?: 'foryou' | 'following' | 'explore';
    userId?: string;
    tag?: string;
    search?: string;
    currentUserId?: string;
  } = {}): Post[] {
    this.syncCounts();
    const { feed = 'foryou', userId, tag, search, currentUserId } = options;

    let filtered = [...this.data.posts];

    if (userId) {
      filtered = filtered.filter(p => p.authorId === userId);
    } else if (feed === 'following' && currentUserId) {
      const followingIds = this.data.follows
        .filter(f => f.followerId === currentUserId)
        .map(f => f.followingId);
      // Include current user's posts and followed users' posts
      filtered = filtered.filter(p => followingIds.includes(p.authorId) || p.authorId === currentUserId);
    }

    if (tag) {
      const cleanTag = tag.replace(/^#/, '').toLowerCase();
      filtered = filtered.filter(p => p.tags.some(t => t.toLowerCase() === cleanTag));
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => {
        const author = this.data.users.find(u => u.id === p.authorId);
        return (
          p.content.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q)) ||
          author?.name.toLowerCase().includes(q) ||
          author?.username.toLowerCase().includes(q)
        );
      });
    }

    // Sort by latest created
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered.map(post => this.hydratePost(post, currentUserId));
  }

  public getPostById(id: string, currentUserId?: string): Post | undefined {
    this.syncCounts();
    const post = this.data.posts.find(p => p.id === id);
    if (!post) return undefined;
    return this.hydratePost(post, currentUserId);
  }

  private hydratePost(post: Post, currentUserId?: string): Post {
    const author = this.data.users.find(u => u.id === post.authorId);
    return {
      ...post,
      author: author ? {
        ...author,
        isFollowing: currentUserId ? this.isFollowing(currentUserId, author.id) : false,
      } : undefined,
      isLiked: currentUserId ? post.likedBy.includes(currentUserId) : false,
      isBookmarked: currentUserId ? post.bookmarkedBy.includes(currentUserId) : false,
    };
  }

  public createPost(data: {
    authorId: string;
    content: string;
    image?: string;
    tags?: string[];
  }): Post {
    const author = this.data.users.find(u => u.id === data.authorId);
    if (!author) throw new Error('Author does not exist');

    // Extract hashtags from content if not explicitly supplied
    const extractedTags = (data.content.match(/#(\w+)/g) || []).map(t => t.slice(1).toLowerCase());
    const finalTags = Array.from(new Set([...(data.tags || []).map(t => t.toLowerCase()), ...extractedTags]));

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: data.authorId,
      content: data.content.trim(),
      image: data.image?.trim() || undefined,
      tags: finalTags,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      likedBy: [],
      bookmarkedBy: [],
    };

    this.data.posts.unshift(newPost);
    this.syncCounts();
    this.saveData();
    return this.hydratePost(newPost, data.authorId);
  }

  public deletePost(id: string, currentUserId: string): boolean {
    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) return false;

    const post = this.data.posts[index];
    if (post.authorId !== currentUserId) {
      throw new Error('Unauthorized to delete this post');
    }

    this.data.posts.splice(index, 1);
    // Remove related comments
    this.data.comments = this.data.comments.filter(c => c.postId !== id);
    this.syncCounts();
    this.saveData();
    return true;
  }

  public toggleLikePost(postId: string, userId: string): { isLiked: boolean; likesCount: number } {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const idx = post.likedBy.indexOf(userId);
    let isLiked = false;
    if (idx >= 0) {
      post.likedBy.splice(idx, 1);
      isLiked = false;
    } else {
      post.likedBy.push(userId);
      isLiked = true;
    }
    post.likesCount = post.likedBy.length;
    this.saveData();
    return { isLiked, likesCount: post.likesCount };
  }

  public toggleBookmarkPost(postId: string, userId: string): { isBookmarked: boolean } {
    const post = this.data.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const idx = post.bookmarkedBy.indexOf(userId);
    let isBookmarked = false;
    if (idx >= 0) {
      post.bookmarkedBy.splice(idx, 1);
      isBookmarked = false;
    } else {
      post.bookmarkedBy.push(userId);
      isBookmarked = true;
    }
    this.saveData();
    return { isBookmarked };
  }

  // --- Comments ---
  public getComments(postId: string, currentUserId?: string): Comment[] {
    const comments = this.data.comments
      .filter(c => c.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return comments.map(c => {
      const author = this.data.users.find(u => u.id === c.authorId);
      return {
        ...c,
        author: author ? {
          ...author,
          isFollowing: currentUserId ? this.isFollowing(currentUserId, author.id) : false,
        } : undefined,
        isLiked: currentUserId ? c.likedBy.includes(currentUserId) : false,
      };
    });
  }

  public createComment(data: {
    postId: string;
    authorId: string;
    content: string;
  }): Comment {
    const post = this.data.posts.find(p => p.id === data.postId);
    if (!post) throw new Error('Post not found');

    const author = this.data.users.find(u => u.id === data.authorId);
    if (!author) throw new Error('Author not found');

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      postId: data.postId,
      authorId: data.authorId,
      content: data.content.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedBy: [],
    };

    this.data.comments.push(newComment);
    this.syncCounts();
    this.saveData();

    return {
      ...newComment,
      author,
      isLiked: false,
    };
  }

  public toggleLikeComment(commentId: string, userId: string): { isLiked: boolean; likesCount: number } {
    const comment = this.data.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    const idx = comment.likedBy.indexOf(userId);
    let isLiked = false;
    if (idx >= 0) {
      comment.likedBy.splice(idx, 1);
      isLiked = false;
    } else {
      comment.likedBy.push(userId);
      isLiked = true;
    }
    comment.likesCount = comment.likedBy.length;
    this.saveData();
    return { isLiked, likesCount: comment.likesCount };
  }

  // --- Trending & Discovery ---
  public getTrending(): { tags: TrendingTag[]; suggestedUsers: User[] } {
    const tagCounts: Record<string, number> = {};
    for (const post of this.data.posts) {
      for (const tag of post.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const tags: TrendingTag[] = Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count: count * 142 + 28, // Scaled for realistic social count feel
        category: tag === 'architecture' || tag === 'design' ? 'Creative & Design' :
                  tag === 'tokyo' || tag === 'photography' ? 'Visual Arts' :
                  tag === 'developer' || tag === 'software' ? 'Technology' : 'Trending Now',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const suggestedUsers = this.getUsers().slice(0, 4);

    return { tags, suggestedUsers };
  }
}

export const db = new Database();
