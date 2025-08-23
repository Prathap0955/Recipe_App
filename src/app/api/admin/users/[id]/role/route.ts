import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/admin';
import dbConnect from '@/lib/db';
import User from '@/models/User';

async function handler(request: NextRequest, { params }: { params: { id: string } }) {
  if (request.method !== 'PATCH') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { role } = await request.json();
    
    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "admin"' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const user = await User.findByIdAndUpdate(
      params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

export const PATCH = withAdmin(handler);

