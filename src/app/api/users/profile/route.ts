import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Recipe from '@/models/Recipe';
import { authMiddleware } from '@/middleware/auth';

// GET - Get user profile with recipes
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request);
    if (authResult.status !== 200) {
      return authResult;
    }
    
    await dbConnect();
    
    const user = (request as any).user;
    
    // Get user's recipes
    const recipes = await Recipe.find({ author: user._id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    
    // Get user's liked recipes
    const likedRecipes = await Recipe.find({ likes: user._id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    
    const userProfile = {
      ...user.toObject(),
      recipes,
      likedRecipes,
      recipeCount: recipes.length,
      likedCount: likedRecipes.length,
    };
    
    return NextResponse.json({ user: userProfile });
    
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request);
    if (authResult.status !== 200) {
      return authResult;
    }
    
    await dbConnect();
    
    const user = (request as any).user;
    const updateData = await request.json();
    
    // Only allow updating certain fields
    const allowedFields = ['name', 'bio', 'avatar'];
    const filteredData: any = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password');
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
    
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
} 