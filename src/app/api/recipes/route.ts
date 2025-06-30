import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Recipe from '@/models/Recipe';
import { authMiddleware } from '@/middleware/auth';

// GET - List all recipes with optional filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const difficulty = searchParams.get('difficulty') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (cuisine) {
      query.cuisine = cuisine;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    // Get recipes with author information
    const recipes = await Recipe.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Recipe.countDocuments(query);
    
    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error: any) {
    console.error('Get recipes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST - Create new recipe (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request);
    if (authResult.status !== 200) {
      return authResult;
    }
    
    await dbConnect();
    
    const user = (request as any).user;
    const recipeData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'ingredients', 'instructions', 'cookingTime', 'servings', 'cuisine'];
    for (const field of requiredFields) {
      if (!recipeData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create recipe with author
    const recipe = await Recipe.create({
      ...recipeData,
      author: user._id,
    });
    
    // Populate author information
    await recipe.populate('author', 'name avatar');
    
    return NextResponse.json({
      message: 'Recipe created successfully',
      recipe,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Create recipe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create recipe' },
      { status: 500 }
    );
  }
} 