"use client";
import React, { useState, useEffect } from "react";
import { INewsStats } from "@/interface/INews";
import { FaNewspaper, FaEye, FaHeart, FaComment, FaCheckCircle, FaEdit } from "react-icons/fa";

const NewsStats: React.FC = () => {
  const [stats, setStats] = useState<INewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Không thể lấy thống kê');
        }
      } catch (error) {
        setError('Lỗi kết nối');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Tổng tin tức",
      value: stats.total,
      icon: FaNewspaper,
      color: "bg-blue-500",
      textColor: "text-blue-500"
    },
    {
      title: "Đã xuất bản",
      value: stats.published,
      icon: FaCheckCircle,
      color: "bg-green-500",
      textColor: "text-green-500"
    },
    {
      title: "Tin nháp",
      value: stats.draft,
      icon: FaEdit,
      color: "bg-yellow-500",
      textColor: "text-yellow-500"
    },
    {
      title: "Lượt xem",
      value: stats.views.toLocaleString(),
      icon: FaEye,
      color: "bg-purple-500",
      textColor: "text-purple-500"
    },
    {
      title: "Lượt thích",
      value: stats.likes.toLocaleString(),
      icon: FaHeart,
      color: "bg-red-500",
      textColor: "text-red-500"
    },
    {
      title: "Bình luận",
      value: stats.comments.toLocaleString(),
      icon: FaComment,
      color: "bg-indigo-500",
      textColor: "text-indigo-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-full`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Progress bar cho các chỉ số quan trọng */}
          {index < 3 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Tiến độ</span>
                <span>
                  {index === 0 ? '100%' : 
                   index === 1 ? `${stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%` :
                   `${stats.total > 0 ? Math.round((stats.draft / stats.total) * 100) : 0}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${stat.color} h-2 rounded-full transition-all duration-300`}
                  style={{ 
                    width: index === 0 ? '100%' : 
                           index === 1 ? `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%` :
                           `${stats.total > 0 ? (stats.draft / stats.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NewsStats;
