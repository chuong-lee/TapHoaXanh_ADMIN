import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    if (action === 'approve') {
      const sql = `
        UPDATE rating 
        SET isApproved = 1, isRejected = 0, rejectionReason = NULL, updatedAt = NOW()
        WHERE id = ?
      `;
      await query(sql, [id]);
      
      return NextResponse.json({ message: 'Review approved successfully' });
    }
    
    if (action === 'reject') {
      const sql = `
        UPDATE rating 
        SET isApproved = 0, isRejected = 1, rejectionReason = ?, updatedAt = NOW()
        WHERE id = ?
      `;
      await query(sql, [rejectionReason, id]);
      
      return NextResponse.json({ message: 'Review rejected successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const sql = `DELETE FROM rating WHERE id = ?`;
    await query(sql, [id]);
    
    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
