"use client";
import React, { useState, useEffect } from "react";
import { IArticle, IArticleFilter } from "@/interface/IArticle";
import { FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaEyeSlash } from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const ArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<IArticle[]>([]);
  const [filter, setFilter] = useState<IArticleFilter>({});
  const [selectedArticle, setSelectedArticle] = useState<IArticle | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
          setFilteredArticles(data);
        } else {
          console.error('Failed to fetch articles');
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  const handleFilterChange = (newFilter: Partial<IArticleFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    
    let filtered = articles;
    
    if (updatedFilter.category) {
      filtered = filtered.filter(article => article.category === updatedFilter.category);
    }
    
    if (updatedFilter.isPublished !== undefined) {
      filtered = filtered.filter(article => article.isPublished === updatedFilter.isPublished);
    }
    
    if (updatedFilter.isApproved !== undefined) {
      filtered = filtered.filter(article => article.isApproved === updatedFilter.isApproved);
    }
    
    if (updatedFilter.isRejected !== undefined) {
      filtered = filtered.filter(article => article.isRejected === updatedFilter.isRejected);
    }
    
    setFilteredArticles(filtered);
  };

  const handleApprove = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isApproved: true, isRejected: false }
            : article
        ));
        setFilteredArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isApproved: true, isRejected: false }
            : article
        ));
      } else {
        console.error('Failed to approve article');
      }
    } catch (error) {
      console.error('Error approving article:', error);
    }
  };

  const handleReject = async (articleId: string, reason: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
      });

      if (response.ok) {
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isApproved: false, isRejected: true, rejectionReason: reason }
            : article
        ));
        setFilteredArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isApproved: false, isRejected: true, rejectionReason: reason }
            : article
        ));
      } else {
        console.error('Failed to reject article');
      }
    } catch (error) {
      console.error('Error rejecting article:', error);
    }
  };

  const handlePublish = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'publish' }),
      });

      if (response.ok) {
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isPublished: true, publishedAt: new Date().toISOString() }
            : article
        ));
        setFilteredArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isPublished: true, publishedAt: new Date().toISOString() }
            : article
        ));
      } else {
        console.error('Failed to publish article');
      }
    } catch (error) {
      console.error('Error publishing article:', error);
    }
  };

  const handleUnpublish = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'unpublish' }),
      });

      if (response.ok) {
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isPublished: false, publishedAt: undefined }
            : article
        ));
        setFilteredArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isPublished: false, publishedAt: undefined }
            : article
        ));
      } else {
        console.error('Failed to unpublish article');
      }
    } catch (error) {
      console.error('Error unpublishing article:', error);
    }
  };

  const handleDelete = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(prev => prev.filter(article => article.id !== articleId));
        setFilteredArticles(prev => prev.filter(article => article.id !== articleId));
      } else {
        console.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const getStatusBadge = (article: IArticle) => {
    if (article.isRejected) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Từ chối</span>;
    }
    if (article.isApproved && article.isPublished) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Đã xuất bản</span>;
    }
    if (article.isApproved && !article.isPublished) {
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Đã duyệt</span>;
    }
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Chờ duyệt</span>;
  };

  const categories = ["Hướng dẫn", "Công thức", "Sức khỏe", "Tin tức", "Khuyến mãi"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý bài viết</h1>
          <p className="text-gray-600">Duyệt và quản lý bài viết trên website</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
          <FaPlus className="w-4 h-4" />
          Thêm bài viết
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.category || ""}
              onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
            >
              <option value="">Tất cả</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter.isPublished === undefined ? "" : filter.isPublished.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  handleFilterChange({ isPublished: undefined });
                } else {
                  handleFilterChange({ isPublished: value === "true" });
                }
              }}
            >
              <option value="">Tất cả</option>
              <option value="true">Đã xuất bản</option>
              <option value="false">Chưa xuất bản</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duyệt
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

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
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
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Không có bài viết nào
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {article.featuredImage && (
                          <div className="flex-shrink-0 h-12 w-12 mr-4">
                            <img
                              className="h-12 w-12 rounded object-cover"
                              src={article.featuredImage}
                              alt=""
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {article.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {article.summary}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {article.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 2 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{article.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={article.authorAvatar || "/images/user/default-avatar.jpg"}
                            alt=""
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {article.authorName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>👁️ {article.viewCount} lượt xem</div>
                        <div>❤️ {article.likeCount} lượt thích</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(article)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(article.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedArticle(article);
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
                        
                        {!article.isApproved && !article.isRejected && (
                          <>
                            <button
                              onClick={() => handleApprove(article.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Duyệt bài"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Lý do từ chối:");
                                if (reason) handleReject(article.id, reason);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Từ chối"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {article.isApproved && !article.isPublished && (
                          <button
                            onClick={() => handlePublish(article.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xuất bản"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                        )}
                        
                        {article.isPublished && (
                          <button
                            onClick={() => handleUnpublish(article.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Gỡ xuất bản"
                          >
                            <FaEyeSlash className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
                              handleDelete(article.id);
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

      {/* Detail Modal */}
      {showDetailModal && selectedArticle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Chi tiết bài viết</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedArticle.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tóm tắt</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedArticle.summary}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nội dung</label>
                  <p className="text-sm text-gray-900 mt-1 max-h-32 overflow-y-auto">
                    {selectedArticle.content}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tác giả</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedArticle.authorName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedArticle.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedArticle.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lượt xem</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedArticle.viewCount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lượt thích</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedArticle.likeCount}</p>
                  </div>
                </div>
                
                {selectedArticle.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lý do từ chối</label>
                    <p className="text-sm text-red-600 mt-1">{selectedArticle.rejectionReason}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(new Date(selectedArticle.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
                
                {selectedArticle.publishedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày xuất bản</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {format(new Date(selectedArticle.publishedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManagement;