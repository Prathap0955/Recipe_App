import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/admin';
import dbConnect from '@/lib/db';
import Recipe from '@/models/Recipe';

async function handler(request: NextRequest, { params }: { params: { id: string } }) {
  if (request.method !== 'DELETE') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    await dbConnect();
    
    const recipe = await Recipe.findByIdAndDelete(params.id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}

export const DELETE = withAdmin(handler);

