import React, { useState, useEffect } from 'react';
import { FaStar, FaCheck, FaTimes, FaClock, FaChartBar } from 'react-icons/fa';

interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  ratingCounts: Record<number, number>;
  summary: {
    approvalRate: number;
    averageRating: number;
  };
}

const ReviewStats: React.FC = () => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/count');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Không thể tải thống kê');
      }
    } catch (error) {
      setError('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <FaTimes className="text-red-400 mr-2" />
          <span className="text-red-800">Lỗi: {error || 'Không thể tải thống kê'}</span>
        </div>
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Tổng số đánh giá */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FaChartBar className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tổng số đánh giá</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Đã duyệt */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <FaCheck className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            <p className="text-sm text-green-600">{stats.summary.approvalRate}%</p>
          </div>
        </div>
      </div>

      {/* Chờ duyệt */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <FaClock className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-yellow-600">
              {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Bị từ chối */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <FaTimes className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Bị từ chối</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            <p className="text-sm text-red-600">
              {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Thống kê chi tiết */}
      <div className="lg:col-span-4 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê chi tiết</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Đánh giá trung bình */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Đánh giá trung bình</h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(Math.round(stats.summary.averageRating))}
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.summary.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-500">/ 5</span>
            </div>
          </div>

          {/* Phân bố số sao */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Phân bố số sao</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingCounts[rating] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <div className="flex items-center w-16">
                      <span className="text-sm text-gray-600">{rating}</span>
                      <FaStar className="w-4 h-4 text-yellow-400 ml-1" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
