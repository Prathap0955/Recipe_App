import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/admin';
import dbConnect from '@/lib/db';
import Recipe from '@/models/Recipe';

async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    await dbConnect();
    
    const recipes = await Recipe.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(handler);

