'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IArticle } from '@/interface/IArticle';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (article: any) => void;
  article?: IArticle;
  mode: 'create' | 'edit';
}

const ArticleModal: React.FC<ArticleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  article,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'Tin tức',
    tags: [] as string[],
    featuredImage: '',
    isPublished: false,
  });

  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

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

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && article) {
        setFormData({
          title: article.title || '',
          content: article.content || '',
          summary: article.summary || '',
          category: article.category || 'Tin tức',
          tags: article.tags || [],
          featuredImage: article.featuredImage || '',
          isPublished: article.isPublished || false,
        });
      } else {
        setFormData({
          title: '',
          content: '',
          summary: '',
          category: 'Tin tức',
          tags: [],
          featuredImage: '',
          isPublished: false,
        });
      }
    }
  }, [isOpen, mode, article]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    setLoading(true);
    
    try {
      const articleData = {
        ...formData,
        authorId: '1', // Tạm thời hardcode, sau này lấy từ context
      };

      onSave(articleData);
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Thêm bài viết mới' : 'Chỉnh sửa bài viết'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            {/* Tóm tắt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tóm tắt bài viết"
              />
            </div>

            {/* Phân loại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phân loại
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tag và nhấn Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Ảnh đại diện */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh đại diện
              </label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập URL ảnh đại diện"
              />
            </div>

            {/* Nội dung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập nội dung bài viết"
                required
              />
            </div>

            {/* Trạng thái xuất bản */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Xuất bản ngay
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                {mode === 'create' ? 'Tạo bài viết' : 'Cập nhật'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
