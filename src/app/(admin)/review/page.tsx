"use client";
import React, { useState, useEffect } from "react";
import { IReview, IReviewFilter } from "@/interface/IReview";
import { FaStar, FaCheck, FaTimes, FaEye, FaTrash } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";



const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<IReview[]>([]);
  const [filter, setFilter] = useState<IReviewFilter>({});
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reviews');
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
          setFilteredReviews(data);
        } else {
          console.error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, []);

  const handleFilterChange = (newFilter: Partial<IReviewFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    
    let filtered = reviews;
    
    if (updatedFilter.rating) {
      filtered = filtered.filter(review => review.rating === updatedFilter.rating);
    }
    
    if (updatedFilter.isApproved !== undefined) {
      filtered = filtered.filter(review => review.isApproved === updatedFilter.isApproved);
    }
    
    if (updatedFilter.isRejected !== undefined) {
      filtered = filtered.filter(review => review.isRejected === updatedFilter.isRejected);
    }
    
    setFilteredReviews(filtered);
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, isApproved: true, isRejected: false }
            : review
        ));
        setFilteredReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, isApproved: true, isRejected: false }
            : review
        ));
      } else {
        console.error('Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (reviewId: string, reason: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
      });

      if (response.ok) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, isApproved: false, isRejected: true, rejectionReason: reason }
            : review
        ));
        setFilteredReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, isApproved: false, isRejected: true, rejectionReason: reason }
            : review
        ));
      } else {
        console.error('Failed to reject review');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
        setFilteredReviews(prev => prev.filter(review => review.id !== reviewId));
      } else {
        console.error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusBadge = (review: IReview) => {
    if (review.isApproved) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Đã duyệt</span>;
    }
    if (review.isRejected) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Từ chối</span>;
    }
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Chờ duyệt</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đánh giá</h1>
        <p className="text-gray-600">Duyệt và quản lý đánh giá sản phẩm từ khách hàng</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đánh giá
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.rating || ""}
              onChange={(e) => handleFilterChange({ rating: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.isApproved === undefined ? "" : filter.isApproved.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  handleFilterChange({ isApproved: undefined, isRejected: undefined });
                } else if (value === "true") {
                  handleFilterChange({ isApproved: true, isRejected: false });
                } else {
                  handleFilterChange({ isApproved: false, isRejected: true });
                }
              }}
            >
              <option value="">Tất cả</option>
              <option value="true">Đã duyệt</option>
              <option value="false">Chưa duyệt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm & Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={review.userAvatar || "/images/user/default-avatar.jpg"}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {review.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.productName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-900">{review.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {review.comment}
                    </div>
                    {review.images && review.images.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {review.images.length} ảnh
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(review)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(review.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      
                      {!review.isApproved && !review.isRejected && (
                        <>
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Lý do từ chối:");
                              if (reason) handleReject(review.id, reason);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          if (confirm("Bạn có chắc muốn xóa đánh giá này?")) {
                            handleDelete(review.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết đánh giá</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sản phẩm</label>
                  <p className="text-sm text-gray-900">{selectedReview.productName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Người đánh giá</label>
                  <p className="text-sm text-gray-900">{selectedReview.userName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Đánh giá</label>
                  <div className="flex items-center mt-1">
                    {renderStars(selectedReview.rating)}
                    <span className="ml-2 text-sm text-gray-900">{selectedReview.rating}/5</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nội dung</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedReview.comment}</p>
                </div>
                
                {selectedReview.images && selectedReview.images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {selectedReview.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedReview.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lý do từ chối</label>
                    <p className="text-sm text-red-600 mt-1">{selectedReview.rejectionReason}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(selectedReview.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
