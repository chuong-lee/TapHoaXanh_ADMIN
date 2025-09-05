"use client";
import React, { useState, useEffect } from "react";
import { IReview, IReviewFilter } from "@/interface/IReview";
import { FaStar, FaEye, FaTrash, FaSearch, FaFilter, FaInfoCircle } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ReviewStats from "@/components/review/ReviewStats";

interface ReviewResponse {
  reviews: IReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<IReview[]>([]);
  const [filter, setFilter] = useState<IReviewFilter>({});
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch reviews from API với phân trang
  const fetchReviews = async (page = 1, filters = filter) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (filters.rating) params.append('rating', filters.rating.toString());
      
      const response = await fetch(`/api/reviews?${params.toString()}`);
      if (response.ok) {
        const data: ReviewResponse = await response.json();
        setReviews(data.reviews);
        setFilteredReviews(data.reviews);
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Không thể tải danh sách đánh giá');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFilterChange = (newFilter: Partial<IReviewFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    fetchReviews(1, updatedFilter);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchReviews(newPage, filter);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const filtered = reviews.filter(review => 
        review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReviews(filtered);
    } else {
      setFilteredReviews(reviews);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh danh sách
        fetchReviews(pagination.page, filter);
        alert('Đánh giá đã được xóa thành công!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Không thể xóa đánh giá');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Lỗi kết nối mạng');
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
    // Vì chưa có trường status, tất cả đều "đã duyệt"
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Đã duyệt</span>;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Lỗi: {error}</div>
          <button 
            onClick={() => fetchReviews()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đánh giá</h1>
        <p className="text-gray-600">Duyệt và quản lý đánh giá sản phẩm từ khách hàng</p>
        

      </div>

      {/* Review Statistics */}
      <ReviewStats />

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo tên sản phẩm, người dùng hoặc nội dung..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-gray-500" />
          <span className="font-medium text-gray-700">Bộ lọc</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Số lượng hiển thị
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={pagination.limit}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                fetchReviews(1, filter);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter({});
                setSearchTerm("");
                fetchReviews(1, {});
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Xóa bộ lọc
            </button>
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
                          className="h-10 w-10 rounded-full object-cover"
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
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Xóa đánh giá"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> đến{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  trong tổng số <span className="font-medium">{pagination.total}</span> đánh giá
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Trước</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Sau</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
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
