import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Kiểm tra cấu trúc bảng order
    let orderStructure = null;
    try {
      orderStructure = await query('DESCRIBE `order`');
    } catch (error) {
      orderStructure = { error: 'Table order does not exist' };
    }
    
    // Kiểm tra cấu trúc bảng order_item
    let orderItemStructure = null;
    try {
      orderItemStructure = await query('DESCRIBE order_item');
    } catch (error) {
      orderItemStructure = { error: 'Table order_item does not exist' };
    }
    
    // Kiểm tra dữ liệu mẫu
    let orderSample = null;
    try {
      orderSample = await query('SELECT * FROM `order` LIMIT 3');
    } catch (error) {
      orderSample = { error: 'Cannot fetch order sample' };
    }
    
    let orderItemSample = null;
    try {
      orderItemSample = await query('SELECT * FROM order_item LIMIT 3');
    } catch (error) {
      orderItemSample = { error: 'Cannot fetch order_item sample' };
    }
    
    return NextResponse.json({ 
      message: 'Order tables structure check',
      order: orderStructure,
      orderItem: orderItemStructure,
      orderSample: orderSample,
      orderItemSample: orderItemSample
    });
  } catch (error) {
    console.error('Order tables check error:', error);
    return NextResponse.json({ 
      error: 'Order tables check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

