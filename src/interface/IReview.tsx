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
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  adminId?: string;
  adminName?: string;
  reviewedAt?: string;
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
  status?: 'pending' | 'approved' | 'rejected';
  dateFrom?: string;
  dateTo?: string;
}

export interface IReviewStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  pendingPercentage: number;
}

export interface IReviewAction {
  reviewId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
  adminId: string;
}
