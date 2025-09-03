export interface IReview {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReviewForm {
  productId: string;
  rating: number;
  comment: string;
  images?: File[];
}

export interface IReviewFilter {
  productId?: string;
  rating?: number;
  isApproved?: boolean;
  isRejected?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
