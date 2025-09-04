import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Lấy dữ liệu hiện tại
    const [currentUsers, currentOrders, currentRevenue] = await Promise.all([
      query('SELECT COUNT(*) as count FROM `users` WHERE deletedAt IS NULL'),
      query('SELECT COUNT(*) as count FROM `order` WHERE deletedAt IS NULL'),
      query('SELECT SUM(total_price) as total FROM `order` WHERE deletedAt IS NULL AND total_price IS NOT NULL')
    ]);

    // Lấy dữ liệu tháng trước để so sánh
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const [lastMonthUsers, lastMonthOrders, lastMonthRevenue] = await Promise.all([
      query('SELECT COUNT(*) as count FROM `users` WHERE deletedAt IS NULL AND MONTH(createdAt) = ? AND YEAR(createdAt) = ?', [lastMonth.getMonth() + 1, lastMonth.getFullYear()]),
      query('SELECT COUNT(*) as count FROM `order` WHERE deletedAt IS NULL AND MONTH(createdAt) = ? AND YEAR(createdAt) = ?', [lastMonth.getMonth() + 1, lastMonth.getFullYear()]),
      query('SELECT SUM(total_price) as total FROM `order` WHERE deletedAt IS NULL AND total_price IS NOT NULL AND MONTH(createdAt) = ? AND YEAR(createdAt) = ?', [lastMonth.getMonth() + 1, lastMonth.getFullYear()])
    ]);

    // Tính toán tỷ lệ phần trăm thay đổi
    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const metrics = {
      users: {
        current: currentUsers[0]?.count || 0,
        previous: lastMonthUsers[0]?.count || 0,
        percentageChange: calculatePercentageChange(
          currentUsers[0]?.count || 0,
          lastMonthUsers[0]?.count || 0
        )
      },
      orders: {
        current: currentOrders[0]?.count || 0,
        previous: lastMonthOrders[0]?.count || 0,
        percentageChange: calculatePercentageChange(
          currentOrders[0]?.count || 0,
          lastMonthOrders[0]?.count || 0
        )
      },
      revenue: {
        current: currentRevenue[0]?.total || 0,
        previous: lastMonthRevenue[0]?.total || 0,
        percentageChange: calculatePercentageChange(
          currentRevenue[0]?.total || 0,
          lastMonthRevenue[0]?.total || 0
        )
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error getting metrics overview:', error);
    return NextResponse.json({
      users: { current: 0, previous: 0, percentageChange: 0 },
      orders: { current: 0, previous: 0, percentageChange: 0 },
      revenue: { current: 0, previous: 0, percentageChange: 0 }
    });
  }
}

