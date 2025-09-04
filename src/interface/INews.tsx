export interface INews {
  id: string;
  name: string;
  summary?: string;
  description: string;
  images?: string;
  views: number;
  likes: number;
  comments_count: number;
  author_id?: string;
  authorName?: string;
  authorAvatar?: string;
  category_id?: string;
  categoryName?: string;
  type?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface INewsFilter {
  category_id?: string;
  type?: string;
  author_id?: string;
  search?: string;
}

export interface INewsForm {
  name: string;
  summary?: string;
  description: string;
  images?: string;
  author_id?: string;
  category_id?: string;
  type?: string;
}

export interface INewsStats {
  total: number;
  published: number;
  draft: number;
  views: number;
  likes: number;
  comments: number;
}
