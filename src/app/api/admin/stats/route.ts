import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/admin';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Recipe from '@/models/Recipe';

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    await dbConnect();
    
    const [totalUsers, totalRecipes, totalLikes, blockedUsers] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      Recipe.aggregate([
        {
          $group: {
            _id: null,
            totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } }
          }
        }
      ]),
      User.countDocuments({ isBlocked: true })
    ]);
    
    const stats = {
      totalUsers,
      totalRecipes,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      blockedUsers,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(handler);
