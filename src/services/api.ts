import { User, Post, Comment, TrendingTag } from '../types/index.ts';

class ApiService {
  private currentUserId: string = 'user_1';

  public setCurrentUserId(id: string) {
    this.currentUserId = id;
  }

  public getCurrentUserId(): string {
    return this.currentUserId;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-id': this.currentUserId,
    };
  }

  public async getUsers(search?: string): Promise<User[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/users${params}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  public async getUser(id: string): Promise<User> {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }

  public async createUser(data: {
    username: string;
    name: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    role?: string;
  }): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
  }

  public async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update user profile');
    }
    return res.json();
  }

  public async toggleFollow(targetUserId: string): Promise<{ isFollowing: boolean; targetUser: User }> {
    const res = await fetch(`/api/users/${encodeURIComponent(targetUserId)}/follow`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to toggle follow');
    }
    return res.json();
  }

  public async getFollowers(userId: string): Promise<User[]> {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/followers`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch followers');
    return res.json();
  }

  public async getFollowing(userId: string): Promise<User[]> {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/following`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch following');
    return res.json();
  }

  public async getPosts(params: {
    feed?: 'foryou' | 'following' | 'explore';
    userId?: string;
    tag?: string;
    search?: string;
    bookmarks?: boolean;
  } = {}): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params.feed) query.set('feed', params.feed);
    if (params.userId) query.set('userId', params.userId);
    if (params.tag) query.set('tag', params.tag);
    if (params.search) query.set('search', params.search);
    if (params.bookmarks) query.set('bookmarks', 'true');

    const res = await fetch(`/api/posts?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  }

  public async getPost(id: string): Promise<Post> {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  }

  public async createPost(data: {
    content: string;
    image?: string;
    tags?: string[];
  }): Promise<Post> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        authorId: this.currentUserId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create post');
    }
    return res.json();
  }

  public async deletePost(id: string): Promise<boolean> {
    const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete post');
    }
    return true;
  }

  public async toggleLikePost(postId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to like post');
    return res.json();
  }

  public async toggleBookmarkPost(postId: string): Promise<{ isBookmarked: boolean }> {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/bookmark`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to bookmark post');
    return res.json();
  }

  public async getComments(postId: string): Promise<Comment[]> {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  }

  public async addComment(postId: string, content: string): Promise<Comment> {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content,
        authorId: this.currentUserId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to post comment');
    }
    return res.json();
  }

  public async toggleLikeComment(commentId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const res = await fetch(`/api/comments/${encodeURIComponent(commentId)}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to like comment');
    return res.json();
  }

  public async getTrending(): Promise<{ tags: TrendingTag[]; suggestedUsers: User[] }> {
    const res = await fetch('/api/trending', {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch trending topics');
    return res.json();
  }
}

export const api = new ApiService();
