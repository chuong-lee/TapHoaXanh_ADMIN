'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaSearch, FaFilter } from 'react-icons/fa';
import ArticleModal from '@/components/articles/ArticleModal';
import { IArticle } from '@/interface/IArticle';

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedArticle, setSelectedArticle] = useState<IArticle | null>(null);

  const categories = [
    'Tin tức',
    'Khuyến mãi',
    'Hướng dẫn',
    'Công thức',
    'Sức khỏe',
    'Lối sống',
    'Kinh doanh',
    'Công nghệ',
    'Giáo dục',
    'Giải trí'
  ];

  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'draft', label: 'Bản nháp' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Bị từ chối' }
  ];

  useEffect(() => {
    fetchArticles();
  }, [pagination.page, pagination.limit, selectedCategory, selectedStatus]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (selectedStatus) {
        if (selectedStatus === 'published') {
          params.append('isPublished', 'true');
        } else if (selectedStatus === 'draft') {
          params.append('isPublished', 'false');
        }
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (response.ok) {
        setArticles(data.articles);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));
      } else {
        console.error('Error fetching articles:', data.error);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchArticles();
  };

  const handleCreateArticle = () => {
    setModalMode('create');
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleEditArticle = (article: IArticle) => {
    setModalMode('edit');
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleSaveArticle = async (articleData: any) => {
    try {
      const url = modalMode === 'create' ? '/api/articles' : `/api/articles/${selectedArticle?.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        fetchArticles();
        alert(data.message);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Có lỗi xảy ra khi lưu bài viết');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        fetchArticles();
        alert(data.message);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  const getStatusBadge = (article: IArticle) => {
    if (article.isRejected) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Bị từ chối</span>;
    }
    if (article.isPublished) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Đã xuất bản</span>;
    }
    if (article.isApproved) {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Đã duyệt</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Bản nháp</span>;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý bài viết</h1>
        <p className="text-gray-600">Tạo và quản lý các bài viết trên website</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleCreateArticle}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Thêm tin tức
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Tìm
            </button>
          </div>
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
              Phân loại
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng hiển thị
            </label>
            <select
              value={pagination.limit}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Không có bài viết nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bài viết
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tác giả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phân loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thống kê
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
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {article.featuredImage && (
                            <img
                              src={article.featuredImage}
                              alt={article.title}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {article.title}
                            </div>
                            {article.summary && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {article.summary}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={article.authorAvatar}
                            alt={article.authorName}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div className="text-sm text-gray-900">
                            {article.authorName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(article)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>👁️ {article.viewCount}</div>
                          <div>❤️ {article.likeCount}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Chỉnh sửa"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa"
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
              <div className="px-6 py-3 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                    {pagination.total} bài viết
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <ArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveArticle}
        article={selectedArticle}
        mode={modalMode}
      />
    </div>
  );
};

export default ArticlesPage;
