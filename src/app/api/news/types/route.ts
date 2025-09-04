import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy danh sách các loại tin tức
export async function GET(request: NextRequest) {
  try {
    // Lấy danh sách các loại tin tức từ bảng news
    const sql = `
      SELECT DISTINCT 
        n.type,
        COUNT(n.id) as count
      FROM news n
      WHERE n.deletedAt IS NULL AND n.type IS NOT NULL AND n.type != ''
      GROUP BY n.type
      ORDER BY count DESC, n.type ASC
    `;
    
    const types = await query(sql);
    
    // Lấy danh sách các phân loại từ bảng categories
    const categoriesSql = `
      SELECT 
        c.id, c.name, c.description, c.color, c.icon,
        COUNT(n.id) as newsCount
      FROM categories c
      LEFT JOIN news n ON c.id = n.category_id AND n.deletedAt IS NULL
      WHERE c.deletedAt IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    
    const categories = await query(categoriesSql);
    
    const formattedTypes = types.map((item: any) => ({
      type: item.type,
      count: item.count,
      label: getTypeLabel(item.type)
    }));
    
    const formattedCategories = categories.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      color: item.color || '#3B82F6',
      icon: item.icon || '📰',
      newsCount: item.newsCount || 0
    }));

    return NextResponse.json({
      types: formattedTypes,
      categories: formattedCategories
    });

  } catch (error) {
    console.error('Error fetching news types:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách loại tin tức', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// Hàm helper để chuyển đổi type thành label tiếng Việt
function getTypeLabel(type: string): string {
  const typeLabels: { [key: string]: string } = {
    'news': 'Tin tức',
    'promotion': 'Khuyến mãi',
    'guide': 'Hướng dẫn',
    'recipe': 'Công thức',
    'health': 'Sức khỏe',
    'lifestyle': 'Lối sống',
    'business': 'Kinh doanh',
    'technology': 'Công nghệ',
    'education': 'Giáo dục',
    'entertainment': 'Giải trí'
  };
  
  return typeLabels[type.toLowerCase()] || type;
}
