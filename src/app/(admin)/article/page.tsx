"use client";
import React, { useState, useEffect } from "react";
import { INews, INewsFilter } from "@/interface/INews";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import NewsStats from "@/components/news/NewsStats";

const NewsManagement: React.FC = () => {
  const [news, setNews] = useState<INews[]>([]);
  const [filteredNews, setFilteredNews] = useState<INews[]>([]);
  const [filter, setFilter] = useState<INewsFilter>({});
  const [selectedNews, setSelectedNews] = useState<INews | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Fetch news from API
  useEffect(() => {
    fetchNews();
  }, [filter, pagination.page, pagination.limit]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter.category_id) params.append('category_id', filter.category_id);
      if (filter.type) params.append('type', filter.type);
      if (filter.author_id) params.append('author_id', filter.author_id);
      if (searchTerm) params.append('search', searchTerm);
      
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/news?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNews(data.news);
        setFilteredNews(data.news);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      } else {
        console.error('Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: Partial<INewsFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset về trang 1
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (newsId: string) => {
    try {
      const response = await fetch(`/api/news/${newsId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh danh sách
        fetchNews();
      } else {
        console.error('Failed to delete news');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const getStatusBadge = (newsItem: INews) => {
    if (newsItem.images && newsItem.summary) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Đã xuất bản</span>;
    }
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Tin nháp</span>;
  };

  const newsTypes = ["Tin tức", "Khuyến mãi", "Hướng dẫn", "Công thức", "Sức khỏe"];

  if (loading && news.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý tin tức</h1>
        <p className="text-gray-600">Duyệt và quản lý tin tức trên website</p>
      </div>

      {/* Thống kê */}
      <NewsStats />

      {/* Header với nút thêm */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <FaPlus className="w-4 h-4" />
            Thêm tin tức
          </button>
        </div>
      </div>

      {/* Filters và Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại tin
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.type || ""}
              onChange={(e) => handleFilterChange({ type: e.target.value || undefined })}
            >
              <option value="">Tất cả</option>
              {newsTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng hiển thị
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={pagination.limit}
              onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tin tức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
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
              {filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Không có tin tức nào
                  </td>
                </tr>
              ) : (
                filteredNews.map((newsItem) => (
                  <tr key={newsItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {newsItem.images && (
                          <div className="flex-shrink-0 h-12 w-12 mr-4">
                            <img
                              className="h-12 w-12 rounded object-cover"
                              src={newsItem.images}
                              alt=""
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {newsItem.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {newsItem.summary || 'Không có tóm tắt'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={newsItem.authorAvatar || "/images/user/default-avatar.jpg"}
                            alt=""
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {newsItem.authorName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {newsItem.type || 'Không phân loại'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>👁️ {newsItem.views} lượt xem</div>
                        <div>❤️ {newsItem.likes} lượt thích</div>
                        <div>💬 {newsItem.comments_count} bình luận</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(newsItem)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(newsItem.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedNews(newsItem);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="text-green-600 hover:text-green-900"
                          title="Chỉnh sửa"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm("Bạn có chắc muốn xóa tin tức này?")) {
                              handleDelete(newsItem.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </nav>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedNews && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết tin tức</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaEdit className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedNews.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tóm tắt</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedNews.summary || 'Không có tóm tắt'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nội dung</label>
                  <p className="text-sm text-gray-900 mt-1 max-h-32 overflow-y-auto">
                    {selectedNews.description}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tác giả</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedNews.authorName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại tin</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedNews.type || 'Không phân loại'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lượt xem</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedNews.views}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lượt thích</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedNews.likes}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bình luận</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedNews.comments_count}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(selectedNews.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(selectedNews.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
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

export default NewsManagement;