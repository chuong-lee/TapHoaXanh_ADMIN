export interface IArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  images?: string[];
  isPublished: boolean;
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IArticleForm {
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  featuredImage?: File;
  images?: File[];
  isPublished: boolean;
}

export interface IArticleFilter {
  category?: string;
  authorId?: string;
  isPublished?: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
