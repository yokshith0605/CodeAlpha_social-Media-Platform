export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  location?: string;
  website?: string;
  role?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  author?: User;
  content: string;
  image?: string;
  tags: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  likedBy: string[];
  bookmarkedBy: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  isLiked?: boolean;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface TrendingTag {
  tag: string;
  count: number;
  category?: string;
}
