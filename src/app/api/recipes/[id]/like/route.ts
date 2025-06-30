import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Recipe from '@/models/Recipe';
import { authMiddleware } from '@/middleware/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request);
    if (authResult.status !== 200) {
      return authResult;
    }
    
    await dbConnect();
    
    const user = (request as any).user;
    
    // Find recipe
    const recipe = await Recipe.findById(params.id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    // Check if user already liked the recipe
    const isLiked = recipe.likes.includes(user._id);
    
    if (isLiked) {
      // Unlike
      await Recipe.findByIdAndUpdate(params.id, {
        $pull: { likes: user._id }
      });
      
      return NextResponse.json({
        message: 'Recipe unliked successfully',
        liked: false,
      });
    } else {
      // Like
      await Recipe.findByIdAndUpdate(params.id, {
        $addToSet: { likes: user._id }
      });
      
      return NextResponse.json({
        message: 'Recipe liked successfully',
        liked: true,
      });
    }
    
  } catch (error: any) {
    console.error('Like recipe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to like/unlike recipe' },
      { status: 500 }
    );
  }
} 