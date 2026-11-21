
export interface Post {
  _id: string;
  id?: string;
  body: string;
  image?: string | null;
  bookmarked: boolean;
  commentsCount: number;
  createdAt: string;
  isShare: boolean;
  likes: string[];
  likesCount: number;
  privacy: 'public' | 'friends' | 'only_me' | string;
  sharedPost: Post | null;
  sharesCount: number;
  topComment: Comment | null;
  user: PostUser;
}

export interface PostUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  commentCreator: {
    _id: string;
    name: string;
    username: string;
    photo: string;
  };
  repliesCount: number;
}
