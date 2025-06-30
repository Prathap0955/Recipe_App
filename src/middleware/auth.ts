import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function authMiddleware(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = extractTokenFromHeader(authHeader);
    const payload = verifyToken(token);
    
    await dbConnect();
    
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Add user to request context
    (request as any).user = user;
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const authResult = await authMiddleware(request);
    
    if (authResult.status !== 200) {
      return authResult;
    }
    
    return handler(request);
  };
} 