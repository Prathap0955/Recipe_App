import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Recipe from '@/models/Recipe';
import { authMiddleware } from '@/middleware/auth';

// GET - Get single recipe by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const recipe = await Recipe.findById(params.id)
      .populate('author', 'name avatar bio')
      .populate('likes', 'name avatar');
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ recipe });
    
  } catch (error: any) {
    console.error('Get recipe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// PUT - Update recipe (requires authentication and ownership)
export async function PUT(
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
    const recipeData = await request.json();
    
    // Find recipe and check ownership
    const recipe = await Recipe.findById(params.id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    if (recipe.author.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Not authorized to update this recipe' },
        { status: 403 }
      );
    }
    
    // Update recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      params.id,
      recipeData,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');
    
    return NextResponse.json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe,
    });
    
  } catch (error: any) {
    console.error('Update recipe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE - Delete recipe (requires authentication and ownership)
export async function DELETE(
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
    
    // Find recipe and check ownership
    const recipe = await Recipe.findById(params.id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    if (recipe.author.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Not authorized to delete this recipe' },
        { status: 403 }
      );
    }
    
    // Delete recipe
    await Recipe.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      message: 'Recipe deleted successfully',
    });
    
  } catch (error: any) {
    console.error('Delete recipe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete recipe' },
      { status: 500 }
    );
  }
} 